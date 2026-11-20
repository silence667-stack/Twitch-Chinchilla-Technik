// Erzeugt eine Pixel-Art-Variante des Chinchilla-Maskottchens fuers
// "Night Arcade"-Motto (passend zum bestehenden OBS-Pixel-Icon-Stil).
// Das Raster wird programmatisch gefuellt (Reihen-Breiten-Tabelle statt
// handgetippter ASCII-Art), damit keine Verrutsch-Fehler durch falsch
// gezaehlte Zeichen entstehen.
import { writeFileSync } from 'node:fs';

const PX = 16;
const W = 28;
const H = 28;

const COL = {
  dark: '#151515',
  furLight: '#babcbd',
  furDark: '#595552',
  earIn: '#d6c5bc',
  cyan: '#79e6e8',
  white: '#f6f1e7',
};

const grid = Array.from({ length: H }, () => Array(W).fill(null));
function set(x, y, color) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  grid[y][x] = color;
}
function hline(y, x0, x1, color) { for (let x = x0; x <= x1; x++) set(x, y, color); }
function rect(x0, y0, x1, y1, color) { for (let y = y0; y <= y1; y++) hline(y, x0, x1, color); }

// --- Kopf-Silhouette: pro Zeile linke/rechte Fuellgrenze (symmetrisch) ---
// [row, insetFromEdge] -- Kopf spannt insgesamt Spalten 1..26
const headProfile = [
  [8, 10], [9, 6], [10, 4], [11, 3], [12, 2], [13, 2], [14, 1], [15, 1],
  [16, 1], [17, 1], [18, 2], [19, 2], [20, 3], [21, 4], [22, 5], [23, 6],
  [24, 8], [25, 10],
];
for (const [y, inset] of headProfile) {
  rect(inset, y, W - 1 - inset, y, COL.furLight);
}
// Dunklere Kontur-Reihe oben/unten fuers Rund-Gefuehl
rect(10, 8, W - 11, 8, COL.furDark);
rect(8, 24, W - 9, 25, COL.furDark);

// --- Ohren: oben links/rechts, Blattform vereinfacht als 2 Stufen ---
function ear(xBase, mirror) {
  const m = mirror ? -1 : 1;
  const at = (dx, y, color) => set(xBase + m * dx, y, color);
  // Aussenkontur (dunkel)
  for (const [dx, y] of [[0,2],[1,2],[0,3],[1,3],[2,3],[0,4],[1,4],[2,4],[0,5],[1,5],[2,5],[0,6],[1,6],[2,6],[1,7],[2,7]]) {
    at(dx, y, COL.furDark);
  }
  // Innenflaeche (hell, rosa-grau)
  for (const [dx, y] of [[1,3],[1,4],[2,4],[1,5],[2,5],[1,6]]) {
    at(dx, y, COL.earIn);
  }
}
ear(2, false);
ear(W - 3, true);

// --- Brille: zwei getrennte 5x5-Rahmen + duenne Bruecke, keine durchgehende Visierflaeche ---
function glassFrame(x0, y0) {
  rect(x0, y0, x0 + 4, y0, COL.dark);       // oben
  rect(x0, y0 + 4, x0 + 4, y0 + 4, COL.dark); // unten
  for (let y = y0 + 1; y <= y0 + 3; y++) { set(x0, y, COL.dark); set(x0 + 4, y, COL.dark); }
  rect(x0 + 1, y0 + 1, x0 + 3, y0 + 3, COL.white); // Glasflaeche hell
  set(x0 + 2, y0 + 2, COL.dark); // Pupille
}
const eyeRowTop = 12;
glassFrame(6, eyeRowTop);   // linkes Auge, Spalten 6-10
glassFrame(17, eyeRowTop);  // rechtes Auge, Spalten 17-21
hline(eyeRowTop + 2, 11, 16, COL.dark); // Bruecke mittig (ueberschreibt Fell nur auf dieser einen Zeile)

// --- Cyan-Headset-Andeutung: kleine Ohrpolster seitlich neben den Brillenbuegeln ---
rect(4, eyeRowTop + 1, 5, eyeRowTop + 3, COL.cyan);
rect(W - 6, eyeRowTop + 1, W - 5, eyeRowTop + 3, COL.cyan);

// --- Nase/Maul ---
rect(13, 20, 14, 21, COL.dark);
set(12, 22, COL.furDark);
set(15, 22, COL.furDark);

// --- SVG schreiben ---
let rects = '';
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const c = grid[y][x];
    if (!c) continue;
    rects += `<rect x="${x * PX}" y="${y * PX}" width="${PX}" height="${PX}" fill="${c}"/>`;
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W * PX} ${H * PX}" width="${W * PX}" height="${H * PX}" shape-rendering="crispEdges">
${rects}
</svg>
`;
writeFileSync(new URL('./chinchilla-pixel.svg', import.meta.url), svg);
console.log(`Pixel-Maskottchen geschrieben: ${W}x${H} Pixel`);
