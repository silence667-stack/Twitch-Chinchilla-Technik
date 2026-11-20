# Emotes — 30 animierte Chinchilla-Emotes

Vermenschlichtes Chinchilla-Maskottchen (Brille, ausdrucksstark) als Chat-Emote-Set
für Twitch. Alle 30 sind **animiert (GIF)**, **transparenter Hintergrund**
(funktioniert also sowohl im hellen als auch im dunklen Twitch-Chat-Theme —
dicke dunkle Konturlinie um Fell/Requisiten sorgt für Kontrast auf beiden),
112×112px, deutlich unter dem 1MB-Limit (alle ~35–60KB).

## Die 30 Emotes (`gif/`)

| Datei | Bedeutung |
|---|---|
| balu84Hype | Hype / Cheering |
| balu84Love | Herzaugen |
| balu84LOL | Lachen |
| balu84LMAO | Totlachen (mit Lachträne) |
| balu84Think | Nachdenken |
| balu84Mandel | Mandel hochhalten (Kanal-Gag) |
| balu84Sad | Traurig |
| balu84Cry | Weinen |
| balu84Rage | Wütend |
| balu84Shock | Schock / Überrascht |
| balu84Sleepy | Müde (ZZZ) |
| balu84Cool | Cool (Sonnenbrille) |
| balu84Wink | Zwinkern |
| balu84Facepalm | Facepalm |
| balu84Clap | Klatschen |
| balu84Scared | Erschrocken |
| balu84Confused | Verwirrt |
| balu84GG | Daumen hoch |
| balu84MindBlown | Mind Blown |
| balu84EyeRoll | Augen verdrehen |
| balu84Sweat | Nervös |
| balu84Party | Party |
| balu84Blush | Verlegen / Erröten |
| balu84Smirk | Süffisantes Grinsen |
| balu84Yawn | Gähnen |
| balu84Dizzy | Schwindelig |
| balu84Focus | Fokussiert |
| balu84Shush | "Pscht" |
| balu84Salute | Salut |
| balu84Angel | Engelhaft unschuldig |

## Technische Vorgaben (Twitch, Stand der Recherche)

- Format: **GIF**, quadratisch, 112×112px (Twitch skaliert bei Einzel-Upload
  automatisch auf 56×56 und 28×28 herunter)
- Max. 1MB pro Datei, max. 60 Frames, max. 3 "Blitze"/Sekunde — alles erfüllt
- **Voraussetzung:** Animierte Emotes können nur von **Affiliates/Partnern**
  mit aktivierten Bits hochgeladen werden. Falls der Kanal das noch nicht ist,
  sind die Emotes trotzdem schon fertig für später.

## Hochladen

Twitch Creator Dashboard → **Werbung & Mehrwert → Emotes** → Upload, dort je
Emote die GIF-Datei hochladen und einen Trigger-Namen vergeben (z.B. `balu84Hype`
exakt wie der Dateiname, damit er im Chat leicht zu tippen ist).

## Neu erzeugen / anpassen

Alles ist aus Code generiert (keine Handarbeit in einem Bildeditor nötig):

```bash
cd src
node generate.mjs   # baut die 30 Frame-Streifen (HTML) aus emotes.
bash render.sh       # screenshotet, schneidet in Frames, baut die GIFs
```

Posen/Ausdrücke anpassen: `src/generate.mjs`, im `EMOTES`-Array. Jeder Eintrag
hat `loopMs` (Loop-Dauer), `bounceAmp`/`earAmp` (Bewegungsstärke) und eine
`draw(t)`-Funktion, die bei `t` zwischen 0 und 1 die jeweilige Pose zurückgibt
(Augen/Mund/Requisiten). Gemeinsame Bauteile (Kopf, Ohren, Brille, Pfoten,
Tränen, Schweißtropfen, Konfetti, …) sind als wiederverwendbare Funktionen
oben in der Datei definiert.

`strips/`, `frames/`, `preview/`, `contact/` sind Build-Zwischenstände
(nicht in Git, siehe `.gitignore`) — nur `gif/` enthält die fertigen Dateien.
