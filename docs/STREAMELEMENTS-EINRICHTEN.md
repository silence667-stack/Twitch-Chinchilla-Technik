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

## 2b. Stream-Pet (Chinchilla läuft über den Screen)

Gleiches Vorgehen, mit `overlays/stream-pet.html`. Läuft von selbst alle
3-7 Minuten einmal quer über den Screen (Ambient-Verhalten, Intervall im
JS-Tab unter `AMBIENT_MIN_MS`/`AMBIENT_MAX_MS` einstellbar) und reagiert
zusätzlich sofort auf Follow/Sub/Cheer/Spende: läuft dann zur Mitte, hüpft
kurz mit Glitzer-Effekt und einer "Danke, NAME!"-Sprechblase.

Falls du die Elgato-Key-Lights-Bridge eingerichtet hast (siehe
`ELGATO-KEY-LIGHTS-EINRICHTEN.md`), lösen dieselben Events zusätzlich einen
kurzen Lichtblitz auf deinen beiden Key Lights aus — Overlay und Lichter
reagieren auf das exakt gleiche Event, laufen aber unabhängig voneinander
(falls die Lichter-Bridge nicht läuft, merkt das Overlay-Widget das gar
nicht, es versucht nur kurz und gibt sonst Ruhe).

**Platzierung aller drei Overlays:** Als eigene Browser-Quelle (oder als
zusätzliches Widget im bestehenden Overlay) über deine OBS-Kulisse legen,
Reihenfolge so, dass sie über dem Spielbild, aber nicht über wichtigen
UI-Elementen liegen.

## 2c. Mandeln als echtes Punktesystem (StreamElements Loyalty)

Bisher sind "Mandeln" nur ein Wort im Alert-Text. Lässt sich mit Bordmitteln
echt machen, ganz ohne eigenen Code:

1. StreamElements-Dashboard → **Loyalty** (manchmal auch "Punkte" genannt) →
   aktivieren, falls noch nicht an.
2. Dort den Punktenamen (`$(pointsname)`) von "Points" auf **"Mandeln"**
   ändern. Ab sofort nutzen alle eingebauten Befehle (`!points`,
   `!addpoints`, `!givepoints` …) automatisch "Mandeln" im Text.
3. Verdienrate einstellen (Punkte pro Minute Zuschauen, Bonus für Subs
   etc. — nach Geschmack).
4. Optional: **Loyalty Store** einrichten, in dem Zuschauer ihre Mandeln
   gegen Perks eintauschen (Soundeffekt, TTS-Nachricht, Highlight-Message).
5. Die eingebauten Befehlsnamen bleiben technisch `!points` & co. — falls
   du lieber `!mandeln` als Befehlsnamen willst, unter **Chatbot → Befehle**
   die Standardbefehle umbenennen/Aliase anlegen.

Wichtig: Das sind StreamElements-eigene Loyalty-Punkte, keine echten
Twitch-Channel-Points (die heißen bei Twitch weiterhin "Kanalpunkte" und
laufen getrennt, siehe `BETTER-POINTS-REDEMPTIONS-EINRICHTEN.md`).

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
