// Theorie-quiz: gerandomiseerde meerkeuze-vragen gegenereerd uit theory.js.
//
// Elke generator-functie retourneert:
//   { question, options: [string], answer: string, explanation: string }
//
// De hoofdexport pickRandomQuestion() kiest een willekeurige generator en
// geeft een frisse vraag terug. Zo kunnen we honderden verschillende vragen
// produceren uit een handvol regels.

import { KEYS, findKey, relativeMinor, triadOnDegree, ROMAN_NUMERALS, DEGREE_NAMES, MAJOR_TRIAD_QUALITIES, scaleMidisInKey } from "./theory.js";
import { midiToName, nameToMidi, NOTE_NAMES_SHARP } from "./music.js";
import { INTERVALS } from "./ear.js";

// --- Hulpfuncties ---
function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr)   { return [...arr].sort(() => Math.random() - 0.5); }
function uniqueOptions(correct, generator, count = 3) {
  // Verzamel afleiders totdat we er count hebben, verschillend van correct.
  const set = new Set([correct]);
  let tries = 0;
  while (set.size < count + 1 && tries < 50) {
    set.add(generator());
    tries++;
  }
  return shuffle(Array.from(set));
}

function midiToPlainName(midi) {
  // Verwijder octaaf-cijfer: "F#4" → "F#"
  return midiToName(midi).replace(/-?\d+$/, "");
}

// --- Generators ---

// 1. Hoeveel kruisen/mollen heeft een toonsoort?
function genKeySignature() {
  const key = randomFrom(KEYS);
  const count = key.sharps + key.flats;
  const type = key.sharps > 0 ? "kruisen" : key.flats > 0 ? "mollen" : "voortekens";
  const correct = String(count);
  const options = uniqueOptions(
    correct,
    () => String(Math.floor(Math.random() * 8))
  );
  return {
    question: `Hoeveel ${type} heeft ${key.name} majeur?`,
    options,
    answer: correct,
    explanation: key.accs.length
      ? `${key.name} majeur heeft ${count} ${type}: ${key.accs.join(", ")}.`
      : `${key.name} majeur heeft geen voortekens — alleen witte toetsen.`,
  };
}

// 2. Wat is de dominant / subdominant / tonica van een toonsoort?
function genScaleDegree() {
  const key = randomFrom(KEYS.slice(0, 8)); // makkelijkere toonsoorten
  const degree = randomFrom([1, 4, 5, 6]);  // meest gebruikt
  const { midis } = triadOnDegree(key.name, degree);
  const correctNote = midiToPlainName(midis[0]);
  const options = uniqueOptions(correctNote, () => {
    const rm = randomFrom(NOTE_NAMES_SHARP);
    return rm;
  });
  return {
    question: `Wat is de ${DEGREE_NAMES[degree - 1].toLowerCase()} van ${key.name} majeur?`,
    options,
    answer: correctNote,
    explanation: `De ${DEGREE_NAMES[degree - 1].toLowerCase()} (graad ${degree}) van ${key.name} majeur is ${correctNote}.`,
  };
}

// 3. Relatieve mineur van majeur toonsoort
function genRelativeMinor() {
  const key = randomFrom(KEYS.slice(0, 8));
  const rm = relativeMinor(key.name);
  const correct = rm.charAt(0).toUpperCase() + rm.slice(1) + " mineur";
  const options = uniqueOptions(correct, () => {
    const other = randomFrom(NOTE_NAMES_SHARP);
    return other + " mineur";
  });
  return {
    question: `Wat is de relatieve mineur van ${key.name} majeur?`,
    options,
    answer: correct,
    explanation: `De relatieve mineur begint op de 6e trap van de majeur toonsoort — hier ${correct}.`,
  };
}

// 4. Noten van een majeur drieklank
function genMajorTriadNotes() {
  const root = randomFrom(["C","G","D","A","E","F","Bb"]);
  const { midis } = triadOnDegree(root, 1);
  const notes = midis.map(midiToPlainName);
  const correct = notes.join(" – ");
  const options = uniqueOptions(correct, () => {
    const r = randomFrom(NOTE_NAMES_SHARP);
    const t = randomFrom(NOTE_NAMES_SHARP);
    const f = randomFrom(NOTE_NAMES_SHARP);
    return `${r} – ${t} – ${f}`;
  });
  return {
    question: `Welke noten vormen een ${root} majeur drieklank?`,
    options,
    answer: correct,
    explanation: `${root} majeur = grondtoon + grote terts + reine kwint = ${correct}.`,
  };
}

// 5. Kwaliteit van een graad (I, ii, iii, IV, V, vi, vii°) in majeur
function genTriadQualityByDegree() {
  const degree = randomFrom([2, 3, 5, 6, 7]); // vermijd de vanzelfsprekende I/IV
  const roman = ROMAN_NUMERALS[degree - 1];
  const quality = MAJOR_TRIAD_QUALITIES[degree - 1];
  const qualityNl = { maj: "majeur", min: "mineur", dim: "verminderd" }[quality];
  const correct = qualityNl;
  const options = ["majeur", "mineur", "verminderd", "overmatig"];
  return {
    question: `In een majeur toonsoort: welke kwaliteit heeft het ${roman}-akkoord?`,
    options,
    answer: correct,
    explanation: `In majeur zijn de drieklanken: I=maj, ii=min, iii=min, IV=maj, V=maj, vi=min, vii°=dim. Dus ${roman} = ${qualityNl}.`,
  };
}

// 6. Interval uit halve tonen
function genIntervalFromSemitones() {
  const interval = randomFrom(INTERVALS.filter((i) => i.semitones >= 2 && i.semitones <= 12));
  const correct = interval.name;
  const options = uniqueOptions(correct, () => randomFrom(INTERVALS).name);
  return {
    question: `Welk interval is ${interval.semitones} halve tonen?`,
    options,
    answer: correct,
    explanation: `${interval.semitones} halve tonen = ${interval.name} (${interval.short}).`,
  };
}

// 7. Noot op een interval boven een gegeven noot
function genNoteAtInterval() {
  const interval = randomFrom(INTERVALS.filter((i) => [3, 4, 5, 7, 12].includes(i.semitones)));
  const rootName = randomFrom(["C","D","E","F","G","A","B"]);
  const rootMidi = nameToMidi(rootName + "4");
  const targetMidi = rootMidi + interval.semitones;
  const correct = midiToPlainName(targetMidi);
  const options = uniqueOptions(correct, () => randomFrom(NOTE_NAMES_SHARP));
  return {
    question: `Welke noot ligt een ${interval.name.toLowerCase()} boven ${rootName}?`,
    options,
    answer: correct,
    explanation: `${rootName} + ${interval.semitones} halve tonen = ${correct} (een ${interval.name.toLowerCase()}).`,
  };
}

// 8. Leidtoon van een toonsoort
function genLeadingTone() {
  const key = randomFrom(KEYS.slice(0, 8));
  const { midis } = triadOnDegree(key.name, 7);
  const correct = midiToPlainName(midis[0]);
  const options = uniqueOptions(correct, () => randomFrom(NOTE_NAMES_SHARP));
  return {
    question: `Wat is de leidtoon van ${key.name} majeur?`,
    options,
    answer: correct,
    explanation: `De leidtoon is de 7e graad, een halve toon onder de tonica. In ${key.name} is dat ${correct}.`,
  };
}

const GENERATORS = [
  genKeySignature,
  genScaleDegree,
  genRelativeMinor,
  genMajorTriadNotes,
  genTriadQualityByDegree,
  genIntervalFromSemitones,
  genNoteAtInterval,
  genLeadingTone,
];

export function pickRandomQuestion() {
  const gen = randomFrom(GENERATORS);
  return gen();
}
