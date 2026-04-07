// Bladlees-trainer: genereert korte frases in een gekozen toonsoort en bereik,
// zodat de speler vooruit-lezen kan oefenen. Niet 1 noot maar 4–8 achter elkaar.
//
// Het hart is genPhrase(): kiest diatonisch lopende noten met kleine sprongen,
// vermijdt te grote intervallen, en blijft binnen het gekozen octaaf-bereik.

import { scaleMidisInKey } from "./theory.js";

// Niveau's: bepalen lengte en hoeveel sprongen zijn toegestaan.
export const SIGHTREAD_LEVELS = [
  {
    id: "beginner",
    name: "Beginner — 4 noten, alleen stapsgewijs",
    length: 4,
    maxLeap: 2,    // max 2 scale-steps
    octaves: 1,
  },
  {
    id: "easy",
    name: "Makkelijk — 6 noten, kleine sprongen",
    length: 6,
    maxLeap: 3,
    octaves: 1,
  },
  {
    id: "medium",
    name: "Gevorderd — 8 noten, tertsen en kwarten",
    length: 8,
    maxLeap: 4,
    octaves: 2,
  },
  {
    id: "hard",
    name: "Moeilijk — 10 noten, grote sprongen",
    length: 10,
    maxLeap: 6,
    octaves: 2,
  },
];

export function findLevel(id) {
  return SIGHTREAD_LEVELS.find((l) => l.id === id) || SIGHTREAD_LEVELS[0];
}

// Maak een scale-pool van X octaven startend op octaaf 4 voor de gekozen toonsoort.
function buildScalePool(keyName, octaves) {
  const pool = [];
  for (let o = 0; o < octaves; o++) {
    const midis = scaleMidisInKey(keyName, 4 + o).slice(0, 7); // 7 tonen per octaaf
    pool.push(...midis);
  }
  return pool;
}

// Genereer een frase in de gegeven toonsoort.
// Startnoot is meestal tonica of dominant, eindigt idealiter op een "rustige" toon.
export function genPhrase(keyName, levelId) {
  const level = findLevel(levelId);
  const pool = buildScalePool(keyName, level.octaves);
  const n = pool.length;

  // Start rond het midden zodat beide richtingen mogelijk zijn.
  let idx = Math.floor(n / 2);
  // Voorkeur voor tonica of dominant als startnoot
  const startCandidates = [];
  for (let i = 0; i < n; i++) {
    const scaleDegree = i % 7;
    if (scaleDegree === 0 || scaleDegree === 4) startCandidates.push(i);
  }
  if (startCandidates.length) {
    // kies het dichtstbijzijnde bij het midden
    idx = startCandidates.reduce((best, cand) =>
      Math.abs(cand - n / 2) < Math.abs(best - n / 2) ? cand : best,
    startCandidates[0]);
  }

  const out = [pool[idx]];
  for (let i = 1; i < level.length; i++) {
    // Kies een stap: -maxLeap..+maxLeap, weging richting kleine stappen
    const stepRange = [];
    for (let s = -level.maxLeap; s <= level.maxLeap; s++) {
      if (s === 0) continue;
      // Kleinere sprongen krijgen meer gewicht
      const weight = Math.max(1, level.maxLeap + 1 - Math.abs(s));
      for (let w = 0; w < weight; w++) stepRange.push(s);
    }
    let step = stepRange[Math.floor(Math.random() * stepRange.length)];
    let next = idx + step;
    // Clamp binnen de pool
    if (next < 0 || next >= n) next = idx - step;
    if (next < 0) next = 0;
    if (next >= n) next = n - 1;
    idx = next;
    out.push(pool[idx]);
  }

  // Eindig liefst op de tonica of dominant voor een afgerond gevoel
  const lastDegree = pool.indexOf(out[out.length - 1]) % 7;
  if (lastDegree !== 0 && lastDegree !== 4 && Math.random() < 0.5) {
    // Zoek dichtstbijzijnde tonica
    const lastIdx = pool.indexOf(out[out.length - 1]);
    let closestTonic = 0;
    let bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      if (i % 7 === 0 && Math.abs(i - lastIdx) < bestDist) {
        bestDist = Math.abs(i - lastIdx);
        closestTonic = i;
      }
    }
    if (bestDist <= level.maxLeap) {
      out[out.length - 1] = pool[closestTonic];
    }
  }

  return out;
}
