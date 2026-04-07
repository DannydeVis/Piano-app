// Muziektheorie: toonsoorten, toonladders, drieklanken, akkoord-progressies.
// Alles draait rond een "key" (majeur toonsoort met naam als "C", "G", "Bb").
// Voor eenvoud: alleen majeurtoonsoorten — de Romeinse cijfers geven zelf
// aan welke akkoorden in die toonsoort mineur of verminderd zijn.

import { nameToMidi, midiToName } from "./music.js";

// --- Toonsoorten & voortekens ---
// 15 meest gebruikte toonsoorten (majeur), gesorteerd volgens de kwintencirkel.
export const KEYS = [
  { name: "C",  sharps: 0, flats: 0, accs: [] },
  { name: "G",  sharps: 1, flats: 0, accs: ["F#"] },
  { name: "D",  sharps: 2, flats: 0, accs: ["F#","C#"] },
  { name: "A",  sharps: 3, flats: 0, accs: ["F#","C#","G#"] },
  { name: "E",  sharps: 4, flats: 0, accs: ["F#","C#","G#","D#"] },
  { name: "B",  sharps: 5, flats: 0, accs: ["F#","C#","G#","D#","A#"] },
  { name: "F#", sharps: 6, flats: 0, accs: ["F#","C#","G#","D#","A#","E#"] },
  { name: "F",  sharps: 0, flats: 1, accs: ["Bb"] },
  { name: "Bb", sharps: 0, flats: 2, accs: ["Bb","Eb"] },
  { name: "Eb", sharps: 0, flats: 3, accs: ["Bb","Eb","Ab"] },
  { name: "Ab", sharps: 0, flats: 4, accs: ["Bb","Eb","Ab","Db"] },
  { name: "Db", sharps: 0, flats: 5, accs: ["Bb","Eb","Ab","Db","Gb"] },
];

export function findKey(name) {
  return KEYS.find((k) => k.name === name) || KEYS[0];
}

// --- Relatieve mineur: 6e trap van de majeur toonsoort ---
const MINOR_OF = {
  C: "a", G: "e", D: "b", A: "f#", E: "c#", B: "g#", "F#": "d#",
  F: "d", Bb: "g", Eb: "c", Ab: "f", Db: "bb",
};
export function relativeMinor(keyName) { return MINOR_OF[keyName] || "a"; }

// --- Majeur toonladder in MIDI ---
// Patroon in halve tonen: whole whole half whole whole whole half
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23];

export function scaleMidisInKey(keyName, octave = 4) {
  const root = nameToMidi(keyName + octave);
  return MAJOR_STEPS.map((s) => root + s);
}

// --- Drieklank op een trap (1–7) ---
// Geeft { midis: [root, third, fifth], quality: 'maj'|'min'|'dim' }.
// De kwaliteiten in majeur zijn vast: I ii iii IV V vi vii°.
export function triadOnDegree(keyName, degree, octave = 4) {
  const scale = scaleMidisInKey(keyName, octave);
  const i = degree - 1;
  const midis = [scale[i], scale[i + 2], scale[i + 4]];
  const quality = MAJOR_TRIAD_QUALITIES[i];
  return { midis, quality };
}

export const MAJOR_TRIAD_QUALITIES = ["maj","min","min","maj","maj","min","dim"];
export const ROMAN_NUMERALS        = ["I","ii","iii","IV","V","vi","vii°"];
export const DEGREE_NAMES = [
  "Tonica", "Supertonica", "Mediant",
  "Subdominant", "Dominant", "Submediant", "Leidtoon",
];

// --- Akkoord-progressies ---
// degrees = array van graad-nummers 1..7
export const PROGRESSIONS = [
  {
    id: "I-IV-V-I",
    name: "I – IV – V – I",
    label: "De klassieke cadens",
    description: "De basisprogressie van de westerse muziek. Klinkt af door de V-I perfecte cadens.",
    degrees: [1, 4, 5, 1],
  },
  {
    id: "I-V-vi-IV",
    name: "I – V – vi – IV (Axis)",
    label: "Pop-progressie #1",
    description: "De 'Four Chords of Pop'. Let It Be, Don't Stop Believin', With or Without You — ontelbare hits.",
    degrees: [1, 5, 6, 4],
  },
  {
    id: "vi-IV-I-V",
    name: "vi – IV – I – V",
    label: "Pop-progressie #2 (sentimenteel)",
    description: "Zelfde akkoorden als Axis, andere startpunt. Zodra je 'm hoort herken je 'm overal: Apologize, Zombie, Bleeding Love.",
    degrees: [6, 4, 1, 5],
  },
  {
    id: "ii-V-I",
    name: "ii – V – I",
    label: "Jazz-standaard",
    description: "Dé bouwsteen van jazz-harmonie. Elke jazz-standard zit er vol mee.",
    degrees: [2, 5, 1],
  },
  {
    id: "I-vi-IV-V",
    name: "I – vi – IV – V",
    label: "50s / doo-wop",
    description: "Stand by Me, Earth Angel, Blue Moon — de klank van de jaren '50.",
    degrees: [1, 6, 4, 5],
  },
  {
    id: "12-bar-blues",
    name: "12-bar blues",
    label: "Blues / rock & roll basis",
    description: "12 maten: I-I-I-I | IV-IV-I-I | V-IV-I-V. De fundering van blues, rock, en vroege jazz.",
    degrees: [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5],
  },
  {
    id: "pachelbel",
    name: "Canon-progressie",
    label: "Pachelbel's Canon",
    description: "I-V-vi-iii-IV-I-IV-V — dalend patroon dat overal opduikt van barok tot pop.",
    degrees: [1, 5, 6, 3, 4, 1, 4, 5],
  },
  {
    id: "authentic-cadence",
    name: "V – I",
    label: "Authentieke cadens",
    description: "De sterkste harmonische beweging: spanning op V, ontspanning op I.",
    degrees: [5, 1],
  },
  {
    id: "plagal-cadence",
    name: "IV – I",
    label: "Plagale cadens ('Amen')",
    description: "De 'Amen'-cadens in kerkmuziek. Zachter dan V-I.",
    degrees: [4, 1],
  },
  {
    id: "deceptive",
    name: "V – vi",
    label: "Bedrieglijke cadens",
    description: "Waar je I verwacht, komt vi — een muzikale plot-twist.",
    degrees: [5, 6],
  },
];

// Render een progressie als een array van { roman, quality, midis, label }.
export function renderProgression(keyName, progression, octave = 4) {
  return progression.degrees.map((d) => {
    const { midis, quality } = triadOnDegree(keyName, d, octave);
    const roman = ROMAN_NUMERALS[d - 1];
    // Romeins cijfer aanpassen: kleine letters voor mineur/dim is al in ROMAN_NUMERALS
    return { roman, quality, midis, degree: d };
  });
}
