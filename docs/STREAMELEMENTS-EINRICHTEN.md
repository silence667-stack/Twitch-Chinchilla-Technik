# StreamElements einrichten: Mandel-Alert, Ticker &amp; !mandel-Befehl

Voraussetzung: dein GitHub-Repo ist online (siehe `GITHUB-PAGES-DEPLOY.md`),
damit die Icon-URLs in den Overlays funktionieren.

## 1. Mandel-Alert (Sub/Spende/Cheer/Follow)

1. StreamElements-Dashboard → **Overlays** → dein bestehendes Overlay öffnen
   (das, das schon über deiner OBS-Kulisse als Browser-Quelle liegt) oder ein
   neues Overlay anlegen, falls du den Alert separat testen willst.
2. **Widget hinzufügen → "Custom Widget"**.
3. Im Editor gibt es drei Tabs **HTML / CSS / JS**. Öffne
   `overlays/mandel-alert.html` und kopiere:
   - den Teil zwischen `<!-- HTML START -->` und `<!-- HTML ENDE -->` in den HTML-Tab
   - den Teil zwischen `/* CSS START */` und `/* CSS ENDE */` in den CSS-Tab
   - den Teil zwischen `// JS START` und `// JS ENDE` in den JS-Tab
4. Widget-Größe im Editor auf **1920×1080** stellen, Hintergrund transparent lassen.
5. Speichern. StreamElements verbindet automatisch die echten Events
   (Subs, Bits, Spenden, Follows) — kein eigener API-Key nötig.
6. Test: In OBS die Browser-Quelle mit diesem Overlay anklicken → Rechtsklick
   → "Interagieren" → im StreamElements-Overlay-Editor gibt es oben rechts
   einen Test-Button ("Test"/"Simulate") pro Widget-Typ.

## 2. Chinchilla-Ticker (Dauer-Overlay)

Gleiches Vorgehen wie oben, nur mit `overlays/chinchilla-ticker.html`.
Dieses Widget braucht keine Events, es läuft einfach die ganze Zeit mit.
Die Fakten-Liste kannst du direkt im JS-Tab unter `FACTS` erweitern/ändern.

**Platzierung:** Beide Overlays als eigene Browser-Quelle (oder als
zusätzliches Widget im bestehenden Overlay) über deine OBS-Kulisse legen,
Reihenfolge so, dass sie über dem Spielbild, aber nicht über wichtigen
UI-Elementen liegen.

## 3. `!mandel`-Chat-Befehl

StreamElements-Dashboard → **Chatbot → Befehle (Commands) → Befehl hinzufügen**:

- Befehl: `!mandel`
- Antwort (Beispiel, gern anpassen):

  ```
  🌰 Mandeln sind hier die Spaß-Währung für Subs/Bits/Spenden —
  echte Mandeln bekommen die Chinchillas nur sehr selten als Snack!
  ```

- Cooldown: z. B. 30s (User) / 10s (Global), damit der Chat nicht zugespammt wird.

Optional: ein zweiter Befehl `!chinchillas` mit kurzer Vorstellung der drei
Chinchillas (Namen aus `website/index.html` übernehmen, sobald eingetragen).

## 4. Panels einbinden

Siehe `TWITCH-PANELS-HOCHLADEN.md`.
