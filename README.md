# PortXR game catalogue

What each game needs to play well in VR with [PortXR](https://everyvr.net/portxr): one folder per game with a
status, the headsets it was tested on, and the script or settings that fix it. The site shows every entry at
[everyvr.net/portxr/catalogue](https://everyvr.net/portxr/catalogue), one page per game. Questions about an entry, or a game you want covered: [the EveryVR Discord](https://discord.gg/WkzGQwu2kz).

> **Status: not open yet.** The three `sample-*` entries show the format and are removed when the first real entry
> is merged.

## Layout

```
games/<game-slug>/
  meta.json      what the game is, its status, who tested it, which files belong to it
  script.lua     optional: a PortXR script for this game
  settings.cfg   optional: PortXR settings that suit this game
  README.md      optional: longer notes
  cover.jpg      optional: a picture you have the right to share
schema/meta.schema.json   the rules for meta.json
tools/validate.mjs        what CI runs on every pull request
```

## Rules in short

- **Single-player only.** No game with anti-cheat is accepted. A game with an online mode gets a warning on its
  page, and the entry is for its single-player mode.
- **Settings before scripts.** If a setting fixes it, use `settings.cfg`. A script is for what settings cannot do.
- **Scripts are plain, readable Lua.** They run in PortXR's sandbox (no files, no programs, no network). Minified
  or packed code is rejected by CI, and every script is read by the maintainer before it is merged.
- **Every change goes through a pull request** that the maintainer approves. A merge rebuilds the site.

How to add or change an entry: [CONTRIBUTING.md](CONTRIBUTING.md). Reporting a bad entry:
[SECURITY.md](SECURITY.md).

## Checking an entry on your machine

```bash
npm ci
```

```bash
npm test
```

`npm run sums` also prints the SHA-256 of every published file, the same values the site shows on a game's page.
