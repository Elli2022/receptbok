# Version History

This project now keeps release history in `master` using merge commits from
feature and version branches.

## Imported Version Branches

- `version/0-original` (tip: `06381f2`)
- `version/1-user-library` (tip: `df01927`)
- `version/2-supabase-foundation` (tip: `6b6f935`)
- `version/3-live` (tip: `ef13a59`)

## Imported Feature Branches

Merged through `feature/library-loading-polish` (tip: `34156e9`), which
contains:

- `feature/user-recipe-library`
- `feature/supabase-recipe-library`
- `feature/favorite-recipes-save`
- `feature/favorites-rpc-library-sync`
- `feature/rpc-library-visibility-fix`
- `feature/library-loading-polish`

## Branch Practice

- Use short-lived branches for each feature/fix.
- Open PRs into `master`.
- Prefer merge commits (`--no-ff`) to preserve branch context.
- Tag important milestones (for example `v1.0.0`, `v1.1.0`).
- Delete merged branches after PR completion.
