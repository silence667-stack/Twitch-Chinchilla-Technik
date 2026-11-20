// Viewer-Hub — eigenes kleines Backend fuer Twitch-Login + Zuschauer-Waehrung
// + Rangliste + Admin-Panel, inspiriert von Nilson1489s "Twitch User Events
// Starter" (YouTube: "Claude Code changed my Twitch stream").
//
// Architektur bewusst einfach gehalten:
// - Kein Datenbankserver, nur eine JSON-Datei (data/viewers.json) -- reicht
//   fuer die Groessenordnung eines einzelnen Kanals locker aus.
// - Kein Cookie-basierter Login (vermeidet SameSite/Secure-Aerger, wenn das
//   Backend auf einer anderen Domain laeuft als die GitHub-Pages-Website).
//   Stattdessen: signiertes Bearer-Token, das der Browser nach dem Login
//   in localStorage ablegt und bei jedem API-Aufruf mitschickt.
// - CORS offen (kein Credentials-Cookie im Spiel, daher unproblematisch).
//
// Start: node server.mjs   (vorher config.example.json -> config.json)

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHmac, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'config.json');
const DATA_PATH = join(__dirname, 'data', 'viewers.json');

if (!existsSync(CONFIG_PATH)) {
  console.error('Fehler: config.json fehlt. config.example.json kopieren und ausfuellen.');
  process.exit(1);
}

let config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));

function saveConfig() {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function loadData() {
  if (!existsSync(DATA_PATH)) return { viewers: {} };
  return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
}

function saveData(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// ---------- Signiertes Token (stateless, kein Session-Speicher noetig) ----------
function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function signToken(payload) {
  const body = base64url(JSON.stringify(payload));
  const sig = createHmac('sha256', config.sessionSecret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = createHmac('sha256', config.sessionSecret).update(body).digest('base64url');
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------- Twitch Helix API ----------
let appAccessToken = null;
let appAccessTokenExpiresAt = 0;

async function getAppAccessToken() {
  if (appAccessToken && Date.now() < appAccessTokenExpiresAt) return appAccessToken;
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'client_credentials',
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error('App-Token-Fehler: ' + JSON.stringify(json));
  appAccessToken = json.access_token;
  appAccessTokenExpiresAt = Date.now() + (json.expires_in - 60) * 1000;
  return appAccessToken;
}

async function helixFetch(path, token) {
  const res = await fetch(`https://api.twitch.tv/helix${path}`, {
    headers: {
      'Client-Id': config.clientId,
      'Authorization': `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Helix-Fehler ${path}: ${JSON.stringify(json)}`);
  return json;
}

async function resolveBroadcasterId() {
  if (config.broadcasterTwitchId) return config.broadcasterTwitchId;
  const token = await getAppAccessToken();
  const json = await helixFetch(`/users?login=${encodeURIComponent(config.broadcasterLogin)}`, token);
  const id = json.data?.[0]?.id;
  if (!id) throw new Error('Broadcaster-Login nicht gefunden: ' + config.broadcasterLogin);
  config.broadcasterTwitchId = id;
  saveConfig();
  return id;
}

let liveStatusCache = { value: false, checkedAt: 0 };
async function isChannelLive() {
  if (Date.now() - liveStatusCache.checkedAt < 20000) return liveStatusCache.value;
  const token = await getAppAccessToken();
  const json = await helixFetch(`/streams?user_login=${encodeURIComponent(config.broadcasterLogin)}`, token);
  const live = Array.isArray(json.data) && json.data.length > 0;
  liveStatusCache = { value: live, checkedAt: Date.now() };
  return live;
}

// ---------- Viewer-Datensaetze ----------
function getViewer(data, twitchId) {
  if (!data.viewers[twitchId]) {
    data.viewers[twitchId] = {
      twitchId,
      login: '',
      displayName: '',
      balance: 0,
      lastHeartbeatAt: 0,
      lastDailyCheckinDate: '',
      firstSeenAt: Date.now(),
    };
  }
  return data.viewers[twitchId];
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// ---------- HTTP-Hilfsfunktionen ----------
function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
    ...headers,
  });
  res.end(JSON.stringify(body));
}

function getBearer(req) {
  const h = req.headers['authorization'] || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

async function readJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { resolve({}); }
    });
  });
}

// ---------- Server ----------
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${config.port}`);

  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }

  try {
    // --- Login: leitet zu Twitch weiter ---
    if (req.method === 'GET' && url.pathname === '/auth/login') {
      const returnTo = url.searchParams.get('return_to') || '';
      const state = base64url(returnTo);
      const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
      authUrl.searchParams.set('client_id', config.clientId);
      authUrl.searchParams.set('redirect_uri', config.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', '');
      authUrl.searchParams.set('state', state);
      res.writeHead(302, { Location: authUrl.toString() });
      res.end();
      return;
    }

    // --- Callback: tauscht Code gegen Token, legt Viewer an, leitet mit Session zurueck ---
    if (req.method === 'GET' && url.pathname === '/auth/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state') || '';
      const returnTo = Buffer.from(state, 'base64url').toString('utf-8') || '/';

      const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri,
        }),
      });
      const tokenJson = await tokenRes.json();
      if (!tokenRes.ok) throw new Error('Code-Austausch fehlgeschlagen: ' + JSON.stringify(tokenJson));

      const usersJson = await helixFetch('/users', tokenJson.access_token);
      const user = usersJson.data?.[0];
      if (!user) throw new Error('Kein Nutzer von Twitch erhalten');

      const data = loadData();
      const viewer = getViewer(data, user.id);
      viewer.login = user.login;
      viewer.displayName = user.display_name;
      saveData(data);

      const sessionToken = signToken({
        twitchId: user.id,
        login: user.login,
        displayName: user.display_name,
        exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 Tage
      });

      const redirectUrl = returnTo + (returnTo.includes('#') ? '' : '#') + `session=${sessionToken}`;
      res.writeHead(302, { Location: redirectUrl });
      res.end();
      return;
    }

    // --- Eigene Daten ---
    if (req.method === 'GET' && url.pathname === '/api/me') {
      const payload = verifyToken(getBearer(req));
      if (!payload) return send(res, 401, { error: 'nicht eingeloggt' });
      const data = loadData();
      const viewer = getViewer(data, payload.twitchId);
      send(res, 200, {
        login: viewer.login,
        displayName: viewer.displayName,
        balance: viewer.balance,
        currencyName: config.currencyName,
        currencyEmoji: config.currencyEmoji,
        canCheckInToday: viewer.lastDailyCheckinDate !== todayUtc(),
      });
      return;
    }

    // --- Heartbeat: vergibt Waehrung, nur waehrend der Kanal live ist ---
    if (req.method === 'POST' && url.pathname === '/api/heartbeat') {
      const payload = verifyToken(getBearer(req));
      if (!payload) return send(res, 401, { error: 'nicht eingeloggt' });
      const live = await isChannelLive();
      if (!live) return send(res, 200, { credited: 0, live: false });

      const data = loadData();
      const viewer = getViewer(data, payload.twitchId);
      const now = Date.now();
      const minGapMs = (config.heartbeatIntervalSeconds - 5) * 1000; // kleine Toleranz
      if (now - viewer.lastHeartbeatAt < minGapMs) {
        return send(res, 200, { credited: 0, live: true, balance: viewer.balance });
      }
      viewer.lastHeartbeatAt = now;
      viewer.balance += config.pointsPerHeartbeat;
      saveData(data);
      send(res, 200, { credited: config.pointsPerHeartbeat, live: true, balance: viewer.balance });
      return;
    }

    // --- Taeglicher Bonus ---
    if (req.method === 'POST' && url.pathname === '/api/daily-checkin') {
      const payload = verifyToken(getBearer(req));
      if (!payload) return send(res, 401, { error: 'nicht eingeloggt' });
      const data = loadData();
      const viewer = getViewer(data, payload.twitchId);
      const today = todayUtc();
      if (viewer.lastDailyCheckinDate === today) {
        return send(res, 200, { credited: 0, alreadyCheckedIn: true, balance: viewer.balance });
      }
      viewer.lastDailyCheckinDate = today;
      viewer.balance += config.dailyCheckinBonus;
      saveData(data);
      send(res, 200, { credited: config.dailyCheckinBonus, alreadyCheckedIn: false, balance: viewer.balance });
      return;
    }

    // --- Rangliste ---
    if (req.method === 'GET' && url.pathname === '/api/leaderboard') {
      const data = loadData();
      const top = Object.values(data.viewers)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 20)
        .map((v) => ({ displayName: v.displayName || v.login, balance: v.balance }));
      send(res, 200, { currencyName: config.currencyName, currencyEmoji: config.currencyEmoji, top });
      return;
    }

    // --- Admin: nur der Broadcaster selbst ---
    if (url.pathname === '/api/admin/settings') {
      const payload = verifyToken(getBearer(req));
      const broadcasterId = await resolveBroadcasterId();
      if (!payload || payload.twitchId !== broadcasterId) {
        return send(res, 403, { error: 'nur fuer den Kanal-Inhaber' });
      }
      if (req.method === 'GET') {
        send(res, 200, {
          currencyName: config.currencyName,
          currencyEmoji: config.currencyEmoji,
          pointsPerHeartbeat: config.pointsPerHeartbeat,
          heartbeatIntervalSeconds: config.heartbeatIntervalSeconds,
          dailyCheckinBonus: config.dailyCheckinBonus,
        });
        return;
      }
      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        for (const key of ['currencyName', 'currencyEmoji', 'pointsPerHeartbeat', 'heartbeatIntervalSeconds', 'dailyCheckinBonus']) {
          if (key in body) config[key] = body[key];
        }
        saveConfig();
        send(res, 200, { ok: true });
        return;
      }
    }

    send(res, 404, { error: 'nicht gefunden' });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: String(err.message || err) });
  }
});

mkdirSync(join(__dirname, 'data'), { recursive: true });
if (!existsSync(DATA_PATH)) {
  writeFileSync(DATA_PATH, JSON.stringify({ viewers: {} }, null, 2));
}
if (!config.sessionSecret || config.sessionSecret.startsWith('irgendein')) {
  config.sessionSecret = randomBytes(32).toString('hex');
  saveConfig();
  console.log('Hinweis: sessionSecret war noch Platzhalter, habe automatisch einen zufaelligen erzeugt.');
}

server.listen(config.port, () => {
  console.log(`Viewer-Hub laeuft auf http://localhost:${config.port}`);
  console.log(`Waehrung: ${config.currencyName} ${config.currencyEmoji}`);
});
