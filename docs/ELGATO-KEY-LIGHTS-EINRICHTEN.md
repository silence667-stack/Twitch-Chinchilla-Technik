# Elgato Key Lights per Stream-Event blinken lassen

Deine zwei Key Lights (WLAN) haben eine eigene, unauthentifizierte lokale
HTTP-API (Port 9123) — kein Cloud-Dienst, kein zusätzliches Konto nötig.
Wichtig zu wissen: Key Lights können **nur Helligkeit (0-100%) und
Farbtemperatur (2900-7000K)** — kein RGB/Farbe wie Hue oder Govee. Die
Effekte hier arbeiten deshalb mit kurzen Helligkeits-/Temperatur-Pulsen
statt Farbwechseln.

Wir nutzen bewusst **keine Drittanbieter-App** (CastMate/BetterStreams
haben keine bestätigte Key-Light-Unterstützung), sondern einen eigenen,
20 Zeilen kleinen Node-Dienst (`lights-bridge/`) — passt zum
"alles selbst bauen"-Stil des restlichen Projekts.

## 1. IP-Adressen deiner Key Lights herausfinden

In der **Elgato Control Center**-App (oder Stream Deck-Software unter dem
Lichter-Symbol): Licht auswählen → Netzwerk-/Geräteinfo → dort steht die
IP-Adresse (z. B. `192.168.178.42`). Beide Lichter einzeln nachschauen.

## 2. Konfiguration anlegen

```bash
cd /home/sebastian/Twitch-Chinchilla-Technik/lights-bridge
cp config.example.json config.json
```

In `config.json` die beiden `ip`-Werte eintragen. `normalBrightness` /
`normalTemperatureKelvin` sind die Werte, zu denen die Lichter nach jedem
Blitz zurückkehren — auf deine übliche Streaming-Beleuchtung einstellen.

Die `effects`-Sektion legt pro Event-Typ fest, wie oft/wie es blitzt:
Follow = 1x kurz kühl-weiß, Sub = 2x, Cheer/Spende = 2-3x warm-orange.
Frei anpassbar.

## 3. Bridge starten

```bash
cd /home/sebastian/Twitch-Chinchilla-Technik/lights-bridge
node server.mjs
```

Läuft auf `http://127.0.0.1:8420`. Muss auf dem PC laufen, der im gleichen
WLAN wie die Key Lights hängt (also vermutlich dein Streaming-PC) und
während des Streams durchgehend offen bleiben (z. B. als Terminal-Fenster
minimiert, oder per `start.sh`/`start.cmd` aus diesem Ordner).

## 4. Verbindung zu den Overlays

Das ist bereits fertig verdrahtet: `overlays/mandel-alert.html` und
`overlays/stream-pet.html` senden bei Follow/Sub/Cheer/Spende automatisch
einen Hinweis an `http://127.0.0.1:8420/event` — läuft die Bridge nicht,
passiert einfach nichts (kein Fehler, kein Absturz des Overlays).

## 5. Testen ohne echten Stream

Mit der Bridge im Hintergrund:

```bash
curl -X POST http://127.0.0.1:8420/event -H "Content-Type: application/json" -d '{"type":"subscriber-latest"}'
```

Beide Key Lights sollten jetzt kurz blitzen.

## Grenzen / Troubleshooting

- Key Lights antworten nicht sofort nach dem Einschalten/WLAN-Wechsel —
  falls ein Blitz ausbleibt, Konsolen-Ausgabe der Bridge prüfen (zeigt
  "nicht erreichbar" mit IP).
- Die Bridge nimmt an, dass sich niemand *während* des Blitzens die
  Lichter manuell verstellt — kommt selten vor, ist aber kein Problem,
  der nächste Effekt setzt wieder die konfigurierten Normal-Werte.
- `config.json` ist bewusst in `.gitignore` (deine WLAN/IP-Daten bleiben
  lokal, landen nicht auf GitHub).
