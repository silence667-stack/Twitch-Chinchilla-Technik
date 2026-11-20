#!/usr/bin/env bash
# Rendert aus emotes/strips/*.html + manifest.json fertige animierte GIFs
# in emotes/gif/. Ein Chromium-Aufruf pro Emote (Streifen aller Frames),
# danach ImageMagick zum Schneiden und ffmpeg zum GIF-Bau.
set -euo pipefail
cd "$(dirname "$0")"

CHROMIUM="$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)"
if [ -z "$CHROMIUM" ]; then
  echo "Fehler: Kein Chromium/Chrome gefunden." >&2
  exit 1
fi

STRIPS="../strips"
FRAMES="../frames"
GIFDIR="../gif"
mkdir -p "$FRAMES" "$GIFDIR"

LIST="$(mktemp)"
trap 'rm -f "$LIST"' EXIT

node -e '
const m = require("./manifest.json");
for (const e of m) console.log(e.name, e.frames, e.loopMs);
' > "$LIST"

while read -r name frames loopMs; do
  echo "== $name ($frames Frames, ${loopMs}ms Loop) =="

  width=$((frames * 112))
  "$CHROMIUM" --headless --disable-gpu --default-background-color=00000000 \
    --hide-scrollbars --window-size="${width},112" \
    --screenshot="$STRIPS/${name}.png" "file://$(pwd)/$STRIPS/${name}.html" </dev/null 2>/dev/null

  rm -f "$FRAMES/${name}-"*.png
  convert "$STRIPS/${name}.png" -crop 112x112 +repage +adjoin "$FRAMES/${name}-%02d.png"

  actual_frames=$(ls "$FRAMES/${name}-"*.png | wc -l)
  if [ "$actual_frames" -ne "$frames" ]; then
    echo "   Fehler: $actual_frames Frames geschnitten, $frames erwartet (Streifenbreite falsch?)" >&2
    exit 1
  fi

  fps=$(node -e "console.log(($frames*1000/$loopMs).toFixed(3))")

  tmpgif="$GIFDIR/${name}.gif.tmp"
  ffmpeg -y -loglevel error -framerate "$fps" -i "$FRAMES/${name}-%02d.png" \
    -filter_complex "[0:v]split[a][b];[a]palettegen=max_colors=128:reserve_transparent=1:transparency_color=ffffff[p];[b][p]paletteuse=alpha_threshold=128:dither=none:diff_mode=rectangle" \
    -frames:v "$frames" -loop 0 -f gif "$tmpgif" </dev/null
  mv "$tmpgif" "$GIFDIR/${name}.gif"

  size=$(stat -c%s "$GIFDIR/${name}.gif")
  echo "   -> $GIFDIR/${name}.gif ($size bytes)"
done < "$LIST"

echo "Fertig. Dateigroessen:"
ls -la "$GIFDIR"
