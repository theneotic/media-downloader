# Vercel Deployment Status

Background Removex is deployed from the user-owned private GitHub repository at `https://github.com/theneotic/background-removex`.

| Item | Status |
|---|---|
| Vercel project | `background-removex` under the Theonotic team |
| Connected branch | `main` |
| Build command | `pnpm build:client` |
| Output directory | `dist/public` |
| Production URL | `https://background-removex.vercel.app` |
| Verification | Live site loaded with the Background Removex source-selection interface on August 23, 2026 |

The Vercel project is connected to the renamed GitHub repository, so pushes to `main` will create Git-based deployments. Server-side YouTube job execution still requires a separate authorized Linux worker and deployment-specific environment variables before that optional workflow can be used in production.

## Repository Replacement Follow-up

The original repository was deleted and recreated at the user's request to replace checkpoint-authored history with user-authored commits. Vercel now reports `Project Link not found` for the previous Git connection, so the project must be disconnected and re-imported from the replacement `theneotic/background-removex` repository before Git-based deploys resume.

The broken connection was removed and the replacement `theneotic/background-removex` repository was connected successfully on August 23, 2026. Vercel now reports the Git repository as connected, so new commits on `main` are eligible for Git-based deployment again.
