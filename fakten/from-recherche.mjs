// Übernimmt aus fakten/recherche/<name>.md alle Fakten mit Sicherheit "hoch"
// in fakten/<name>.txt (ein Fakt pro Zeile). Danach `node fakten/build.mjs`.
//
// Start: node fakten/from-recherche.mjs technik
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
if (!name) {
  console.error('Aufruf: node fakten/from-recherche.mjs <retro|chinchilla|technik>');
  process.exit(1);
}

// Im Chat liest das Publikum mit: "dein PC" würde den Zuschauer meinen.
const replacements = [
  [/\bDein Ryzen 9 7950X\b/g, 'Balus Ryzen 9 7950X'],
  [/\bdeinem Ryzen 9 7950X\b/g, 'Balus Ryzen 9 7950X'],
  [/\bDein heutiges\b/g, 'Heutiges'],
];

const md = readFileSync(join(here, 'recherche', `${name}.md`), 'utf-8');
const facts = [];
let skipped = 0;
for (const line of md.split('\n')) {
  const m = line.match(/^\|\s*\d+\s*\|(.+)\|(.+)\|\s*(hoch|mittel)\s*\|\s*$/i);
  if (!m) continue;
  if (m[3].toLowerCase() !== 'hoch') { skipped++; continue; }
  let fact = m[1].trim();
  for (const [re, to] of replacements) fact = fact.replace(re, to);
  facts.push(fact);
}
const leftover = facts.filter((f) => /\b(dein|deine|deinem|deinen)\b/i.test(f));
if (leftover.length) console.warn('Achtung, Anrede an Zuschauer übrig:\n' + leftover.join('\n'));
writeFileSync(join(here, `${name}.txt`), facts.join('\n') + '\n');
console.log(`${name}: ${facts.length} Fakten übernommen, ${skipped} mit "mittel" ausgelassen`);
