// Erzeugt 30 animierte Chinchilla-Emotes als Frame-Streifen (ein HTML pro Emote,
// alle Frames nebeneinander als statische Posen -> EIN Chromium-Screenshot pro
// Emote statt einem pro Frame. Danach schneidet render.sh die Streifen in
// Einzelbilder und baut daraus GIFs.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'strips');
mkdirSync(OUT, { recursive: true });

const TAU = Math.PI * 2;
const DARK = '#151515';
const FUR = '#595552';
const FUR_MID = '#777573';
const EAR_OUT = '#595552';
const EAR_IN = '#d6c5bc';
const CHEEK = '#babcbd';
const CYAN = '#79e6e8';
const PINK = '#ff9ac0';
const ALMOND = '#d9a441';

const round = (n) => Math.round(n * 100) / 100;

// ---------- Bewegungs-Helfer (reine Mathe, t in [0,1)) ----------
function bounceY(t, amp = 8) { return round(-amp * Math.sin(Math.PI * t)); }
function squash(t, amt = 0) { const s = Math.sin(Math.PI * t); return { sx: round(1 - amt * s), sy: round(1 + amt * s) }; }
function wiggle(t, amp = 6, base = 0, phase = 0) { return round(base + amp * Math.sin(TAU * t + phase)); }
function pulse01(t, phase = 0) { return round((Math.sin(TAU * t + phase) + 1) / 2); }
function sawtoothFall(t, phase = 0) { return round(((t + phase) % 1)); } // 0..1 steigend, dann Sprung

// ---------- Basis-Körperteile ----------
// Nur Ohren+Kopf (OHNE eigene Bounce-Transform -- die kommt jetzt von außen,
// damit Brille/Augen/Mund/Requisiten beim Stauchen/Strecken mit dem Kopf
// mitwandern statt fix stehen zu bleiben).
function earsHead(t, { earAmp = 6 } = {}) {
  const earL = wiggle(t, earAmp, -18, 0.3);
  const earR = wiggle(t, earAmp, 18, Math.PI + 0.3);
  return `
    <!-- Große, seitlich hinter dem Kopf angesetzte Blattohren mit dünnem Fellrand. -->
    <g transform="rotate(${earL} 30 44)">
      <path d="M30 51 C17 48 10 30 12 14 C13 6 17 3 22 4 C35 6 44 22 43 35 C42 44 37 50 30 51 Z" fill="${EAR_OUT}" stroke="${DARK}" stroke-width="2"/>
      <path d="M30 46 C21 43 15 28 17 15 C18 9 20 8 23 9 C33 12 39 25 38 35 C37 41 34 45 30 46 Z" fill="${EAR_IN}"/>
    </g>
    <g transform="rotate(${earR} 82 44)">
      <path d="M82 51 C95 48 102 30 100 14 C99 6 95 3 90 4 C77 6 68 22 69 35 C70 44 75 50 82 51 Z" fill="${EAR_OUT}" stroke="${DARK}" stroke-width="2"/>
      <path d="M82 46 C91 43 97 28 95 15 C94 9 92 8 89 9 C79 12 73 25 74 35 C75 41 78 45 82 46 Z" fill="${EAR_IN}"/>
    </g>
    <circle cx="56" cy="62" r="46" fill="url(#fur)" stroke="${DARK}" stroke-width="3"/>
    <circle cx="56" cy="90" r="20" fill="${CHEEK}"/>`;
}

function glasses() {
  return `
    <circle cx="40" cy="62" r="15" fill="none" stroke="${DARK}" stroke-width="4.5"/>
    <circle cx="72" cy="62" r="15" fill="none" stroke="${DARK}" stroke-width="4.5"/>
    <path d="M 55 62 L 57 62" stroke="${DARK}" stroke-width="4.5"/>
    <path d="M 25 60 L 15 58" stroke="${DARK}" stroke-width="4" stroke-linecap="round"/>
    <path d="M 87 60 L 97 58" stroke="${DARK}" stroke-width="4" stroke-linecap="round"/>`;
}

function sunglasses() {
  return `
    <path d="M26 58 q14 -8 28 0 q14 -8 28 0 l-2 10 q-12 8 -26 0 q-14 8 -26 0 Z" fill="${DARK}" stroke="${DARK}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="38" cy="63" rx="3" ry="2" fill="#ffffff" opacity="0.35"/>
    <ellipse cx="70" cy="63" rx="3" ry="2" fill="#ffffff" opacity="0.35"/>`;
}

function pawAt(cx, cy, rot = 0, fill = CHEEK) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="11" ry="14" fill="${fill}" stroke="${DARK}" stroke-width="3" transform="rotate(${rot} ${cx} ${cy})"/>`;
}

// ---------- Augen / Brauen / Mund ----------
function eyesRound(t, { r = 7, pupilDX = 0, pupilDY = 0, blink = true, highlight = true } = {}) {
  const open = blink && t > 0.84 && t < 0.94 ? 0.12 : 1;
  const ry = round(r * open);
  return `
    <g style="transform-origin:40px 60px" transform="scale(1 ${open})">
      <ellipse cx="40" cy="60" rx="${r}" ry="${r}" fill="${DARK}"/>
      ${highlight ? `<circle cx="${40 + pupilDX - 2}" cy="${60 + pupilDY - 2.5}" r="1.5" fill="#ffffff"/>` : ''}
    </g>
    <g style="transform-origin:72px 60px" transform="scale(1 ${open})">
      <ellipse cx="72" cy="60" rx="${r}" ry="${r}" fill="${DARK}"/>
      ${highlight ? `<circle cx="${72 + pupilDX - 2}" cy="${60 + pupilDY - 2.5}" r="1.5" fill="#ffffff"/>` : ''}
    </g>`;
}
function eyesArcHappy(flip = false) {
  const d1 = flip ? 'M 32 54 Q 40 62 48 54' : 'M 32 58 Q 40 50 48 58';
  const d2 = flip ? 'M 64 54 Q 72 62 80 54' : 'M 64 58 Q 72 50 80 58';
  return `<path d="${d1}" fill="none" stroke="${DARK}" stroke-width="4.5" stroke-linecap="round"/>
          <path d="${d2}" fill="none" stroke="${DARK}" stroke-width="4.5" stroke-linecap="round"/>`;
}
function eyesClosedFlat(droop = 0) {
  return `<path d="M 31 ${60+droop} L 49 ${60+droop}" stroke="${DARK}" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M 63 ${60+droop} L 81 ${60+droop}" stroke="${DARK}" stroke-width="4.5" stroke-linecap="round"/>`;
}
function eyesHeart() {
  const h = (cx) => `<path d="M${cx-9} 56 c-3-5 2-10 6-6 l3 3 l3-3 c4-4 9 1 6 6 l-9 9 Z" fill="${PINK}" stroke="${DARK}" stroke-width="2"/>`;
  return h(40) + h(72);
}
function eyesSpiral(t) {
  const rot = round(t * 360);
  const spiral = (cx) => `<g style="transform-origin:${cx}px 60px" transform="rotate(${rot})">
      <path d="M${cx} 60 m-7 0 a7 7 0 1 1 14 0 a4.5 4.5 0 1 1 -9 0 a2 2 0 1 1 4 0" fill="none" stroke="${DARK}" stroke-width="2.2"/>
    </g>`;
  return spiral(40) + spiral(72);
}
function browAngry() {
  return `<path d="M28 38 L50 46" stroke="${DARK}" stroke-width="4" stroke-linecap="round"/>
          <path d="M84 38 L62 46" stroke="${DARK}" stroke-width="4" stroke-linecap="round"/>`;
}
function browConfused() {
  return `<path d="M30 40 Q40 34 50 40" stroke="${DARK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <path d="M64 42 L80 38" stroke="${DARK}" stroke-width="3.5" stroke-linecap="round"/>`;
}
function browSmirk() {
  return `<path d="M62 38 L82 34" stroke="${DARK}" stroke-width="3.5" stroke-linecap="round"/>`;
}
function browFocus() {
  return `<path d="M28 40 L50 46" stroke="${DARK}" stroke-width="4" stroke-linecap="round"/>
          <path d="M84 40 L62 46" stroke="${DARK}" stroke-width="4" stroke-linecap="round"/>`;
}

function mouthSmile() { return `<path d="M46 86 Q56 93 66 86" fill="none" stroke="${DARK}" stroke-width="3.2" stroke-linecap="round"/>`; }
function mouthOpenOval(big = false) { const ry = big ? 13 : 9; return `<ellipse cx="56" cy="${82+ry/2}" rx="${big?11:8}" ry="${ry}" fill="${DARK}"/>${big?`<ellipse cx="56" cy="${82+ry/2-2}" rx="6" ry="6" fill="${PINK}"/>`:''}`; }
function mouthFrown() { return `<path d="M46 90 Q56 83 66 90" fill="none" stroke="${DARK}" stroke-width="3.2" stroke-linecap="round"/>`; }
function mouthFlat() { return `<path d="M48 86 L64 86" stroke="${DARK}" stroke-width="3.2" stroke-linecap="round"/>`; }
function mouthWavy() { return `<path d="M46 86 Q51 82 56 86 Q61 90 66 86" fill="none" stroke="${DARK}" stroke-width="3" stroke-linecap="round"/>`; }
function mouthSmirk() { return `<path d="M48 88 Q58 90 67 82" fill="none" stroke="${DARK}" stroke-width="3.2" stroke-linecap="round"/>`; }
function mouthGrimace() { return `<path d="M44 87 L68 87 M48 87 L46 92 M56 87 L56 92 M64 87 L62 92" stroke="${DARK}" stroke-width="2.6" stroke-linecap="round"/>`; }
function mouthYawn() { return `<ellipse cx="56" cy="90" rx="9" ry="14" fill="${DARK}"/><ellipse cx="56" cy="86" rx="5" ry="5" fill="${PINK}"/>`; }
function nose() { return `<ellipse cx="56" cy="80" rx="9" ry="7" fill="${DARK}"/>`; }

// ---------- Props ----------
function tear(t, cx, phase = 0) {
  const local = sawtoothFall(t, phase);
  const y = 68 + local * 24;
  const op = local < 0.85 ? 1 : round(1 - (local - 0.85) / 0.15);
  return `<path d="M${cx} ${y} c4 4 4 9 0 12 c-4 -3 -4 -8 0 -12 Z" fill="${CYAN}" stroke="${DARK}" stroke-width="1.6" opacity="${op}"/>`;
}
function sweatDrop(t, cx = 86, cy = 46) {
  const b = pulse01(t, 0);
  const y = cy + b * 6;
  return `<path d="M${cx} ${y} c5 5 5 11 0 14 c-5 -3 -5 -9 0 -14 Z" fill="${CYAN}" stroke="${DARK}" stroke-width="1.6"/>`;
}
function zzz(t) {
  const items = [0, 0.33, 0.66].map((phase, i) => {
    const local = sawtoothFall(t, phase);
    const y = 26 - local * 18;
    const x = 80 + i * 10 + local * 6;
    const op = round(Math.sin(Math.PI * local));
    const size = 10 + i * 4;
    return `<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-weight="700" font-size="${size}" fill="${CYAN}" opacity="${op}">Z</text>`;
  }).join('');
  return items;
}
function steam(t) {
  const puff = (phase, dx) => {
    const local = sawtoothFall(t, phase);
    const y = 18 - local * 16;
    const op = round(Math.sin(Math.PI * local) * 0.8);
    return `<ellipse cx="${56+dx}" cy="${y}" rx="6" ry="8" fill="#cfcfd8" opacity="${op}"/>`;
  };
  return puff(0, -10) + puff(0.5, 10);
}
function exclaim(t) {
  const b = round(Math.sin(Math.PI * t) * 6);
  return `<g transform="translate(0 ${-b})">
    <rect x="52" y="4" width="8" height="18" rx="3" fill="${PINK}" stroke="${DARK}" stroke-width="2"/>
    <circle cx="56" cy="28" r="4.5" fill="${PINK}" stroke="${DARK}" stroke-width="2"/>
  </g>`;
}
function starBurst(t) {
  const s = round(0.6 + 0.5 * Math.sin(Math.PI * t));
  const op = round(1 - t);
  const star = (cx, cy, rot) => `<path transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s})" d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill="${CYAN}" opacity="${op}"/>`;
  return star(20, 16, 10) + star(92, 14, -15) + star(56, 2, 0);
}
function confetti(t) {
  const colors = [CYAN, PINK, ALMOND];
  return colors.map((c, i) => {
    const phase = i / 3;
    const local = sawtoothFall(t, phase);
    const x = 16 + i * 40 + Math.sin(local * TAU) * 6;
    const y = 2 + local * 40;
    const rot = round(local * 300);
    return `<rect x="${x}" y="${y}" width="6" height="6" fill="${c}" transform="rotate(${rot} ${x} ${y})"/>`;
  }).join('');
}
function partyHat() {
  return `<path d="M56 2 L74 34 L38 34 Z" fill="${PINK}" stroke="${DARK}" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="56" cy="2" r="4" fill="${CYAN}" stroke="${DARK}" stroke-width="2"/>`;
}
function halo(t) {
  const y = 6 + round(Math.sin(TAU * t) * 2);
  return `<ellipse cx="56" cy="${y}" rx="18" ry="6" fill="none" stroke="${ALMOND}" stroke-width="4"/>`;
}
function blush() {
  return `<ellipse cx="30" cy="74" rx="7" ry="4.5" fill="${PINK}" opacity="0.55"/>
          <ellipse cx="82" cy="74" rx="7" ry="4.5" fill="${PINK}" opacity="0.55"/>`;
}
function question(t, flip = false) {
  const b = round(Math.sin(Math.PI * t) * 4);
  return `<text x="${flip?8:88}" y="${30-b}" font-family="Arial,sans-serif" font-weight="700" font-size="26" fill="${CYAN}">?</text>`;
}
function orbitStars(t) {
  const a = (cx, cy, r, phase, color) => {
    const ang = TAU * t + phase;
    const x = cx + Math.cos(ang) * r;
    const y = cy + Math.sin(ang) * r * 0.5;
    return `<path transform="translate(${round(x)} ${round(y)}) scale(0.8)" d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill="${color}" stroke="${DARK}" stroke-width="1.2"/>`;
  };
  return a(56, 16, 36, 0, PINK) + a(56, 16, 36, Math.PI, CYAN);
}
function impactLines(t) {
  const op = round(Math.max(0, 1 - (t % 0.5) * 4));
  return `<g opacity="${op}">
    <path d="M30 60 L18 56" stroke="${DARK}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M82 60 L94 56" stroke="${DARK}" stroke-width="2.5" stroke-linecap="round"/>
  </g>`;
}

// ---------- Die 30 Emotes ----------
const EMOTES = [
  { name: 'balu84Hype', loopMs: 800, bounceAmp: 12, earAmp: 10, stretch: 0.07,
    draw: (t) => eyesArcHappy() + nose() + mouthOpenOval(true) + starBurst(pulse01(t)) + pawAt(16,44,wiggle(t,20,-20),CHEEK) + pawAt(96,44,wiggle(t,20,20),CHEEK) },

  { name: 'balu84Love', loopMs: 1400, bounceAmp: 4, earAmp: 4,
    draw: (t) => eyesHeart() + nose() + mouthSmile() + (() => { const local=sawtoothFall(t,0); const y=round(24-local*26); const op=round(Math.sin(Math.PI*local)); return `<path d="M56 ${y} c-4-6 4-12 8-5 c4-7 12-1 8 5 l-8 9 Z" fill="${PINK}" stroke="${DARK}" stroke-width="2" opacity="${op}"/>`; })(), noBlink: true },

  { name: 'balu84LOL', loopMs: 700, bounceAmp: 10, earAmp: 10, stretch: 0.08, tilt: 7,
    draw: (t) => eyesArcHappy(true) + nose() + mouthOpenOval(false), noBlink: true },

  { name: 'balu84Think', loopMs: 1500, bounceAmp: 3, earAmp: 3,
    draw: (t) => eyesRound(t, { pupilDY: -2 }) + nose() + mouthFlat() + question(t) + pawAt(78, 90, wiggle(t,6,-18), CHEEK) },

  { name: 'balu84Mandel', loopMs: 850, bounceAmp: 10, earAmp: 8, stretch: 0.05,
    draw: (t) => eyesArcHappy() + nose() + mouthSmile() +
      (() => { const b = round(Math.sin(Math.PI*t)*14); const shine = pulse01(t); return `
        <g transform="translate(0 ${-b})">
          <path d="M56 6 C66 6 70 20 61 32 C58 37 56 42 56 42 C56 42 54 37 51 32 C42 20 46 6 56 6 Z" fill="${ALMOND}" stroke="${DARK}" stroke-width="2.5"/>
          <path d="M60 14 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5-4 l-4-1.5 l4-1.5 Z" fill="#fff6e0" opacity="${shine}"/>
        </g>
        ${pawAt(16,48,wiggle(t,18,-20)-b*0.6,CHEEK)}${pawAt(96,48,wiggle(t,18,20)+b*0.6,CHEEK)}`; })() },

  { name: 'balu84Sad', loopMs: 1600, bounceAmp: 2, earAmp: 2,
    draw: (t) => `<path d="M28 50 Q40 46 50 52" stroke="${DARK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M84 50 Q72 46 62 52" stroke="${DARK}" stroke-width="3" fill="none" stroke-linecap="round"/>` + eyesRound(t,{r:6}) + nose() + mouthFrown() + tear(t, 38) },

  { name: 'balu84Cry', loopMs: 650, bounceAmp: 6, earAmp: 8,
    draw: (t) => eyesClosedFlat(-2) + nose() + mouthOpenOval(true) + tear(t, 34, 0) + tear(t, 78, 0.4) + tear(t, 34, 0.5), noBlink: true },

  { name: 'balu84Rage', loopMs: 600, bounceAmp: 6, earAmp: 12,
    draw: (t) => browAngry() + eyesRound(t,{r:5.5, blink:false}) + nose() + mouthGrimace() + steam(t) + `<ellipse cx="26" cy="74" rx="7" ry="4.5" fill="${PINK}" opacity="0.4"/><ellipse cx="86" cy="74" rx="7" ry="4.5" fill="${PINK}" opacity="0.4"/>` },

  { name: 'balu84Shock', loopMs: 650, bounceAmp: 10, earAmp: 14,
    draw: (t) => eyesRound(t,{r:9, blink:false}) + nose() + mouthOpenOval(true) + exclaim(t) },

  { name: 'balu84Sleepy', loopMs: 1800, bounceAmp: 2, earAmp: 2,
    draw: (t) => eyesClosedFlat(2) + nose() + mouthFlat() + zzz(t), noBlink: true },

  { name: 'balu84Cool', loopMs: 1200, bounceAmp: 4, earAmp: 5,
    draw: (t) => mouthSmirk(), replaceGlasses: sunglasses(), noBlink: true },

  { name: 'balu84Wink', loopMs: 1200, bounceAmp: 4, earAmp: 5,
    draw: (t) => `
      <ellipse cx="40" cy="60" rx="7" ry="7" fill="${DARK}"/>
      <circle cx="38" cy="57.5" r="2" fill="#f6f1e7"/>
      <path d="M64 60 L80 60" stroke="${DARK}" stroke-width="4.5" stroke-linecap="round"/>
    ` + nose() + mouthSmirk(), noBlink: true },

  { name: 'balu84Facepalm', loopMs: 1300, bounceAmp: 3, earAmp: 4,
    draw: (t) => {
      const local = round((1 - Math.cos(TAU * t)) / 2); // 0 (versteckt) -> 1 (volle Deckung) -> 0
      const x0 = 96, y0 = 6, x1 = 56, y1 = 60;
      const x = round(x0 + (x1 - x0) * local);
      const y = round(y0 + (y1 - y0) * local);
      const rot = round(-34 + 34 * local);
      return eyesRound(t, { r: 6 }) + nose() + mouthFlat() +
        `<ellipse cx="${x}" cy="${y}" rx="15" ry="19" fill="${CHEEK}" stroke="${DARK}" stroke-width="3" transform="rotate(${rot} ${x} ${y})"/>`;
    } },

  { name: 'balu84Clap', loopMs: 500, bounceAmp: 8, earAmp: 10,
    draw: (t) => eyesArcHappy() + nose() + mouthSmile() +
      (() => { const open = round(Math.abs(Math.sin(Math.PI*t))*22); const y=100; return pawAt(56-20-open,y,-24) + pawAt(56+20+open,y,24) + impactLines(t); })() },

  { name: 'balu84Scared', loopMs: 500, bounceAmp: 3, earAmp: 16,
    draw: (t) => eyesRound(t,{r:9, blink:false}) + nose() + `<ellipse cx="56" cy="88" rx="5" ry="6" fill="${DARK}"/>` + sweatDrop(t) },

  { name: 'balu84Confused', loopMs: 1400, bounceAmp: 3, earAmp: 4,
    draw: (t) => browConfused() + eyesRound(t,{pupilDX:3}) + nose() + mouthWavy() + question(t) +
      `<g style="transform-origin:56px 65px" transform="rotate(${wiggle(t,5,0)})"></g>` },

  { name: 'balu84GG', loopMs: 900, bounceAmp: 8, earAmp: 8,
    draw: (t) => eyesArcHappy() + nose() + mouthSmile() +
      (() => { const b = wiggle(t,10,-10); return `<g transform="translate(14 44) rotate(${b})"><ellipse cx="0" cy="0" rx="10" ry="13" fill="${CHEEK}" stroke="${DARK}" stroke-width="3"/><rect x="-3" y="-20" width="6" height="12" rx="3" fill="${CHEEK}" stroke="${DARK}" stroke-width="2.5"/></g>` })() },

  { name: 'balu84MindBlown', loopMs: 700, bounceAmp: 12, earAmp: 16,
    draw: (t) => eyesRound(t,{r:9,blink:false}) + nose() + mouthOpenOval(true) + starBurst(t) },

  { name: 'balu84EyeRoll', loopMs: 1400, bounceAmp: 2, earAmp: 3,
    draw: (t) => eyesRound(t, { pupilDX: round(Math.sin(TAU*t)*3), pupilDY: round(-2 - Math.cos(TAU*t)*3), blink:false }) + nose() + mouthFlat() },

  { name: 'balu84Sweat', loopMs: 1300, bounceAmp: 3, earAmp: 4,
    draw: (t) => eyesRound(t,{r:6.5}) + nose() + mouthWavy() + sweatDrop(t) },

  { name: 'balu84Party', loopMs: 800, bounceAmp: 9, earAmp: 9,
    draw: (t) => eyesArcHappy() + nose() + mouthOpenOval() + confetti(t), extraTopmost: partyHat() },

  { name: 'balu84Blush', loopMs: 1500, bounceAmp: 3, earAmp: 3,
    draw: (t) => eyesRound(t,{r:6}) + nose() + mouthSmile() + blush() },

  { name: 'balu84Smirk', loopMs: 1300, bounceAmp: 3, earAmp: 4,
    draw: (t) => browSmirk() + eyesRound(t,{r:5.5}) + nose() + mouthSmirk() },

  { name: 'balu84Yawn', loopMs: 1700, bounceAmp: 5, earAmp: 4,
    draw: (t) => eyesClosedFlat(0) + nose() + mouthYawn() + pawAt(74, 92, wiggle(t,6,-10), CHEEK), noBlink: true },

  { name: 'balu84Dizzy', loopMs: 900, bounceAmp: 5, earAmp: 10, tilt: 8,
    draw: (t) => eyesSpiral(t) + nose() + mouthWavy() + orbitStars(t), noBlink: true },

  { name: 'balu84Focus', loopMs: 1100, bounceAmp: 3, earAmp: 3,
    draw: (t) => browFocus() + eyesRound(t,{r:5.5, blink:false}) + nose() + mouthFlat() + pawAt(14,70,wiggle(t,4,0)) + pawAt(98,70,wiggle(t,4,0)) },

  { name: 'balu84LMAO', loopMs: 600, bounceAmp: 12, earAmp: 12, stretch: 0.09,
    draw: (t) => eyesArcHappy(true) + nose() + mouthOpenOval(true) + tear(t, 30, 0.2), noBlink: true },

  { name: 'balu84Shush', loopMs: 1400, bounceAmp: 3, earAmp: 3,
    draw: (t) => eyesRound(t,{r:6}) +
      `<ellipse cx="62" cy="84" rx="9" ry="16" fill="${CHEEK}" stroke="${DARK}" stroke-width="3" transform="rotate(-16 62 84)"/>` +
      (() => { const op = round(0.5 + 0.5*pulse01(t)); return `<text x="74" y="78" font-family="Arial,sans-serif" font-weight="700" font-size="16" fill="${CYAN}" opacity="${op}">...</text>`; })() },

  { name: 'balu84Salute', loopMs: 1200, bounceAmp: 5, earAmp: 5,
    draw: (t) => eyesArcHappy() + nose() + mouthFlat() + pawAt(78, 46, wiggle(t,4,-30), CHEEK) },

  { name: 'balu84Angel', loopMs: 1600, bounceAmp: 3, earAmp: 3,
    draw: (t) => eyesArcHappy() + nose() + mouthSmile() + halo(t), noBlink: true },
];

const manifest = [];

for (const e of EMOTES) {
  const frames = e.frames || 12;
  const cells = [];
  for (let i = 0; i < frames; i++) {
    const t = i / frames;
    const by = bounceY(t, e.bounceAmp ?? 8);
    const ss = squash(t, e.stretch ?? 0);
    const tiltAngle = wiggle(t, e.tilt ?? 0, 0);
    const body = earsHead(t, e);
    const eyewear = e.replaceGlasses ?? glasses();
    const extra = e.draw(t);
    const topmost = e.extraTopmost || '';
    cells.push(`<g transform="translate(${i * 112} 0)" clip-path="url(#cell)"><g transform="translate(0 ${by}) scale(${ss.sx} ${ss.sy}) rotate(${tiltAngle})" style="transform-origin:56px 70px">${body}${eyewear}${extra}${topmost}</g></g>`);
  }
  const svg = `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;background:transparent;overflow:hidden;}
    svg{display:block;}
  </style></head><body>
  <svg width="${frames * 112}" height="112" viewBox="0 0 ${frames * 112} 112" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="fur" cx="50%" cy="90%" r="88%">
        <stop offset="0%" stop-color="${CHEEK}"/>
        <stop offset="55%" stop-color="${FUR_MID}"/>
        <stop offset="100%" stop-color="${FUR}"/>
      </radialGradient>
      <clipPath id="cell" clipPathUnits="userSpaceOnUse"><rect x="0" y="0" width="112" height="112"/></clipPath>
    </defs>
    ${cells.join('\n')}
  </svg>
  </body></html>`;
  writeFileSync(join(OUT, `${e.name}.html`), svg);
  manifest.push({ name: e.name, frames, loopMs: e.loopMs });
}

writeFileSync(join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`fertig: ${EMOTES.length} Emote-Streifen in ${OUT}`);
