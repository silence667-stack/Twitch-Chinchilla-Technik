#!/usr/bin/env bash
# Rendert alle panel-*.html Quellen als 2x-PNG (640x440 Pixel, 320x220 Darstellungsgröße).
set -euo pipefail
cd "$(dirname "$0")"

CHROMIUM="$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)"
if [ -z "$CHROMIUM" ]; then
  echo "Fehler: Kein Chromium/Chrome gefunden (chromium, chromium-browser oder google-chrome)." >&2
  echo "Bitte installieren, dann dieses Skript erneut ausfuehren." >&2
  exit 1
fi

for f in panel-ueber-mich panel-chinchillas panel-technik; do
  "$CHROMIUM" --headless --disable-gpu --force-device-scale-factor=2 \
    --window-size=320,220 --screenshot="${f}.png" "file://$(pwd)/${f}.html"
  echo "fertig: ${f}.png"
done
