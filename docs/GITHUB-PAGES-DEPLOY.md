# Zuschauer-Website über GitHub Pages veröffentlichen

Status: Für diesen Account (`silence667-stack`) wurde das bereits automatisch
erledigt — Repo angelegt, Code gepusht, GitHub Pages aktiviert, alle
GitHub-Platzhalter ausgefüllt. Dieser Text beschreibt, was dabei passiert
ist und wie du es bei Bedarf erneut machst (z. B. nach lokalen Änderungen,
oder falls du das Projekt auf einem anderen Account neu aufsetzen willst).

1. Neues, **öffentliches** GitHub-Repository anlegen, z. B. `Twitch-Chinchilla-Technik`
   (unter deinem GitHub-Account, nicht unter dem alten OBS-Projekt).

2. Dieses lokale Projekt dorthin pushen:

   ```bash
   cd /home/sebastian/Twitch-Chinchilla-Technik
   git init
   git add .
   git commit -m "Erste Version: Chinchilla & Technik Branding"
   git branch -M main
   git remote add origin https://github.com/silence667-stack/Twitch-Chinchilla-Technik.git
   git push -u origin main
   ```

3. In den Repo-Einstellungen auf GitHub: **Settings → Pages**
   - Source: "Deploy from a branch"
   - Branch: `main`, Ordner: **`/ (root)`** (GitHub Pages bietet nur `/root`
     oder `/docs` an — bewusst `/root` wählen, **nicht** `/docs`, denn der
     vorhandene `docs/`-Ordner in diesem Projekt enthält nur die
     Einrichtungs-Anleitungen, nicht die Website).

   Mit `/root` als Quelle wird das ganze Repo veröffentlicht, die relativen
   Pfade in `website/index.html` (z. B. `../assets/...`) funktionieren dann
   automatisch, ohne dass du etwas kopieren oder verschieben musst.

4. Deine Seite ist erreichbar unter:
   `https://silence667-stack.github.io/Twitch-Chinchilla-Technik/website/`
   (der Pfad `/website/` am Ende ist nötig, weil `index.html` in diesem
   Unterordner liegt).

5. Der Twitch-Player in `website/index.html` und die Icon-URLs in
   `overlays/mandel-alert.html` / `overlays/chinchilla-ticker.html` sind
   bereits auf `silence667-stack` bzw. `silence667-stack.github.io`
   eingestellt — hier musst du nichts mehr anpassen.

## Änderungen später erneut veröffentlichen

Wenn du Texte/Bilder lokal änderst, einfach:

```bash
cd /home/sebastian/Twitch-Chinchilla-Technik
git add .
git commit -m "Beschreibe deine Änderung"
git push
```

GitHub Pages baut die Seite danach automatisch neu (meist innerhalb 1-2 Minuten).

Alternative ohne GitHub Pages: Die `website/`-Dateien funktionieren auch auf
jedem anderen Webspace (z. B. später doch mal Hostinger o.ä.) — es ist
reines statisches HTML/CSS/JS, kein Server nötig.
