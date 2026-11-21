// Erzeugt aus fakten/<name>.txt (ein Fakt pro Zeile) einzelne Dateien
// fakten/<name>/1.txt … N.txt in fester, gemischter Reihenfolge.
// Der StreamElements-Befehl zählt per $(count) hoch und holt per
// $(customapi) Datei mod(count, N)+1 – so kommt jeder Fakt einmal dran,
// bevor sich einer wiederholt.
//
// Start: node fakten/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const MAX_BYTES = 380; // $(customapi) liefert nur die ersten 400 Byte

function seededShuffle(items, seed) {
  const a = [...items];
  let s = seed;
  const rand = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

for (const [name, seed] of [['retro', 84], ['chinchilla', 1923], ['technik', 1941]]) {
  const facts = readFileSync(join(here, `${name}.txt`), 'utf-8')
    .split('\n').map((l) => l.trim()).filter(Boolean);
  const tooLong = facts.filter((f) => Buffer.byteLength(f) > MAX_BYTES);
  if (tooLong.length) {
    console.error(`${name}: ${tooLong.length} Fakt(en) über ${MAX_BYTES} Byte:\n` + tooLong.join('\n'));
    process.exit(1);
  }
  const outDir = join(here, name);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir);
  seededShuffle(facts, seed).forEach((f, i) => writeFileSync(join(outDir, `${i + 1}.txt`), f));
  console.log(`${name}: ${facts.length} Fakten -> fakten/${name}/1..${facts.length}.txt`);
}
