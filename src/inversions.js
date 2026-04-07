// Akkoord-omkeringen: root, eerste, tweede en (voor 7-akkoorden) derde omkering.
// Omkeringen zijn essentieel voor smooth voice leading: in plaats van altijd
// van grondligging naar grondligging te springen, gebruik je de dichtstbijzijnde ligging.
//
// Slash-notatie: C/E = C-majeur, E in de bas (1e omkering).

import { nameToMidi, midiToName, NOTE_NAMES_SHARP } from "./music.js";
import { CHORD_TYPES, findChordType, chordMidis } from "./leadsheet.js";

// Bereken de MIDI-noten voor een omkeringsnummer (0 = grondligging, 1 = 1e, 2 = 2e, 3 = 3e).
// Geeft een oplopende reeks noten terug waarbij de laagste noot de "bass" van de omkering is.
export function inversionMidis(rootName, typeId, inversionNum, octave = 4) {
  const type = findChordType(typeId);
  const root = nameToMidi(rootName + octave);
  // Bouw grondligging
  const base = type.intervals.map((i) => root + i);
  // Verschuif de eerste `inversionNum` noten een octaaf omhoog
  const notes = base.map((m, i) => (i < inversionNum ? m + 12 : m));
  return notes.sort((a, b) => a - b);
}

// Slash-notatie voor een omkering: "C/E", "G7/B", enz.
export function inversionSymbol(rootName, typeId, inversionNum) {
  const type = findChordType(typeId);
  if (inversionNum === 0) return rootName + type.symbol;
  const root = nameToMidi(rootName + "4");
  const bassInterval = type.intervals[inversionNum];
  const bassMidi = root + bassInterval;
  const bassName = NOTE_NAMES_SHARP[bassMidi % 12];
  return rootName + type.symbol + "/" + bassName;
}

// Naam van de omkering in het Nederlands
export function inversionName(inversionNum) {
  return ["Grondligging", "Eerste omkering", "Tweede omkering", "Derde omkering"][inversionNum] || "?";
}

// Beschrijving van de bas-noot in de omkering
export function inversionBassDesc(typeId, inversionNum) {
  const descs = [
    ["Grondtoon in de bas (1)", "Terts in de bas (3)", "Kwint in de bas (5)", "Septiem in de bas (7)"],
  ];
  return ["Grondtoon in de bas", "Terts in de bas", "Kwint in de bas", "Septiem in de bas"][inversionNum] || "";
}

// Hoeveel omkeringen heeft dit type? (drieklanken = 3, septiemakkoorden = 4)
export function inversionCount(typeId) {
  const type = findChordType(typeId);
  return type.intervals.length; // 3 noten → 3 liggingen (0,1,2); 4 noten → 4 liggingen (0-3)
}

// Voice-leading: geef voor een reeks akkoorden (root+type) de best passende omkeringen
// op basis van minimale stembeweging (dichtstbijzijnde noten).
export function smoothVoiceLeading(chords, octave = 4) {
  // chords = [{ root, typeId }, ...]
  // Geeft [{ root, typeId, inversionNum, midis }, ...] terug
  if (!chords.length) return [];

  const result = [];
  let prevMidis = null;

  chords.forEach(({ root, typeId }) => {
    const count = inversionCount(typeId);
    let bestInv = 0;
    let bestCost = Infinity;
    let bestMidis = null;

    for (let inv = 0; inv < count; inv++) {
      const midis = inversionMidis(root, typeId, inv, octave);
      let cost = 0;
      if (prevMidis) {
        // Totale afstand (abs. sum) van alle stemmen naar dichtstbijzijnde vorige noot
        midis.forEach((m) => {
          const minDist = Math.min(...prevMidis.map((p) => Math.abs(m - p)));
          cost += minDist;
        });
      }
      if (cost < bestCost) {
        bestCost = cost;
        bestInv = inv;
        bestMidis = midis;
      }
    }

    result.push({ root, typeId, inversionNum: bestInv, midis: bestMidis });
    prevMidis = bestMidis;
  });

  return result;
}

// Niveau's voor de drill
export const INVERSION_LEVELS = [
  {
    id: "triads-root",
    name: "Drieklanken — grondligging vs 1e omkering",
    types: ["maj", "min"],
    inversions: [0, 1],
  },
  {
    id: "triads-all",
    name: "Drieklanken — alle liggingen",
    types: ["maj", "min", "dim"],
    inversions: [0, 1, 2],
  },
  {
    id: "seventh-basic",
    name: "Septiemakkoorden — dom7 & maj7",
    types: ["dom7", "maj7", "min7"],
    inversions: [0, 1, 2, 3],
  },
  {
    id: "all",
    name: "Alles door elkaar",
    types: ["maj", "min", "dom7", "maj7", "min7", "dim", "halfdim"],
    inversions: [0, 1, 2, 3],
  },
];

export function findInversionLevel(id) {
  return INVERSION_LEVELS.find((l) => l.id === id) || INVERSION_LEVELS[0];
}

export function randomInversionDrill(levelId) {
  const level = findInversionLevel(levelId);
  const ROOTS = ["C","D","E","F","G","A","B","Bb","Eb","Ab","F#"];
  const root   = ROOTS[Math.floor(Math.random() * ROOTS.length)];
  const typeId = level.types[Math.floor(Math.random() * level.types.length)];
  const count  = Math.min(inversionCount(typeId), level.inversions.length);
  const inv    = level.inversions[Math.floor(Math.random() * count)];
  return { root, typeId, inversionNum: inv };
}

// Voice-leading demo: neemt een PROGRESSIONS-progressie en berekent smooth liggingen
export function voiceLeadingDemo(keyName, progression, octave = 4) {
  // Importeer triadOnDegree direct hier
  // (circular import vermijden: we herhalen de logica inline)
  return smoothVoiceLeading(
    progression.degrees.map((d) => {
      // Grondtoon van de graad in de toonsoort
      const MAJOR_STEPS = [0,2,4,5,7,9,11];
      const rootMidi = nameToMidi(keyName + octave) + MAJOR_STEPS[d - 1];
      const rootName = NOTE_NAMES_SHARP[rootMidi % 12];
      const QUALITIES = ["maj","min","min","maj","maj","min","dim"];
      return { root: rootName, typeId: QUALITIES[d - 1] };
    }),
    octave,
  );
}
