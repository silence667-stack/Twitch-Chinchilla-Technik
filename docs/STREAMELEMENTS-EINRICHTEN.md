# StreamElements einrichten: Mandel-Alert, Ticker &amp; Chat-Befehle

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

## 2c. Mandeln = Twitch-Kanalpunkte (Stand 21.11.2026)

"Mandeln" sind die **Twitch-Kanalpunkte** (Creator-Dashboard →
Zuschauer-Belohnungen → Kanalpunkte → Punktebezeichnung). Bewusst nur ein
System: Mit Kanalpunkten können Zuschauer bei Twitch direkt Emotes
freischalten, Nachrichten hervorheben und bei Vorhersagen mitwetten.

StreamElements-Loyalty ist deshalb **ausgeschaltet** (Einstellungen sind
noch hinterlegt, falls man es je wieder braucht). Offen: eigenes
Mandel-Icon für die Kanalpunkte (28/56/112 px, PNG, max. 25 KB).

## 3. Chat-Befehle (StreamElements → Chatbot → Chat commands)

| Befehl | Alias | Was passiert | Cooldown (User/Global) |
|---|---|---|---|
| `!retrofakt` | `!retro` | Retro-Fakt zu Spielen und Konsolen bis ca. 2010 (331, `fakten/retro.txt`) | 300 s / 300 s |
| `!chinfakt` | `!chinchilla` | Chinchilla-Fakt (109, `fakten/chinchilla.txt`) | 300 s / 300 s |
| `!techfakt` | `!tech` | Technik-Fakt (109, `fakten/technik.txt`) | 300 s / 300 s |
| `!chintyp @Name` | – | Zufälliger Chinchilla-Typ mit Prozentzahl | 60 s / 10 s |
| `!retrolevel @Name` | – | Zufälliges Retro-Gamer-Level mit Prozentzahl | 60 s / 10 s |
| `!discord` | – | Discord-Einladung | 15 s / 5 s |
| `!socials` | – | Alle Social-Links + Zuschauer-Website | 15 s / 5 s |
| `!setup` | `!pc` | Kurzfassung der PC-Specs + Link | 15 s / 5 s |
| `!lurk` | – | Chinchilla-Lurk-Spruch | 15 s / 5 s |
| `!spende` | `!spenden` | Spendenlink (streamelements.com/derbalu84/tip), Hinweis: Geld geht in Sachen für die Chinchillas | 60 s / 30 s |

Timer "Befehle-Hinweis" (Chatbot → Timers): alle 30 Min, nur bei mind. 10
Chatzeilen. **Absichtlich deaktiviert angelegt** – bei Bedarf einschalten.

Kanalpunkte-Belohnungen (Twitch → Zuschauer-Belohnungen → Kanalpunkte):
Trink was! (300), Retro-Story (1.500), Chin-Cam (2.500),
Retro-Spielwunsch (3.000, mit Texteingabe).

**So funktionieren die Fakten-Befehle:** `node fakten/build.mjs` macht aus
jeder Zeile von `fakten/<name>.txt` eine eigene Datei `fakten/<name>/<n>.txt`
(fest gemischte Reihenfolge). Der Befehl zählt per `$(count retrofakt)` hoch
und holt per `$(customapi …/fakten/retro/$(math mod($(count retrofakt),331)+1).txt)`
die passende Datei von GitHub Pages. So kommt jeder Fakt einmal dran, bevor
sich einer wiederholt.

**Herkunft der Fakten:** Jede Datenbank hat ein Recherche-Dokument mit Quellen
und Sicherheit in `fakten/recherche/<name>.md`. Übernommen werden nur Fakten mit
Sicherheit "hoch": `node fakten/from-recherche.mjs <name>`, dann
`node fakten/build.mjs`.

**Neuen Fakt hinzufügen:** Zeile mit Quelle in `fakten/recherche/<name>.md`
ergänzen, beide Skripte laufen lassen, committen und pushen. Danach im Befehl die
Zahl im `mod(…, N)` auf die neue Anzahl anpassen (das Skript gibt sie aus).

## 4. Panels einbinden

Siehe `TWITCH-PANELS-HOCHLADEN.md`.
