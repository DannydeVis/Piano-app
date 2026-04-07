// Transpositie-trainer: speel een bekende melodie in een andere toonsoort.
// Essentieel piano-meester vaardigheid — leer los te komen van één vaste positie.

import { nameToMidi, midiToName } from "./music.js";

// Halve-toon-afstand van elke nootnaam t.o.v. C in octaaf 0.
const ROOT_MIDI = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
  E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8,
  Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};

// Transponeer een array MIDI-nummers met `semitones` halve tonen.
export function transposeMidis(midis, semitones) {
  return midis.map((m) => m + semitones);
}

// Bereken hoeveel halve tonen er tussen twee toonsoort-namen zitten (van → naar).
// Resultaat: kortste weg (-6..+6), zodat de melodie dicht bij het origineel blijft.
export function intervalBetweenKeys(fromKey, toKey) {
  const f = ROOT_MIDI[fromKey] ?? 0;
  const t = ROOT_MIDI[toKey] ?? 0;
  let diff = ((t - f) + 12) % 12;
  // Kies kortste weg zodat we niet meer dan 6 halve tonen verschuiven
  if (diff > 6) diff -= 12;
  return diff;
}

// Mooi label voor een transposie-interval ("een kwart omhoog", "een grote terts omlaag", enz.)
const INTERVAL_LABELS = {
  "-6": "een tritonus",
  "-5": "een kwart omlaag",
  "-4": "een grote terts omlaag",
  "-3": "een kleine terts omlaag",
  "-2": "een grote secunde omlaag",
  "-1": "een halve toon omlaag",
  "0":  "dezelfde toonsoort",
  "1":  "een halve toon omhoog",
  "2":  "een grote secunde omhoog",
  "3":  "een kleine terts omhoog",
  "4":  "een grote terts omhoog",
  "5":  "een kwart omhoog",
  "6":  "een tritonus",
};

export function intervalLabel(semitones) {
  return INTERVAL_LABELS[String(semitones)] || `${semitones > 0 ? "+" : ""}${semitones} halve tonen`;
}

// Lijst van toonsoorten die goed oefenbaar zijn (geen extreem veel kruisen/mollen)
export const TRANSPOSE_KEYS = [
  "C", "G", "D", "A", "F", "Bb", "Eb", "E", "Ab",
];

// Genereer een drill-reeks: vandaag de 5 dichtstbijzijnde naburige toonsoorten
// (kwintencirkel-buren) zodat het een progressief pad is.
export function drillSequence(startKey = "C") {
  // Kwintencirkel vooruit (+7 halve tonen) en achteruit (-7 = +5)
  const all = TRANSPOSE_KEYS;
  const startIdx = all.indexOf(startKey);
  const order = [];
  for (let step = 1; step <= 4; step++) {
    const up   = all[(startIdx + step) % all.length];
    const down = all[((startIdx - step) + all.length) % all.length];
    if (!order.includes(up))   order.push(up);
    if (!order.includes(down)) order.push(down);
  }
  return order.slice(0, 6);
}

// Converteer noot-namen (zoals in SONGS) naar MIDI voor een hele melodie.
export function songNotesToMidis(notes) {
  return notes.map((n) => nameToMidi(n));
}

// Welke liedjes zijn geschikt voor transpositie-oefening (niet te lang, niet te hoog bereik)
export const TRANSPOSABLE_SONGS = [
  { id: "vader-jacob",    title: "Vader Jacob",             originalKey: "C" },
  { id: "twinkle",        title: "Twinkle Twinkle",         originalKey: "C" },
  { id: "ode",            title: "Ode aan de Vreugde",      originalKey: "C" },
  { id: "happy-birthday", title: "Happy Birthday",          originalKey: "C" },
  { id: "jingle-bells",   title: "Jingle Bells (refrein)",  originalKey: "C" },
  { id: "mary-lamb",      title: "Mary had a Little Lamb",  originalKey: "E" },
  { id: "london-bridge",  title: "London Bridge",           originalKey: "C" },
];
