# Contributing to VoicePrompter

This repo uses a lightweight branching model to keep `main` stable while allowing fast iteration.

## Branching Model (TL;DR)
- `main` — **protected**, production-ready. Only merge via PR.
- `dev` — integration branch for day-to-day work (optional but recommended).
- `feature/<slug>` — new work (MVP slices, experiments).
- `release/<version>` — prep releases (optional for milestone builds).
- `hotfix/<slug>` — emergency fixes off `main`.

### Create branches
```bash
# one-time
git checkout -b dev && git push -u origin dev

# for a task/feature
git checkout -b feature/cadence-vad dev
# ...commit, push...
git push -u origin feature/cadence-vad
```

### Merge policy
- Feature → `dev` via PR, squash-merge preferred.
- `dev` → `main` via PR when stable.
- Hotfixes: branch from `main`, PR back to `main` **and** `dev`.

## Commit Messages
Use short, descriptive messages. Conventional Commits are encouraged (optional):
```
feat: add VAD gap detection for cue scheduler
fix: correct audio session category on iOS
docs: add setup instructions
chore: bump deps
```
This helps with auto-changelogs later.

## Pull Requests
- Keep PRs small and focused (<= ~300 lines when possible).
- Include a clear summary and testing notes.
- Link issues or TODOs if applicable.
- Passing build/tests required before merge (when CI is added).

## Code Style
- TypeScript in RN; Swift/Kotlin for native.
- Prefer pure functions for RN business logic.
- Keep audio-critical timing **in native** (Swift/Kotlin).

## Directory Conventions
- `app/src/screens` — RN screens
- `app/src/lib` — shared logic (audio bridge, asr, nlp, types, store)
- `app/ios/AudioCoach` — iOS native module
- `app/android/audiocoach` — Android native module
- `app/src/data` — sample JSON and fixtures

## Release Tags
- Tag stable points on `main`:
```bash
git checkout main
git pull
git tag -a v0.1.0 -m "MVP scaffold with native stubs"
git push origin v0.1.0
```

## Branch Protection (GitHub)
Manually configure on GitHub (Repo → Settings → Branches):
- Protect `main`:
  - Require PRs before merging
  - Require at least 1 approval
  - Dismiss stale reviews on new commits
  - Require status checks to pass (enable once CI exists)
- Optionally protect `dev` similarly.

## Getting Started (Dev)
See `SETUP.md` for quick-start, `README.md` for roadmap.
