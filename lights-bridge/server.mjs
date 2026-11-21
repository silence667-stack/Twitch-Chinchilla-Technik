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
config.lights = config.lights || [];
config.wled = config.wled || [];

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
    const res = await fetch(`http://${ip}:9123/elgato/lights`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) {
      console.error(`Licht ${ip} antwortete mit Fehler: HTTP ${res.status}`);
    }
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

// ---------- WLED-LED-Streifen (JSON-API: GET/POST http://<ip>/json/state) ----------
async function wledRequest(ip, method, body) {
  const res = await fetch(`http://${ip}/json/state`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(1500),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return method === 'GET' ? res.json() : null;
}

// Spielt den WLED-Teil eines Effekts auf einem Streifen ab und stellt danach
// den vorherigen Zustand (Farbe, Effekt, Helligkeit, an/aus) wieder her.
async function runWledEffect(strip, wled) {
  let previous = null;
  try {
    previous = await wledRequest(strip.ip, 'GET');
    const seg = { col: [wled.color || [255, 255, 255]], fx: wled.fx ?? 0 };
    if (wled.sx !== undefined) seg.sx = wled.sx;
    await wledRequest(strip.ip, 'POST', { on: true, bri: wled.brightness ?? 255, transition: 0, seg: [seg] });
    await wait(wled.durationMs ?? 3000);
  } catch (err) {
    console.error(`WLED ${strip.name || strip.ip} nicht erreichbar:`, err.message);
  } finally {
    if (previous) {
      const { on, bri, seg } = previous;
      await wledRequest(strip.ip, 'POST', { on, bri, transition: 7, seg })
        .catch((err) => console.error(`WLED ${strip.ip} Wiederherstellen fehlgeschlagen:`, err.message));
    }
  }
}

async function runEffectNow(effectKey) {
  const effect = config.effects[effectKey];
  if (!effect) {
    console.log(`Kein Effekt fuer "${effectKey}" konfiguriert, ignoriere.`);
    return;
  }
  const wledRun = effect.wled && config.wled?.length
    ? Promise.all(config.wled.map((s) => runWledEffect(s, effect.wled)))
    : Promise.resolve();
  console.log(`Effekt "${effectKey}": ${effect.flashes}x blitzen${effect.wled ? ' + WLED' : ''}`);
  await Promise.all([wledRun, flashKeyLights(effect)]);
}

async function flashKeyLights(effect) {
  if (!config.lights?.length || !effect.flashes) return;
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

// Effekte werden nacheinander abgearbeitet (Queue), damit sich zwei schnell
// aufeinanderfolgende Events (z.B. zwei Alerts) nicht gegenseitig ins
// Gehege kommen und die Lichter in einem halbfertigen Zustand haengen lassen.
let effectQueue = Promise.resolve();
function runEffect(effectKey) {
  effectQueue = effectQueue
    .then(() => runEffectNow(effectKey))
    .catch((err) => console.error('Effekt-Fehler:', err));
  return effectQueue;
}

const allowedOrigins = config.allowedOrigins || ['null'];

const server = createServer((req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, lights: config.lights.length, wled: config.wled.length }));
    return;
  }

  if (req.method === 'POST' && req.url === '/event') {
    let body = '';
    let tooLarge = false;
    req.on('data', (chunk) => {
      if (tooLarge) return;
      body += chunk;
      if (body.length > 4096) {
        tooLarge = true;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'body zu gross' }));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (tooLarge) return;
      try {
        const { type } = JSON.parse(body || '{}');
        runEffect(type);
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
  console.log(`Key Lights: ${config.lights.map((l) => l.name + ' (' + l.ip + ')').join(', ') || 'keine'}`);
  console.log(`WLED-Streifen: ${config.wled.map((w) => w.name + ' (' + w.ip + ')').join(', ') || 'keine'}`);
});
