# Twitch-Channel-Points → OBS-Effekte (Better Points)

Die Twitch-Kanalpunkte (auf dem Kanal "Mandeln" genannt, siehe
`STREAMELEMENTS-EINRICHTEN.md`) lassen sich über das OBS-Plugin
**Better Points** direkt mit Szenenwechseln/Filtern/Quellen verknüpfen —
z. B. "Chinchilla füttern" als Redemption, die unser Chinchilla-Ticker-
Overlay kurz eine Sonderanimation zeigen lässt statt nur die Dauerschleife.

Quelle/Download: https://obsproject.com/forum/resources/better-points.918

## 1. Installation

1. Plugin von obsproject.com/forum herunterladen (Version passend zu deiner
   OBS-Version, mindestens OBS 28 wegen obs-websocket 5.x).
2. Installer ausführen bzw. Dateien in den OBS-Plugin-Ordner kopieren.
3. OBS neu starten. Unter **Werkzeuge** sollte jetzt "Better Points" (oder
   ähnlich benannt) auftauchen.

## 2. Twitch-Channel-Points-Rewards anlegen

Im Creator Dashboard (dashboard.twitch.tv) → **Community → Kanalpunkte** →
eigene Belohnung erstellen, z. B.:

- **"Chinchilla füttern"** — Kosten z. B. 500 Punkte, Text: "Füttert eine
  der Chinchillas mit einer virtuellen Mandel"
- **"Szene: Werkbank"** — wechselt kurz zur Technik-Werkbank-Szene (falls
  vorhanden)
- **"Licht-Überraschung"** — löst (zusätzlich zur Elgato-Bridge) einen
  Extra-Lichteffekt aus

## 3. Reward mit OBS-Aktion verknüpfen

In Better Points: Reward aus der Twitch-Liste auswählen → Aktion zuweisen:
- Szene wechseln (z. B. kurz auf eine "Reaction"-Szene, dann zurück)
- Quellen-Sichtbarkeit togglen (z. B. unser `chinchilla-ticker.html` kurz
  ausblenden und eine extra Browser-Quelle mit einer Sonderanimation
  einblenden)
- Filter an-/ausschalten (z. B. kurzer Farbfilter als "Überraschungs"-Effekt)

Better Points kann Redemptions zudem automatisch **annehmen/ablehnen**
abhängig vom OBS-Ergebnis — z. B. ablehnen (Punkte zurückerstatten), falls
die Zielszene gerade nicht sinnvoll ist (z. B. während eines Brb-Screens).

## 4. Verbindung zu unseren eigenen Overlays (optional, mehr Aufwand)

Für eine Redemption, die direkt unseren `chinchilla-ticker.html`/
`stream-pet.html`-Code reagieren lässt (statt nur OBS-Quellen zu togglen),
bräuchte es zusätzlich einen kleinen eigenen Listener nach demselben Muster
wie `lights-bridge/` — das ist noch nicht gebaut, nur als nächster Schritt
vorgemerkt, falls gewünscht.

## Alternative: BetterStreams

https://obsproject.com/forum/resources/betterstreams-stream-automation.918/
— breiter aufgestelltes Automatisierungs-Plugin (auch Subs/Raids/Hype
Train als Trigger, nicht nur Channel Points), inkl. Reward-Analytics
(welche Rewards wie oft genutzt werden). Braucht ebenfalls OBS ≥ 28.
Für den Einstieg reicht Better Points; BetterStreams lohnt sich, falls
später mehr Trigger-Typen gewünscht sind.
