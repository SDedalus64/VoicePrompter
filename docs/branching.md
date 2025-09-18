# Branching Model (VoicePrompter)

## Branch Types
- **main** — protected, stable, release-ready.
- **dev** — integration branch (optional but useful for MVPs).
- **feature/*** — feature or experiment branches.
- **release/*** — release prep (optional).
- **hotfix/*** — urgent fixes from `main`.

## Typical Flows

### New Feature
```bash
git checkout dev
git pull
git checkout -b feature/<slug>
# work, commit, push
git push -u origin feature/<slug>
# open PR: feature/<slug> -> dev
```

### Promote to Main
```bash
git checkout dev
git pull
# ensure green state
# open PR: dev -> main (squash or merge)
```

### Hotfix
```bash
git checkout main
git pull
git checkout -b hotfix/<slug>
# fix, commit, push
git push -u origin hotfix/<slug>
# PR: hotfix/<slug> -> main
# After merge, PR main -> dev (or cherry-pick) to keep branches aligned
```

## Naming
- Use hyphens and short slugs: `feature/azure-tts`, `feature/vad-gap-calc`, `hotfix/ios-audio-session`.

## Commit Style
Adopt Conventional Commits when convenient:
- `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`

## Tags
- Use semantic-ish versions: `v0.1.0`, `v0.2.0` for meaningful checkpoints.
