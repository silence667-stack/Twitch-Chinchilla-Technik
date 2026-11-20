# Twitch-Panels hochladen

Die drei fertigen Bilder liegen in `panels/`:

- `panel-ueber-mich.png` — "derBaLu84 · Chinchillas &amp; Technik"
- `panel-chinchillas.png` — "Die Crew"
- `panel-technik.png` — "Mein Setup"

## Schritte

1. Auf twitch.tv einloggen, zu deinem Kanal gehen, **"Kanal bearbeiten"**
   (Stift-Symbol unter dem Video-Bereich auf deiner eigenen Kanalseite).
2. Runterscrollen zu **"Panels"** → **"Panel hinzufügen"** → **"Bild hinzufügen"**.
3. Je Panel das passende PNG aus `panels/` hochladen.
4. Für jedes Panel kannst du zusätzlich eintragen (optional, aber empfohlen):

   **Panel "Über mich"**
   - Titel: `Über mich`
   - Beschreibung: kurzer Text über dich, z. B. "Technik-Nerd mit drei
     Chinchillas im Hintergrund. Hier gibt's Gaming, Technik-Projekte und
     ruhige Talk-Streams."

   **Panel "Die Crew"**
   - Titel: `Die Chinchilla-Crew`
   - Beschreibung: Namen und 1-2 Sätze zu den drei Chinchillas
   - Link: deine Zuschauer-Website, Abschnitt `#crew`
     (z. B. `https://silence667-stack.github.io/Twitch-Chinchilla-Technik/website/#crew`)

   **Panel "Mein Setup"**
   - Titel: `Mein Setup`
   - Beschreibung: Kurzfassung deiner Technik
   - Link: Zuschauer-Website, Abschnitt `#setup`

5. Reihenfolge per Drag&amp;Drop anpassen, speichern.

Tipp: Falls du später Text/Farben in den Panels ändern willst, die
`.html`-Quellen in `panels/` bearbeiten und `bash panels/render-panels.sh`
erneut ausführen — dann die neuen PNGs bei Twitch austauschen.
