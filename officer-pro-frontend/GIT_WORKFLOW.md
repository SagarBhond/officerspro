# Frontend Git workflow

Use a short lived branch for each frontend change. Open a pull request into `main`; merge only after review and a successful production build. A push to `main` triggers `.github/workflows/frontend-ecr.yml`, which builds the Docker image, publishes it to Amazon ECR, and deploys the immutable commit image to the frontend EC2 instance over AWS Systems Manager.

## 1. Start from an up-to-date `main`

Run these commands from the frontend repository root:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/<ticket>-<short-description>
```

Use `bugfix/<ticket>-<short-description>` for a bug fix. Keep branch names lowercase and use hyphens, for example `feature/123-investigation-filter`.

## 2. Make and check the change

Before committing, inspect the changed files and build the frontend:

```powershell
npm ci
npm run build
git status --short
git diff --check
git diff
```

This repository currently defines `dev`, `build`, and `preview` npm scripts; it does not define a test or lint script. Run any relevant manual checks for the page or flow you changed.

Do not commit local credentials or machine-specific settings. Review `.env` carefully before staging it; Vite variables are embedded in the built frontend and must not contain secrets. Stage intended files explicitly rather than using `git add .`:

```powershell
git add src/path/to/changed-file.tsx
git diff --cached
git commit -m "feat: describe the frontend change"
```

Use a concise imperative commit subject. Suggested prefixes are `feat:`, `fix:`, `refactor:`, `docs:`, and `chore:`.

## 3. Push and open a pull request

```powershell
git push -u origin HEAD
```

Open a pull request from your branch into `main`. Include:

- What changed and why.
- The pages or user flows affected.
- Build and manual check results.
- Screenshots for visible UI changes.

Address review feedback on the same branch, rerun the build, and push the follow-up commit(s). Keep the pull request focused and resolve merge conflicts before merging.

## 4. Merge and deploy

After approval and required checks, merge the pull request into `main`. The workflow pushes the commit-SHA and `latest` image tags, then sends `scripts/deploy-frontend-on-instance.sh` to EC2 through Systems Manager. That script checks the candidate image before replacing the running container and restores the previous image if the replacement fails its health check.

Before deployment, configure the repository:

- Secret `AWS_ECR_PUSH_ROLE_ARN`: Terraform output `frontend_github_actions_role_arn`; use GitHub OIDC, not an AWS access-key/password pair.
- Variable `AWS_REGION`: the ECR/EC2 region (default `ap-south-1`).
- Variable `FRONTEND_EC2_INSTANCE_ID`: Terraform output `frontend_instance_id`.

The Terraform configuration must already be applied and the EC2 instance must be online and registered with Systems Manager. Check the full Actions run before considering deployment complete; a successful image push without a successful SSM deployment is not a completed release.

## 5. Sync or discard local work

After merge, update the local branch:

```powershell
git switch main
git pull --ff-only origin main
git branch -d feature/<ticket>-<short-description>
```

If the local branch has diverged from `main`, rebase only your own unshared commits:

```powershell
git fetch origin
git rebase origin/main
```
