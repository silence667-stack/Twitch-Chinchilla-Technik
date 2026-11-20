#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -f config.json ]; then
  echo "Fehler: config.json fehlt. Siehe docs/VIEWER-HUB-EINRICHTEN.md" >&2
  exit 1
fi
node server.mjs
