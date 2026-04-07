// Muziektheorie-helpers: noten, MIDI-nummers, frequenties.
// MIDI 21 = A0, MIDI 108 = C8. Middle C (C4) = MIDI 60.

export const NOTE_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const NOTE_NAMES_FLAT  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export function midiToName(midi, { flats = false } = {}) {
  const names = flats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  const name = names[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function nameToMidi(name) {
  // bv "C4", "F#5", "Bb3"
  const m = name.match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!m) throw new Error("Bad note name: " + name);
  const letter = m[1].toUpperCase();
  const acc = m[2];
  const oct = parseInt(m[3], 10);
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[letter];
  const accVal = acc === "#" ? 1 : acc === "b" ? -1 : 0;
  return base + accVal + (oct + 1) * 12;
}

export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function freqToMidi(freq) {
  return 69 + 12 * Math.log2(freq / 440);
}

// Best matching MIDI note + cents deviation (negatief = lager dan noot)
export function freqToNearestNote(freq) {
  const raw = freqToMidi(freq);
  const midi = Math.round(raw);
  const cents = (raw - midi) * 100;
  return { midi, cents, name: midiToName(midi) };
}

export function isBlackKey(midi) {
  return [1, 3, 6, 8, 10].includes(midi % 12);
}

// Range-selecties voor oefeningen
export const RANGES = {
  easy:   { min: nameToMidi("C4"), max: nameToMidi("C5") },
  middle: { min: nameToMidi("C3"), max: nameToMidi("C6") },
  full:   { min: nameToMidi("A0"), max: nameToMidi("C8") },
};

// Alleen witte toetsen in een range (voor beginner-modus)
export function whiteKeysInRange({ min, max }) {
  const out = [];
  for (let m = min; m <= max; m++) if (!isBlackKey(m)) out.push(m);
  return out;
}
