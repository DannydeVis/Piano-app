// Melodie-dictee: app speelt een korte frase, gebruiker speelt hem na op de piano.
// Geen tijdsdruk — alleen pitchnauwkeurigheid telt.
// De frase wordt gegenereerd uit genPhrase() (sightread.js) of via eenvoudigere
// methode hier, zodat we het moeilijkheidsniveau fijn kunnen instellen.

import { scaleMidisInKey } from "./theory.js";
import { synth } from "./synth.js";

export const DICTEE_LEVELS = [
  {
    id: "micro",
    name: "Micro — 2 noten (stap omhoog/omlaag)",
    length: 2,
    maxLeap: 1,
    playCount: 3,   // hoe vaak mag je het afspelen
  },
  {
    id: "easy",
    name: "Makkelijk — 3–4 noten, stapsgewijs",
    length: 4,
    maxLeap: 2,
    playCount: 3,
  },
  {
    id: "medium",
    name: "Middel — 5–6 noten, kleine sprongen",
    length: 6,
    maxLeap: 3,
    playCount: 2,
  },
  {
    id: "hard",
    name: "Moeilijk — 8 noten, onbekende frase",
    length: 8,
    maxLeap: 5,
    playCount: 2,
  },
  {
    id: "expert",
    name: "Expert — 10 noten, 1× luisteren",
    length: 10,
    maxLeap: 6,
    playCount: 1,
  },
];

export function findDicteeLevel(id) {
  return DICTEE_LEVELS.find((l) => l.id === id) || DICTEE_LEVELS[1];
}

function buildScalePool(keyName) {
  const pool = [];
  for (let o = 0; o < 2; o++) {
    const midis = scaleMidisInKey(keyName, 4 + o).slice(0, 7);
    pool.push(...midis);
  }
  return pool;
}

export function genDicteeFrase(keyName, levelId) {
  const level = findDicteeLevel(levelId);
  const pool = buildScalePool(keyName);
  const n = pool.length;

  // Start op tonica octaaf 4 (pool[0])
  let idx = 0;
  const out = [pool[idx]];

  for (let i = 1; i < level.length; i++) {
    const steps = [];
    for (let s = -level.maxLeap; s <= level.maxLeap; s++) {
      if (s === 0) continue;
      const w = Math.max(1, level.maxLeap + 1 - Math.abs(s));
      for (let j = 0; j < w; j++) steps.push(s);
    }
    let step = steps[Math.floor(Math.random() * steps.length)];
    let next = idx + step;
    if (next < 0 || next >= n) next = idx - step;
    next = Math.max(0, Math.min(n - 1, next));
    idx = next;
    out.push(pool[idx]);
  }

  // Eindig op tonica of dominant
  const lastDeg = idx % 7;
  if (lastDeg !== 0 && lastDeg !== 4) {
    let best = -1, bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      if ((i % 7 === 0 || i % 7 === 4) && Math.abs(i - idx) <= level.maxLeap) {
        if (Math.abs(i - idx) < bestDist) { bestDist = Math.abs(i - idx); best = i; }
      }
    }
    if (best >= 0) out[out.length - 1] = pool[best];
  }

  return out;
}

// Speel de frase af via synth, geeft Promise die resolved als de frase klaar is.
export function playDicteeFrase(midis, bpm = 80) {
  const gapSec = 60 / bpm;
  return new Promise((resolve) => {
    synth.playMelodic(midis, { gap: gapSec, duration: gapSec * 0.85 });
    const totalMs = (midis.length * gapSec + 0.5) * 1000;
    setTimeout(resolve, totalMs);
  });
}
