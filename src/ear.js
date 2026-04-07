// Gehoortraining — intervallen en akkoord-kwaliteit herkennen.
// De app speelt twee noten (of een akkoord), de speler klikt de naam.
// Geen microfoon nodig: dit is pure luisteroefening.

import { synth } from "./synth.js";

export const INTERVALS = [
  { name: "Prime",            semitones: 0,  short: "P1" },
  { name: "Kleine secunde",   semitones: 1,  short: "m2" },
  { name: "Grote secunde",    semitones: 2,  short: "M2" },
  { name: "Kleine terts",     semitones: 3,  short: "m3" },
  { name: "Grote terts",      semitones: 4,  short: "M3" },
  { name: "Reine kwart",      semitones: 5,  short: "P4" },
  { name: "Tritonus",         semitones: 6,  short: "TT" },
  { name: "Reine kwint",      semitones: 7,  short: "P5" },
  { name: "Kleine sext",      semitones: 8,  short: "m6" },
  { name: "Grote sext",       semitones: 9,  short: "M6" },
  { name: "Kleine septiem",   semitones: 10, short: "m7" },
  { name: "Grote septiem",    semitones: 11, short: "M7" },
  { name: "Octaaf",           semitones: 12, short: "P8" },
];

// Level-pools: van simpel (consonant) → compleet.
const LEVEL_POOLS = {
  beginner: [3, 4, 5, 7, 12],                         // m3, M3, P4, P5, octaaf
  intermediate: [1, 2, 3, 4, 5, 7, 8, 9, 12],         // + secunden, sexten
  all: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],    // alles
};

export class IntervalTrainer {
  constructor() {
    this.level = "beginner";
    this.mode = "melodic"; // melodic = na elkaar, harmonic = tegelijk
    this.current = null;
    this.score = { correct: 0, total: 0 };
    this.lastAnswerCorrect = null;
  }

  setLevel(level) { this.level = level; }
  setMode(mode)   { this.mode = mode; }

  optionsForLevel() {
    const pool = LEVEL_POOLS[this.level] || LEVEL_POOLS.all;
    return pool.map((s) => INTERVALS.find((i) => i.semitones === s));
  }

  nextQuestion() {
    const opts = this.optionsForLevel();
    const interval = opts[Math.floor(Math.random() * opts.length)];
    // Root tussen C3 en C5 zodat het interval binnen bereik blijft.
    const rootMidi = 48 + Math.floor(Math.random() * 25);
    this.current = { interval, rootMidi };
    this.lastAnswerCorrect = null;
    return this.current;
  }

  play() {
    if (!this.current) this.nextQuestion();
    const { rootMidi, interval } = this.current;
    const high = rootMidi + interval.semitones;
    if (this.mode === "harmonic") {
      synth.playChord([rootMidi, high], { duration: 1.5, velocity: 0.35 });
    } else {
      synth.playMelodic([rootMidi, high], { gap: 0.55, duration: 0.7 });
    }
  }

  answer(semitones) {
    if (!this.current) return null;
    this.score.total++;
    const correct = semitones === this.current.interval.semitones;
    if (correct) this.score.correct++;
    this.lastAnswerCorrect = correct;
    return { correct, expected: this.current.interval };
  }
}

// --- Akkoord-kwaliteit trainer ---
// Speel een drieklank, speler kiest majeur / mineur / verminderd / overmatig.

export const CHORD_QUALITIES = [
  { name: "Majeur",      short: "maj", intervals: [0, 4, 7] },
  { name: "Mineur",      short: "min", intervals: [0, 3, 7] },
  { name: "Verminderd",  short: "dim", intervals: [0, 3, 6] },
  { name: "Overmatig",   short: "aug", intervals: [0, 4, 8] },
];

export class ChordTrainer {
  constructor() {
    this.level = "beginner"; // beginner = maj/min, all = alle 4
    this.current = null;
    this.score = { correct: 0, total: 0 };
    this.lastAnswerCorrect = null;
  }

  setLevel(level) { this.level = level; }

  optionsForLevel() {
    return this.level === "beginner"
      ? CHORD_QUALITIES.slice(0, 2)
      : CHORD_QUALITIES;
  }

  nextQuestion() {
    const opts = this.optionsForLevel();
    const quality = opts[Math.floor(Math.random() * opts.length)];
    const root = 48 + Math.floor(Math.random() * 20);
    this.current = { quality, root };
    this.lastAnswerCorrect = null;
    return this.current;
  }

  play() {
    if (!this.current) this.nextQuestion();
    const { root, quality } = this.current;
    const midis = quality.intervals.map((i) => root + i);
    synth.playChord(midis, { duration: 1.8, velocity: 0.3 });
  }

  answer(qualityShort) {
    if (!this.current) return null;
    this.score.total++;
    const correct = qualityShort === this.current.quality.short;
    if (correct) this.score.correct++;
    this.lastAnswerCorrect = correct;
    return { correct, expected: this.current.quality };
  }
}
