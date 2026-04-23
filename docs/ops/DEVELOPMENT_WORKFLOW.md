# Development Workflow SOP

This document is the operational source of truth for branch-based development, review, and production shipping.

For Naya-specific operator details, also read:

- [OPERATOR_ACCESS_AND_DEPLOY_SOP.md](./OPERATOR_ACCESS_AND_DEPLOY_SOP.md)

## 1) Governance Rules

1. `main` is release-only.
2. No direct coding on `main`.
3. Every change starts from a GitHub Issue.
4. Every Issue maps to one feature/fix branch.
5. Every branch merges through a PR after CI passes.
6. `main` must remain branch-protected on GitHub.

## 2) Branch Naming

Use one of:

- `feat/<issue-number>-<short-name>`
- `fix/<issue-number>-<short-name>`
- `chore/<issue-number>-<short-name>`
- `docs/<issue-number>-<short-name>`
- `refactor/<issue-number>-<short-name>`
- `test/<issue-number>-<short-name>`

Examples:

- `feat/1-web-public-scaffold`
- `fix/12-lead-form-validation`

## 3) Start-of-Task Procedure

1. Create Issue with clear scope and acceptance criteria.
2. Sync local:
   - `git checkout main`
   - `git pull origin main`
3. Create branch:
   - `git checkout -b feat/<issue-number>-<short-name>`
4. Record the implementation scope in the issue before coding:
   - architectural goal
   - files and surfaces in scope
   - validation plan
   - deploy impact

## 4) Development and Commit Discipline

1. Keep commits atomic and scoped.
2. Use commit messages with issue reference:
   - `feat: add hero section to homepage (refs #1)`
3. Create checkpoint commits frequently.
4. Push feature branches frequently so work is recoverable.

## 5) PR and Review Protocol

1. Open PR to `main`.
2. PR description must include issue linkage:
   - `Closes #<id>` or `Refs #<id>`.
3. Use `.github/pull_request_template.md` without deleting required sections.
4. At least one human approval is required before merge.
5. Wait for `build-and-test` and `release-artifacts` checks to pass before merge.
6. Review any AI-agent PR feedback the same way you would human review feedback:
   - resolve blocking findings in code
   - document any deliberate override in the PR body
   - do not merge while blocking findings remain open
7. If another contributor merged first, rebase and rerun checks.

## 6) Multi-Branch Conflict Control

When multiple feature branches are active:

1. Rebase from latest `main` before final review:
   - `git fetch origin`
   - `git rebase origin/main`
2. Resolve conflicts in branch, rerun tests, push.
3. Merge one PR at a time after CI green.

## 7) Release to Production

1. Merge approved PR into `main`.
2. PR workflows build candidate release artifacts for changed services.
3. Deploy workflow promotes prebuilt artifacts and deploys changed services via SSH.
4. Validate smoke checks:
   - `shasvata.com`
   - `api.shasvata.com/health`
   - `app.shasvata.com`
5. After deployment, SSH into the VPS deployment target and confirm:
   - use `ssh nivi`, not `ssh naya`, for Docker and deploy verification
   - the expected compose stack is running
   - the deployed images match the intended SHA/tags
   - the `.env` image pins match the intended release if any manual service recreate was needed
   - service logs do not show startup regressions
6. If deploy fails, use `deploy-catchup.yml` or `deploy-fallback-ssh.yml`.
7. If a manual VPS hotfix was required, codify it back into the repo immediately with a follow-up issue and PR.

## 8) Required Local Validation Before PR

Run what applies to your change:

- API tests: `cd services/api && npm test`
- API typecheck: `cd services/api && npm run typecheck`
- Web public build: `cd services/web-public && npm run build`
- Web app build: `cd services/web-app && npm run build`

## 9) AI-Assisted Delivery Loop

When AI agents are used for PR review or implementation suggestions:

1. Treat their output as review input, not as an automatic merge signal.
2. Capture the relevant review findings in the PR body or a linked comment thread.
3. Resolve blockers before merge.
4. If a suggestion is intentionally not adopted, record the reason briefly in the PR.
5. Keep the issue, branch, PR, and deploy verification linked so the delivery trail is auditable.
