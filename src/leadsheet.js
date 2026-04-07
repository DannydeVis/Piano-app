// Lead-sheet akkoord-symbolen: definities, voicings en drill-generator.
// Dekt de akkoord-symbolen die je tegenkomt in jazz real books, pop lead sheets
// en kerk-/muziek-uitgaven.

import { nameToMidi, midiToName, NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from "./music.js";

// ---- Akkoord-type definities ----
// intervals: halve tonen boven de grondtoon (binnen één octaaf)
export const CHORD_TYPES = [
  // Drieklanken
  { id: "maj",    symbol: "",      name: "Majeur",            intervals: [0, 4, 7],         category: "Drieklanken" },
  { id: "min",    symbol: "m",     name: "Mineur",            intervals: [0, 3, 7],         category: "Drieklanken" },
  { id: "dim",    symbol: "°",     name: "Verminderd",        intervals: [0, 3, 6],         category: "Drieklanken" },
  { id: "aug",    symbol: "+",     name: "Overmatig",         intervals: [0, 4, 8],         category: "Drieklanken" },
  { id: "sus2",   symbol: "sus2",  name: "Sus2",              intervals: [0, 2, 7],         category: "Drieklanken" },
  { id: "sus4",   symbol: "sus4",  name: "Sus4",              intervals: [0, 5, 7],         category: "Drieklanken" },
  // Septiemakkoorden
  { id: "dom7",   symbol: "7",     name: "Dominant 7",        intervals: [0, 4, 7, 10],     category: "Septiemakkoorden" },
  { id: "maj7",   symbol: "maj7",  name: "Majeur 7",          intervals: [0, 4, 7, 11],     category: "Septiemakkoorden" },
  { id: "min7",   symbol: "m7",    name: "Mineur 7",          intervals: [0, 3, 7, 10],     category: "Septiemakkoorden" },
  { id: "minmaj7",symbol: "mΔ7",   name: "Mineur/Majeur 7",   intervals: [0, 3, 7, 11],     category: "Septiemakkoorden" },
  { id: "halfdim",symbol: "ø7",    name: "Half-verminderd 7", intervals: [0, 3, 6, 10],     category: "Septiemakkoorden" },
  { id: "dim7",   symbol: "°7",    name: "Verminderd 7",      intervals: [0, 3, 6, 9],      category: "Septiemakkoorden" },
  // Toegevoegde noten
  { id: "add9",   symbol: "add9",  name: "Add9",              intervals: [0, 4, 7, 14],     category: "Toegevoegd" },
  { id: "maj9",   symbol: "maj9",  name: "Majeur 9",          intervals: [0, 4, 7, 11, 14], category: "Toegevoegd" },
  { id: "min9",   symbol: "m9",    name: "Mineur 9",          intervals: [0, 3, 7, 10, 14], category: "Toegevoegd" },
  { id: "dom9",   symbol: "9",     name: "Dominant 9",        intervals: [0, 4, 7, 10, 14], category: "Toegevoegd" },
];

export const CHORD_LEVELS = [
  {
    id: "beginner",
    name: "Beginner — majeur & mineur drieklanken",
    types: ["maj", "min"],
  },
  {
    id: "basic7",
    name: "Basis — drieklanken + dominant 7",
    types: ["maj", "min", "dom7", "dim"],
  },
  {
    id: "jazz",
    name: "Jazz — alle septiemakkoorden",
    types: ["maj", "min", "dom7", "maj7", "min7", "halfdim", "dim7"],
  },
  {
    id: "all",
    name: "Alles — inclusief sus, add, 9",
    types: CHORD_TYPES.map((t) => t.id),
  },
];

export function findChordType(id) {
  return CHORD_TYPES.find((t) => t.id === id) || CHORD_TYPES[0];
}

export function findChordLevel(id) {
  return CHORD_LEVELS.find((l) => l.id === id) || CHORD_LEVELS[0];
}

// Groepeer types per categorie
export function groupedChordTypes() {
  const cats = {};
  CHORD_TYPES.forEach((t) => {
    if (!cats[t.category]) cats[t.category] = [];
    cats[t.category].push(t);
  });
  return cats;
}

// Geef de MIDI-noten van een akkoord (grondtoon + intervallen, in octaaf 4).
// intervals > 12 worden naar het volgende octaaf geplaatst.
export function chordMidis(rootName, typeId, octave = 4) {
  const type = findChordType(typeId);
  const rootMidi = nameToMidi(rootName + octave);
  return type.intervals.map((i) => rootMidi + i);
}

// Symbool tonen zoals op een lead sheet: "Cmaj7", "Dm7", "G7", "F#°7"
export function chordSymbol(rootName, typeId) {
  const type = findChordType(typeId);
  return rootName + type.symbol;
}

// Willekeurig akkoord uit een bepaald niveau
export function randomChord(levelId = "basic7") {
  const level = findChordLevel(levelId);
  const roots = NOTE_NAMES_SHARP; // alle 12 grondtonen
  const root = roots[Math.floor(Math.random() * roots.length)];
  const typeId = level.types[Math.floor(Math.random() * level.types.length)];
  return { root, typeId };
}

// Voor weergave: gebruik mol-notatie voor "zwarte-toets" wortels die dat gewoonlijk zijn
const PREFER_FLAT = new Set(["Db", "Eb", "Ab", "Bb", "Gb"]);
export function prettyRoot(name) {
  // nameToMidi accepteert zowel "C#" als "Db" — voor display kiezen we de gangbare notatie
  const sharp = name;
  const midi = nameToMidi(name + "4");
  const flatName = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"][midi % 12];
  return PREFER_FLAT.has(flatName) ? flatName : sharp;
}
