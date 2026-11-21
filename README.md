# Twitch-Chinchilla-Technik

Eigenständiges Branding- und Zuschauer-Website-Projekt für den Twitch-Kanal
**derBaLu84** — Thema: Chinchillas & Technik, verspielt und persönlich.

Wichtig: Dieses Projekt ist **komplett getrennt** von `Balu-Streamstudio` /
`OBS-Streaming`. Diese beiden laufen für dich bereits perfekt und wurden
hier nicht angefasst — sie dienten nur als Stil-Inspiration (Farben,
Overlay-Konventionen 1920×1080, "Mandeln"-Bauchbinden-Idee).

## Was hier drin ist

- `assets/` — Maskottchen (naturgetreu gezeichnetes graues Chinchilla mit
  Brille &amp; Headset, siehe `reference/` für die Foto-Quellen), Icon-Version,
  `chinchilla-pixel.svg` (8-Bit-Variante fürs "Night Arcade"-Motto, per
  `generate-pixel-mascot.mjs` erzeugt), Mandel-Icon, Technik-Icon,
  Farbpalette (`palette.md`). Alles als SVG, beliebig skalierbar.
- `panels/` — 3 fertige Twitch-Info-Panels (320×220, als 2x-PNG gerendert):
  "Über mich", "Die Chinchillas", "Mein Setup" (Technik).
  Die `.html`-Dateien sind die Quelle, `render-panels.sh` erzeugt die PNGs neu.
- `overlays/` — zwei StreamElements-Custom-Widgets:
  - `mandel-alert.html` — Alert bei Sub/Spende/Cheer/Follow ("X hat Y
    Mandeln spendiert!")
  - `chinchilla-ticker.html` — Dauer-Overlay unten links mit rotierenden
    Chinchilla-/Technik-Fakten
- `website/` — statische Zuschauer-Website (GitHub-Pages-fertig):
  Twitch-Embed, Stream-Zeiten, Chinchilla-Steckbriefe, Setup-Vorstellung,
  Mandel-Erklärung, Link-Liste.
- `docs/` — Einrichtungsanleitungen (StreamElements, GitHub Pages, Twitch-Panels,
  Elgato Key Lights, Better-Points-Redemptions, Viewer-Hub, weitere Nilson1489-
  Ideen wie Remotion/Virtual Stream Deck/ControlPlay).
- `emotes/` — 30 animierte Chat-Emotes (GIF, transparent, 112×112px) mit dem
  vermenschlichten Chinchilla-Maskottchen in verschiedenen Emotionen
  (Hype, Love, LOL, Facepalm, Rage, Sleepy, …). Details und Upload-Anleitung
  in `emotes/README.md`.
- `lights-bridge/` — kleiner Node-Dienst, der Stream-Events in Helligkeits-/
  Temperatur-Blitze auf 2 Elgato Key Lights übersetzt.
- `viewer-hub/` — fertiges, aber geparktes Zusatz-Backend (Twitch-Login +
  eigene Rangliste) — Kanal nutzt stattdessen StreamElements-Loyalty als
  einziges Mandel-System, siehe `viewer-hub/README.md`.

## Was schon erledigt ist

GitHub-Repo, GitHub Pages und alle technischen Platzhalter (GitHub-Username,
Pages-Domain) sind bereits eingerichtet — siehe `docs/GITHUB-PAGES-DEPLOY.md`
für den aktuellen Status und Link.

## Was du noch anpassen musst (bewusst als Platzhalter gelassen, weil ich es nicht wissen kann)

- `website/index.html`: Stream-Zeiten, echte Namen/Fotos der drei Chinchillas,
  echte Technik-Produktnamen, Discord-/Social-Links.
- `panels/*.png`: nach dem Hochladen bei Twitch kannst du dort noch je Panel
  eine kurze Beschreibung + Link ergänzen (das kann die Bild-Datei nicht).

## Lokal ansehen

Kein Build nötig, alles ist statisches HTML/SVG. Einfach im Browser öffnen,
z. B.:

```bash
xdg-open website/index.html
xdg-open overlays/mandel-alert.html
```

Panels neu rendern (falls du Texte/Farben in den `.html`-Quellen änderst):

```bash
bash panels/render-panels.sh
```

Nächste Schritte stehen in `docs/GITHUB-PAGES-DEPLOY.md`,
`docs/STREAMELEMENTS-EINRICHTEN.md` und `docs/TWITCH-PANELS-HOCHLADEN.md`.
