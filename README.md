# PortXR game catalogue

How each game plays in VR with [PortXR](https://everyvr.net/portxr): one folder per game with a rating for each
display mode, what goes wrong, who played it on which headset, and the script or settings that fix it, if it needs
any. PortXR shows the same on each game's page and installs the files with one click. The site shows every entry at
[everyvr.net/portxr/catalogue](https://everyvr.net/portxr/catalogue), one page per game. Questions about an entry, or a game you want covered: [the EveryVR Discord](https://discord.gg/WkzGQwu2kz).

> **Status: not open yet.** The three `sample-*` entries show the format and are removed when the first real entry
> is merged.

## Two ways to help

- **Played a game? [Say how it went](https://github.com/EncidXVII/PortXR-catalogue/issues/new?template=game-report.yml).**
  A short form, no files or code. "It just works" is the most useful report there is. PortXR's **How did it run?**
  link opens the same form with the game filled in.
- **Wrote a script or settings that fix a game?** Open a pull request: [CONTRIBUTING.md](CONTRIBUTING.md).

## Ratings

Each display mode a game was played in gets one:

| Rating | Means |
| --- | --- |
| **Perfect** | Nothing to fix. |
| **Good** | Small issues you can ignore. |
| **Playable** | Noticeable issues, still finishable. |
| **Broken** | Not playable yet. |

What a game needs (nothing, settings or a script) comes from its files. Known issues are tagged (menus, HUD,
cutscenes, controls, scale, camera, performance, crashes, audio) and marked when the files fix them.

## Layout

```
games/<game-slug>/
  meta.json      what the game is, its ratings, issues and reports, which files belong to it
  script.lua     optional: a PortXR script for this game
  settings.cfg   optional: PortXR settings that suit this game
  README.md      optional: longer notes
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
