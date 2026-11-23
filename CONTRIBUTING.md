# Adding a game

Thanks for sharing what made a game work. An entry helps every player who tries that game after you.

**Only want to say how a game played?** Use the
[report form](https://github.com/EncidXVII/PortXR-catalogue/issues/new?template=game-report.yml) instead: no files,
no code, and the maintainer adds it to the catalogue. This guide is for scripts and settings.

## What is accepted

- **Offline single-player games.** If the game also has an online mode, set `hasOnlineMultiplayer` to `true`: its
  page then warns players to use the entry in single-player only.
- **No anti-cheat.** Games with EasyAntiCheat, BattlEye or any other kernel or online anti-cheat are not accepted.
  PortXR refuses them too.
- **Entries without files are welcome.** "Plays as it is" and "does not work yet" are useful: rate the mode, leave
  `files` empty and say what you saw in `notes`.

## Steps

1. Copy any folder in `games/` to `games/<game-slug>` (lower case, words joined by hyphens: `hollow-knight`). The
   slug is the page's address and never changes.
2. Fill in `meta.json`. `schema/meta.schema.json` describes every field. The engine, its version and the exe name
   are on the game's page in PortXR; `steamAppId` is the number in the game's Steam store address.
   - `reports`: you, the date, PortXR version, headset, Windows or Linux, display mode and rating, newest first.
     Set `"withFiles": true` when you played with the entry's files. The ratings on the site and in PortXR are
     computed from these reports; there is no rating to set by hand.
   - `issues`: what goes wrong, tagged, with a short note. Mark one `"fixed": true` when your files fix it.
3. Add your files:
   - `settings.cfg`: only the settings that differ from PortXR's defaults, in the form the game's settings file
     uses (`[View]`, `WorldScale = 1.2`).
   - `script.lua`: start it with the header comment (game, engine, PortXR version, tested on, fixes, author).
     PortXR's `SCRIPTING.md` lists every call.
4. Run `npm ci` once, then `npm test`. Fix what it reports.
5. Open a pull request and fill in its checklist.

Changing an entry later: edit the files, raise `version`, set `lastUpdated`, and say in the pull request what
changed and why. PortXR offers players the new files as an update when `version` goes up.

## Turning a report into an entry

A report from the form becomes a line in `reports` (with `issue` set to its number, and `withFiles` if the
player used the entry's files), and its ticked issues update `issues`. The game's ratings follow from the
reports. A new game gets a new folder with `files` left empty. Close the issue with a
link to the commit.

## What CI rejects

- A `meta.json` that does not match the schema, or a slug that is not the folder name.
- Files that are not `.lua`, `.cfg`, `.md` or `.json` (no pictures: the site uses Steam's picture of the game);
  folders inside an entry; anything over the size limit (64 KB for a script).
- Binaries, archives, minified or packed code (a line over 300 characters).
- A file in the folder that `meta.json` does not list.
- Symbolic links, hidden files, and file names with anything but lower-case letters, digits, dots and hyphens.
- Text with invisible or text-reordering characters.
- An issue tied to a display mode nobody reported.

The check that runs on your pull request comes from the main branch, not from your change, and your files are only
read, never run.

CI also prints **review flags** for script lines that deserve a second look: loading code at run time, calling
game functions with `portxr.call`, long encoded strings. A flag does not fail the check. It tells the maintainer
where to read most carefully, and you may be asked why the line is there.

## Review

Every pull request is read and approved by the maintainer before it is merged. Entries with scripts
(`containsCode: true`) are read line by line and tried in the game where possible, so they take longer.

## Licence

TODO: confirm. Proposed: everything in this repository is shared under the
[GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.html), the same licence as PortXR, with the author named in
`meta.json` and in each script's header. By opening a pull request you confirm that you wrote the files or have the
right to share them, as in the [Developer Certificate of Origin 1.1](https://developercertificate.org/).

## Reporting a bad entry

An entry that does harm (breaks saves, does something its notes do not say, targets online play) is taken down
first and discussed second. See [SECURITY.md](SECURITY.md) for how to report one and what happens next.
