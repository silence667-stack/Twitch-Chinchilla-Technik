@echo off
cd /d "%~dp0"
if not exist config.json (
  echo Fehler: config.json fehlt. Siehe docs\ELGATO-KEY-LIGHTS-EINRICHTEN.md
  exit /b 1
)
node server.mjs
