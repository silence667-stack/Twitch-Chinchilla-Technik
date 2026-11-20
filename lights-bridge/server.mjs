// Lights-Bridge — läuft auf dem Streaming-PC (da, wo die Key Lights im selben
// WLAN sind). Nimmt Events von unseren Overlays entgegen (per fetch() aus
// overlays/mandel-alert.html / overlays/stream-pet.html) und steuert die
// beiden Elgato Key Lights direkt über ihre unauthentifizierte lokale
// HTTP-API (Port 9123, PUT/GET /elgato/lights).
//
// Key Lights koennen NUR Helligkeit (0-100) und Farbtemperatur (2900-7000K,
// intern als "mired" uebertragen) -- kein RGB. Die Effekte unten nutzen
// deshalb kurze Helligkeits-/Temperatur-Pulse statt Farben.
//
// Start: node server.mjs   (vorher config.example.json nach config.json
// kopieren und IPs eintragen)

import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'config.json');

if (!existsSync(CONFIG_PATH)) {
  console.error('Fehler: config.json fehlt. Bitte config.example.json kopieren, umbenennen und IPs eintragen.');
  process.exit(1);
}

const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));

function kelvinToMired(kelvin) {
  const mired = Math.round(1000000 / kelvin);
  return Math.max(143, Math.min(344, mired));
}

async function setLight(ip, { on, brightness, temperatureKelvin }) {
  const body = {
    numberOfLights: 1,
    lights: [{
      on: on ? 1 : 0,
      brightness,
      temperature: kelvinToMired(temperatureKelvin),
    }],
  };
  try {
    await fetch(`http://${ip}:9123/elgato/lights`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(1500),
    });
  } catch (err) {
    console.error(`Licht ${ip} nicht erreichbar:`, err.message);
  }
}

async function setAllLights(state) {
  await Promise.all(config.lights.map((l) => setLight(l.ip, state)));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runEffect(effectKey) {
  const effect = config.effects[effectKey];
  if (!effect) {
    console.log(`Kein Effekt fuer "${effectKey}" konfiguriert, ignoriere.`);
    return;
  }
  console.log(`Effekt "${effectKey}": ${effect.flashes}x blitzen`);
  for (let i = 0; i < effect.flashes; i++) {
    await setAllLights({
      on: true,
      brightness: effect.flashBrightness,
      temperatureKelvin: effect.flashTemperatureKelvin,
    });
    await wait(effect.flashMs);
    await setAllLights({
      on: true,
      brightness: config.normalBrightness,
      temperatureKelvin: config.normalTemperatureKelvin,
    });
    if (i < effect.flashes - 1) await wait(effect.flashMs);
  }
}

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, lights: config.lights.length }));
    return;
  }

  if (req.method === 'POST' && req.url === '/event') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const { type } = JSON.parse(body || '{}');
        runEffect(type).catch((err) => console.error('Effekt-Fehler:', err));
        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accepted: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ungueltiges JSON' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('nicht gefunden');
});

server.listen(config.port, '127.0.0.1', () => {
  console.log(`Lights-Bridge laeuft auf http://127.0.0.1:${config.port}`);
  console.log(`Konfigurierte Lichter: ${config.lights.map((l) => l.name + ' (' + l.ip + ')').join(', ')}`);
});
