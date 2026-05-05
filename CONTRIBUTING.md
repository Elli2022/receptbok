# Contributing

## Workflow

1. Create a branch from `master`, for example:
   - `feature/<short-description>`
   - `fix/<short-description>`
2. Keep commits focused and descriptive.
3. Run checks locally before opening a PR:

```bash
cd frontend
npm ci
npm run lint
npm run build
```

4. Open a pull request to `master`.
5. Use a merge commit to preserve branch history.
6. Delete the branch after merge.

## Commit Guidance

- Use present tense: `Add`, `Fix`, `Improve`, `Refactor`.
- Keep first line concise and meaningful.
- Explain why in PR description if change is not obvious.
