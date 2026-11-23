# Security

Files in this catalogue run inside people's games, so a bad entry is treated as a security problem.

## Reporting

- **An entry that looks malicious or harmful:** use GitHub's private vulnerability reporting on this repository
  (Security tab, "Report a vulnerability"), or email [mykola@everyvr.net](mailto:mykola@everyvr.net). Name the game folder and say what the
  file does.
- **A way around the checks** (CI, the schema, PortXR's script sandbox): report it the same way. Do not open a
  public issue for either.
- An entry that simply does not work is not a security problem: open a normal issue.

You get an answer within 7 days.

## What happens to a reported entry

1. The entry is removed from `main` at once, which removes its page and its files from the site at the next build.
2. The files and the pull request that added them are reviewed.
3. If it was harmful: the entry stays out, its author can no longer contribute, and the game's page says the entry
   was withdrawn and why. If it was a false alarm, it comes back.

## What protects players

- Scripts run in PortXR's sandbox: no file access, no programs, no network, and a script that loops is stopped.
- Every pull request needs the maintainer's approval (`CODEOWNERS`), and CI rejects binaries, archives, unknown
  file types, oversized files and packed code.
- CI checks a pull request with the validator from the main branch and only reads the pull request's files, so a
  change cannot loosen its own check or run code in CI. Symbolic links and hidden text are rejected.
- The site checks every entry again before it reads a file, and stops its build on a bad one.
- The site shows the SHA-256 of every published file, so a download can be checked against this repository.

## To set on GitHub

- Branch protection on `main`: require a pull request with the code owner's approving review, require the
  `Validate entries / validate` check, block force pushes and deletions, include administrators.
- Enable private vulnerability reporting, Dependabot alerts and secret scanning with push protection.
