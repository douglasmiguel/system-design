# Production deployment

GitHub Actions builds and verifies the static site, then deploys the exact build
artifact to the BeeDev server. Pull requests run CI only. Pushes to `main` and
manual workflow runs started from `main` deploy production.

## Production target

| Setting | Value |
| --- | --- |
| URL | `https://system-design.douglasmiguel.com.br/` |
| SSH host | `172.233.24.151` |
| SSH port | `22` |
| SSH user | `beedev` |
| Nginx document root | `/home/beedev/projects/system-design` |

The non-sensitive target configuration is stored in
`.github/workflows/deploy-production.yml` so that a changed server target is
reviewed like any other code change.

## Required GitHub secrets

Create a GitHub environment named `production` and add these environment
secrets:

| Secret | Value |
| --- | --- |
| `PROD_SSH_PRIVATE_KEY` | Private half of the dedicated GitHub Actions Ed25519 key |
| `PROD_SSH_KNOWN_HOSTS` | Pinned SSH host-key entry for `172.233.24.151` |

The private key must never be committed. Its public half must be installed in
`/home/beedev/.ssh/authorized_keys` on the BeeDev server.

The deploy directory must contain `.github-deploy-target` with exactly this
content:

```text
douglasmiguel/system-design
```

The workflow verifies this marker before running `rsync --delete-delay`. This
prevents a mistyped deployment path from deleting files in another project.

## Pipeline flow

1. Install dependencies with `npm ci`.
2. Generate the minified Tailwind CSS with `npm run build:css`.
3. Fail when the generated `styles.css` differs from the committed file.
4. Package only the public static files and downloads.
5. Upload the package as a short-lived GitHub Actions artifact.
6. Verify the SSH key, pinned host key, writable directory, and deployment marker.
7. Synchronize the artifact to the existing Nginx document root.
8. Verify the deployed files and request the production HTTPS URL.

Production deployments are serialized so two workflow runs cannot write to the
server concurrently. The workflow condition and the GitHub `production`
environment both restrict deployment to the `main` branch.

## First-run checklist

1. Install the dedicated Actions public key on the BeeDev server.
2. Create the deployment-target marker on the server.
3. Create the `production` environment and its two secrets in GitHub.
4. Run the workflow manually.
5. Confirm the deployment job and public HTTPS check pass.

## Rollback

The current workflow synchronizes directly into the existing static document
root. To roll back, use Git to revert the bad commit and push the revert to
`main`; the workflow will redeploy the previous files. Because this site has no
database or runtime-generated uploads, no server-side data rollback is needed.
