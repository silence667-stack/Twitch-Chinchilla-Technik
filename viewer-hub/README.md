# Viewer-Hub — geparkt, aktuell NICHT im Einsatz

Dieser Ordner enthält ein fertiges, getestetes Backend für Twitch-Login +
eigene Zuschauer-Währung + Rangliste + Admin-Panel (inspiriert von
Nilson1489s "Twitch User Events Starter").

**Entscheidung (aktualisiert 2026-11-21):** "Mandeln" sind die
Twitch-Kanalpunkte (siehe `../docs/STREAMELEMENTS-EINRICHTEN.md`, Abschnitt
2c) — bewusst EIN System statt mehrerer paralleler Mandel-Konten.
StreamElements-Loyalty ist ausgeschaltet.
Dieser Code ist deshalb aktuell nicht in `website/` eingebunden.

**Warum trotzdem behalten statt löschen:** Falls StreamElements irgendwann
wegfällt oder kostenpflichtig wird (siehe Recherche-Notiz zu
"StreamElements bald weg?" — der Gründer hat trotz "für immer kostenlos"
um Spenden gebeten), ist hier bereits ein funktionierendes, unabhängiges
Ersatzsystem fertig vorbereitet: eigener Twitch-OAuth-Login, JSON-Dateispeicher
(kein Datenbankserver nötig), Rangliste, Admin-Panel. Müsste dann nur noch
an die Website angebunden und deployed werden.

## Technisch (falls später reaktiviert)

- Reines Node.js (`server.mjs`, keine npm-Abhängigkeiten), läuft identisch
  unter Windows (`start.cmd`) und Linux/Mac (`start.sh`).
- Braucht einen Host, der einen dauerhaften Node-Prozess ausführen kann
  (GitHub Pages reicht NICHT, das ist nur statisches Hosting) — z. B. ein
  kleiner VPS, Render/Railway/Fly.io Free-Tier, oder der Streaming-PC selbst.
- Setup-Schritte und Twitch-App-Registrierung: siehe
  `../docs/VIEWER-HUB-EINRICHTEN.md`.
- Wurde lokal smoke-getestet (Server startet, `/api/leaderboard` und
  `/api/me` antworten korrekt) — der volle Login-Flow braucht eine echte
  Twitch-App-Registrierung und wurde noch nicht live getestet.
