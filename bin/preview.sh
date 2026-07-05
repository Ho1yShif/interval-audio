#!/usr/bin/env bash
# Serve the site locally.
#
#   bin/preview.sh            Vite dev server with hot reload (HMR) — edits to
#                             source files update the browser instantly.
#
#   bin/preview.sh prod       Build the static site and serve dist/. This mirrors
#                             what ships to production, so there is NO hot reload.
#
# Extra args are forwarded to the underlying npm script, e.g.
#   bin/preview.sh -- --port 4000
#   bin/preview.sh prod -- --port 4000
#
# The site is served at the root path (base "/" in vite.config.js, matching the
# custom domain interval-audio.com), so it lives at bare http://localhost:<port>/.
# Vite prints the full URL on startup.
set -euo pipefail

cd "$(dirname "$0")/.."

npm install

if [[ "${1:-}" == "prod" || "${1:-}" == "build" ]]; then
  shift
  npm run build
  npm run preview "$@"
else
  npm run dev "$@"
fi
