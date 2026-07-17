# Contributing to DokanDaftar

Production-style Git workflow for this repo. **Do not push feature work straight to `main`.**

## Branch naming

| Prefix | Use for |
|--------|---------|
| `feat/` | New functionality |
| `fix/` | Bug fixes |
| `chore/` | Tooling, deps, cleanup |
| `docs/` | Documentation only |
| `refactor/` | Code reshaping without behavior change |

Examples: `feat/sales-overlay`, `fix/login-redirect`, `chore/ci-frontend`.

Create a branch from an up-to-date `main`:

```bash
git checkout main
git pull origin main
git checkout -b feat/your-short-name
```

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(frontend): add sales create overlay
fix(auth): redirect login to dashboard
chore: add pull request template
```

Scopes we use often: `frontend`, `backend`, `auth`, `sales`, `dashboard`.

Prefer small, focused commits. You own the commit author — commit locally yourself when you want a human author.

## Local checks (before PR)

From the repo root:

```bash
chmod +x scripts/verify.sh   # once
./scripts/verify.sh
```

Or frontend only:

```bash
cd frontend && npm run verify
```

## Pull requests

1. Push your branch: `git push -u origin HEAD`
2. Open a PR into `main` (GitHub fills the PR template)
3. Fill **Summary**, **Test plan**, and any UI screenshots
4. Wait for CI jobs **Frontend** and **Backend** to pass
5. Squash or merge only after the checklist is done

Suggested title format: same as a conventional commit subject, e.g. `feat(frontend): protect dashboard routes`.

## Reviews

- Prefer at least one review (human and/or AI Bugbot / security review) before merging to `main`
- Address comments or explain why you won’t change something
- Do not use `--force` on `main`

## Branch protection (maintainers)

On GitHub → **Settings → Branches → Add rule** for `main`:

- Require a pull request before merging
- Require approvals: **1** (optional but recommended)
- Require status checks to pass: **Frontend**, **Backend**
- Do not allow bypassing the above for admins (recommended)
- Restrict force pushes and deletions

Re-auth CLI if needed: `gh auth refresh -h github.com`
