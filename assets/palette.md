---
name: palette
---

# Farbpalette – derBaLu84: Chinchilla & Technik

Leitidee: kuschelige Chinchilla-Felltöne treffen auf ein dezentes Tech-/Nachtmodus-Setting. Warm statt grell, verspielt statt kindisch.

| Rolle               | Hex       | Verwendung |
|----------------------|-----------|------------|
| Hintergrund dunkel   | `#1b1726` | Overlay-/Website-Hintergrund, Nacht-Look |
| Hintergrund dunkel 2 | `#241f33` | Panels, Karten, Abstufung |
| Fell hell (Creme)    | `#f3e4c8` | Hauptfarbe Chinchilla-Fell, Headlines auf dunklem Grund |
| Fell Schatten        | `#cda877` | Schattierung Fell, Rahmen |
| Fell dunkel          | `#6b5a46` | Ohren innen, Konturen |
| Akzent Cyan          | `#79e6e8` | Technik-Akzent, Links, Rahmen, Glow |
| Akzent Pink/Mandel   | `#ff9ac0` | "Mandel"-Währungsgag, Herzchen, Highlights |
| Mandel-Braun         | `#d9a441` | Mandel-Icon, Alerts |
| Text hell            | `#f6f1e7` | Fließtext auf dunklem Grund |
| Text gedämpft        | `#b8aec4` | Sekundärtext, Meta-Infos |

Schrift: System-/Web-sichere, gut lesbare Rundschrift fürs Playful-Gefühl (`"Baloo 2"` von Google Fonts als Headline, `"Inter"` als Fließtext – beide offline-fähig über lokale Fallbacks einbinden, falls Google Fonts blockiert ist).

Animationsregel: dezent, kurz (≤ 400ms), respektiert `prefers-reduced-motion`. Keine Konfetti-Explosionen, keine Lauftext-Dauerschleifen mit hoher Frequenz.


## Chinchilla-Fell (naturgetreu)

Direkt aus den beiden Referenz-JPEGs gemessen: Pillow, RGB ohne Farbkorrektur;
je Kanal der Median aller Pixel im rechteckigen Ausschnitt, auf ganze Werte
gerundet. Koordinaten in Originalpixeln ab links oben, Format
`(links, oben, rechts, unten)`; rechte und untere Grenze exklusiv.

| Rolle | Gemessener Hexwert | Referenz und Ausschnitt | Verwendung |
|-------|-------------------|------------------------|------------|
| Dunkles Rücken-/Kopffell | `#595552` | `chinchilla-ref-2-portrait.jpg`, `(900, 600, 1100, 700)`, dunkle Kopffellpartie, 20.000 Pixel | Kopf, Rücken und dunkler Ohrrand |
| Helles Bauch-/Kinnfell | `#babcbd` | `chinchilla-ref-1-wroclaw-zoo.jpg`, `(2100, 1000, 2250, 1120)`, helle untere Fellpartie, 18.000 Pixel | Bauch-/Kinnverlauf, Ohrbasis und Schwanzwurzel |
| Ohrinnenseite | `#d6c5bc` | `chinchilla-ref-2-portrait.jpg`, `(1200, 400, 1280, 500)`, helle Ohrinnenfläche, 8.000 Pixel | Durchscheinend wirkende rosa-graue Ohrmuscheln |
| Augen-/Nasenschwarz | `#151515` | `chinchilla-ref-2-portrait.jpg`, `(1460, 720, 1480, 760)`, dunkler Augenkern, 800 Pixel | Knopfaugen, Nase und dunkle Schwanzspitze |

Die SVGs verwenden zusätzlich aufgehellte Mischungen der Fellwerte mit Weiß
für Kinn, Bauch, Ohrsaum und feine Fell-Ticking-Striche sowie abgedunkelte
Mischungen für Konturen. Die bestehenden Markenakzente bleiben Cyan `#79e6e8`
und Pink `#ff9ac0`; die Mandel bleibt `#d9a441`.
