# Weitere Ideen vom Nilson1489-Kanal

Aus der Kanal-Recherche (siehe Gedächtnis-Notiz) — hier die drei Punkte,
die noch nicht in anderen Docs stecken.

## 1. Remotion (animierte Alerts per KI) — für die gemeinsame Session

Remotion rendert Animationen programmatisch (React-Komponenten werden zu
Video) und kann transparentes WebM exportieren → direkt als Media Source
in OBS, als Alternative/Ergänzung zu unseren CSS-Animationen.

**Bewusst noch nicht aufgesetzt**, aus zwei Gründen:
- Dein Rechner hat aktuell nur **~9,9 GB frei** (98% voll) — React +
  Remotion + Abhängigkeiten sind kein Riesenblock, aber unnötig, bevor
  wir wissen, ob wir's wirklich so nutzen wollen.
- Nilsons eigener Workflow dafür ist explizit **live/iterativ**: er startet
  `claude` im Projektordner und beschreibt auf Deutsch, was er will, dann
  wird nachgebessert. Das ist wie StreamElements/Twitch/Elgato — lohnt
  sich am meisten, wenn wir's zusammen machen statt dass ich blind rate,
  wie eine Animation aussehen soll.

**Wenn du magst, machen wir das in der gemeinsamen Session:**
```bash
npx create-video@latest   # legt ein neues Remotion-Projekt an
```
Dann im Projektordner `claude` (oder diese Session hier) starten und
z. B. sagen: "Baue mir einen Sub-Alert mit dem Chinchilla-Maskottchen,
der reinhüpft, kurz eine Mandel hochhält und wieder rausläuft, 3
Sekunden, transparenter Hintergrund."

Lizenz: kostenlos für Einzelpersonen/Solo-Streamer (Company License erst
ab 3+ Mitarbeitern — für dich also kein Thema).

## 2. Elgato Virtual Stream Deck — kostenlos, schon freigeschaltet

Kein Kauf nötig: Da du schon ein physisches Stream Deck hast, ist das
Feature automatisch aktiv, sobald die aktuelle Stream-Deck-Software läuft.

- In der Stream-Deck-Software nach "Virtual Stream Deck" / "Virtuelles
  Stream Deck" suchen (bzw. Einstellungen durchsehen — Elgato nennt es
  je nach Version leicht unterschiedlich).
- Zwei Modi: **fixiert** (immer sichtbar, per Maus bedienbar — z. B. auf
  deinem zweiten Monitor) oder **dynamisch** (per Hotkey/Maustaste an der
  aktuellen Mausposition ein-/ausblendbar).
- Bis zu 8×8 Tasten pro virtuellem Deck, beliebig viele virtuelle Decks.
- Idee für dich: ein zusätzliches virtuelles Deck nur für Mandel-Store-
  Sounds, Lichter-Presets (aus `lights-bridge/`) oder Balu-Streamstudio-
  Mottos — ohne weitere Hardware zu kaufen.

## 3. ControlPlay — optional, eher nicht für den ruhigen Kanal-Stil

Kostenlose Windows-App + Twitch-Extension für Chat-Interaktion:
- **Kostenlos:** eigene Sound-Alerts (Bits-Kosten, Cooldown), Text-Popups,
  Vollbild-Overlay-Effekte (auto-deaktiviert bei Valorant/CS2/Fortnite
  wegen Anti-Cheat)
- **Kostenpflichtig (~59€ einmalig):** echte Maus/Tastatur-Kontrolle fürs
  Spiel per USB-Stick (Granate werfen, Dreher, "Betrunken-Effekt")

Einschätzung: Der kostenlose Teil (Sounds/Popups) könnte dezent passen,
die bezahlte Spielsteuerung ist explizit an aktive Gaming-Sessions
gebunden und eher chaotisch — passt eher zu lautem Gaming-Content als zu
eurem ruhigeren Chinchilla+Technik-Stil. Nur bei Bedarf installieren,
nicht Teil des aktuellen Setups.
