// Checks every entry under games/. Run by CI on each pull request and by `npm test`.
//
//   node tools/validate.mjs [--root DIR] [--sums]
//
// --root is the folder that holds games/ (default: this repository). CI passes the pull request's checkout there
// and runs this file from the main branch, so a pull request cannot change the rules it is checked by.
// The files of an entry are only ever read as data; nothing from an entry is run.
//
// Errors fail the check. Review flags do not: they point the maintainer, who reads every script, at the lines to
// read first.
import { createHash } from 'node:crypto';
import { appendFileSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined);
const root = resolve(arg('--root') ?? join(here, '..'));

// The schema always comes from beside this file, never from the folder being checked.
const schema = JSON.parse(readFileSync(join(here, '..', 'schema', 'meta.schema.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const valid = ajv.compile(schema);

// What may sit in an entry's folder, and how big it may be. Anything else is an error: no binaries, no archives.
const LIMITS = { '.lua': 64 * 1024, '.cfg': 16 * 1024, '.json': 16 * 1024, '.md': 16 * 1024, '.jpg': 300 * 1024, '.png': 300 * 1024, '.webp': 300 * 1024 };
const TEXT = new Set(['.lua', '.cfg', '.json', '.md']);
const NAME = /^[a-z0-9][a-z0-9._-]*$/;
const EXTRA = /^(meta\.json|README\.md|cover\.(jpg|png|webp))$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_LINE = 300; // longer lines are minified or packed code
// A picture has to start like the kind of picture its name says it is.
const MAGIC = {
  '.jpg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  '.webp': (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
};

// Scripts run in PortXR's sandbox (no files, no programs, no network). These still get a second look.
const FLAGS = [
  [/\b(load|loadstring|dofile|loadfile|require)\s*[("']/, 'loads code at run time'],
  [/\b(os|io|debug|package|coroutine)\s*\./, 'uses a library the sandbox does not offer'],
  [/\bstring\.dump\b|\b(getfenv|setfenv|rawset|rawget|setmetatable|getmetatable)\b/, 'reaches into the runtime'],
  [/\b_G\b|\b_ENV\b/, 'touches the global table'],
  [/portxr\.call\s*\(/, 'calls a game function (Unreal: can run console commands)'],
  [/portxr\.key\s*\(/, 'reads the keyboard'],
  [/https?:\/\/|\b\d{1,3}(\.\d{1,3}){3}\b/, 'contains an address'],
  [/[A-Za-z0-9+/=]{120,}/, 'a long packed string'],
  [/\\x[0-9a-fA-F]{2}|\\[0-9]{3}|\\u\{/, 'escaped bytes in a string'],
  [/\bstring\.char\b|\.\.\s*string\.rep\b/, 'builds text from character codes'],
];

const errors = [];
const flags = [];
const sums = [];
const games = join(root, 'games');
const entries = readdirSync(games);

for (const slug of entries) {
  const dir = join(games, slug);
  const fail = (text) => errors.push(`games/${slug}: ${text}`);
  // lstat, never stat: a symbolic link is refused instead of followed, here and for every file below.
  if (!lstatSync(dir).isDirectory()) {
    fail('only folders may sit in games/');
    continue;
  }
  if (!SLUG.test(slug)) {
    fail('the folder name must be lower-case words joined by hyphens');
    continue;
  }
  const present = readdirSync(dir);
  const plain = (name) => lstatSync(join(dir, name)).isFile();
  if (!present.includes('meta.json') || !plain('meta.json')) {
    fail('meta.json is missing');
    continue;
  }
  let meta;
  try {
    meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'));
  } catch (e) {
    fail(`meta.json: ${e.message}`);
    continue;
  }
  if (!valid(meta)) for (const e of valid.errors) fail(`meta.json${e.instancePath} ${e.message}`);
  if (meta.slug !== slug) fail(`slug "${meta.slug}" is not the folder name`);
  const listed = new Set((Array.isArray(meta.files) ? meta.files : []).map((f) => f?.path));
  for (const path of listed) if (!present.includes(path)) fail(`${path} is listed in meta.json but missing`);
  if (meta.containsCode !== [...listed].some((path) => String(path).endsWith('.lua'))) fail('containsCode must be true exactly when a .lua file is listed');

  for (const name of present) {
    const file = join(dir, name);
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
    const stat = lstatSync(file);
    if (stat.isSymbolicLink()) {
      fail(`${name}: symbolic links are not accepted`);
      continue;
    }
    if (!stat.isFile()) {
      fail(`${name}: folders are not allowed inside an entry`);
      continue;
    }
    if (!EXTRA.test(name) && !NAME.test(name)) fail(`${name}: file names are lower-case letters, digits, dots and hyphens`);
    if (!(ext in LIMITS)) {
      fail(`${name}: this kind of file is not accepted`);
      continue;
    }
    if (!listed.has(name) && !EXTRA.test(name)) fail(`${name}: not listed in meta.json`);
    if (stat.size > LIMITS[ext]) {
      fail(`${name}: ${stat.size} bytes, the limit is ${LIMITS[ext]}`);
      continue;
    }
    const bytes = readFileSync(file);
    if (TEXT.has(ext)) {
      if (bytes.includes(0)) fail(`${name}: not a text file`);
      const text = bytes.toString('utf8');
      if (text.includes('�')) fail(`${name}: not valid UTF-8`);
      // Characters that hide or reorder text: a script must read the way it runs.
      if (/[​-‏‪-‮⁦-⁩﻿]/.test(text)) fail(`${name}: contains invisible or text-reordering characters`);
      text.split(/\r?\n/).forEach((line, i) => {
        if (line.length > MAX_LINE) fail(`${name}:${i + 1}: a line of ${line.length} characters; minified or packed files are not accepted`);
        if (ext === '.lua') for (const [pattern, why] of FLAGS) if (pattern.test(line)) flags.push(`games/${slug}/${name}:${i + 1}: ${why}`);
      });
    } else if (!MAGIC[ext](bytes)) {
      fail(`${name}: not a ${ext.slice(1)} picture`);
    }
    if (listed.has(name)) sums.push(`${createHash('sha256').update(bytes).digest('hex')}  games/${slug}/${name}`);
  }
}

if (process.argv.includes('--sums')) console.log(sums.join('\n'));
if (flags.length) console.log(`Review flags (read these lines before merging):\n${flags.join('\n')}\n`);
// On GitHub the same lists go on the run's summary page, where the maintainer sees them without opening the log.
if (process.env.GITHUB_STEP_SUMMARY) {
  const list = (title, lines) => (lines.length ? `### ${title}\n\n${lines.map((l) => `- \`${l.replaceAll('`', "'")}\``).join('\n')}\n\n` : '');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, list('Problems', errors) + list('Review flags: read these lines before merging', flags) || 'No problems, no review flags.\n');
}
if (errors.length) {
  console.error(`${errors.length} problem(s):\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`${entries.length} entries are valid.`);
