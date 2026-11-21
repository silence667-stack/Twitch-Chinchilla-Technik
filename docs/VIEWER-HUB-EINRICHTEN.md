# Viewer-Hub einrichten (falls später reaktiviert)

Aktuell **geparkt** — siehe `../viewer-hub/README.md` für die Begründung
(Kanal nutzt stattdessen die Twitch-Kanalpunkte als einziges Mandel-System).
Diese Anleitung ist für den Fall, dass das Backend später gebraucht wird.

## 1. Twitch-App registrieren

1. https://dev.twitch.tv/console/apps → **Anwendung registrieren**
2. Name: z. B. "derBaLu84 Viewer Hub"
3. OAuth-Redirect-URLs: `http://localhost:8520/auth/callback` (lokal zum
   Testen) bzw. die echte Adresse, sobald das Backend online läuft, z. B.
   `https://viewerhub.deinedomain.de/auth/callback`
4. Kategorie: "Website Integration"
5. Nach dem Anlegen: **Client-ID** kopieren, dann **Neues Secret erzeugen**
   und ebenfalls kopieren (wird nur einmal angezeigt!)

## 2. Konfigurieren

```bash
cd /home/sebastian/Twitch-Chinchilla-Technik/viewer-hub
cp config.example.json config.json
```

`clientId`, `clientSecret`, `redirectUri` (muss exakt zur App-Registrierung
passen), `broadcasterLogin` (dein Twitch-Username) eintragen.

## 3. Starten

```bash
node server.mjs
```

bzw. `start.sh` (Linux/Mac) / `start.cmd` (Windows).

## 4. Hosting (wichtig!)

**GitHub Pages reicht hierfür NICHT** — das ist reines statisches Hosting,
kann keinen Node-Prozess/keine Datei-Datenbank ausführen. Nötig ist einer
von:

- Ein kleiner VPS/Server, der dauerhaft läuft
- Ein Free-Tier bei Render.com, Railway.app oder Fly.io (alle unterstützen
  einfache Node-Apps kostenlos in kleinem Umfang)
- Der Streaming-PC selbst (nur sinnvoll, wenn er auch läuft, wenn gerade
  niemand streamt — Zuschauer sollen ja auch zwischendurch die Rangliste
  sehen können)

Danach `redirectUri` in `config.json` UND in der Twitch-App-Registrierung
auf die echte Adresse anpassen (muss exakt übereinstimmen).

## 5. Frontend-Anbindung

Aktuell noch nicht in `website/index.html` eingebaut (siehe Parkplatz-
Hinweis oben). Grober Plan für später: Login-Button, der zu
`<backend-url>/auth/login?return_to=<aktuelle-seite>` verlinkt; nach dem
Zurückleiten steht das Session-Token im URL-Fragment (`#session=...`),
das JS der Seite liest es aus, speichert es in `localStorage` und schickt
es als `Authorization: Bearer <token>`-Header an `/api/me`,
`/api/heartbeat` (alle `heartbeatIntervalSeconds` aufrufen, solange die
Seite offen ist), `/api/daily-checkin` und `/api/leaderboard`.
