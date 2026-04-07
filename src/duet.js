// Duet-modus: de app speelt de linkerhand, jij de rechterhand.
// De LH speelt een herhalend patroon (Alberti-bas, wals-bas, geblokte akkoorden,
// stride of broken chord) in de gekozen toonsoort + progressie.
//
// Werkt met Web Audio scheduling voor een stabiel, loopend ritme.

import { nameToMidi } from "./music.js";
import { PROGRESSIONS, renderProgression } from "./theory.js";
import { synth } from "./synth.js";

// ---- LH-patronen ----
// Elk patroon geeft per akkoord (grondtoon-midi + kwint-midi + overige) een ritme.
// beats: array van { offset (in 1/8-noten), notes: [midi-delta's tov root], velocity }

export const LH_PATTERNS = [
  {
    id: "blocked",
    name: "Geblokt akkoord",
    description: "Alle akkoordnoten tegelijk op tel 1. Simpel en krachtig.",
    beatsPerChord: 4,   // kwartnoten per akkoord
    // notes per beat als delta-van-root: beat 0 = vol akkoord, rest rust
    build: (rootMidi, intervals) => [
      { beat: 0, midis: intervals.map((i) => rootMidi - 12 + i), dur: 1.8 },
    ],
  },
  {
    id: "alberti",
    name: "Alberti-bas",
    description: "Klassiek: laag – hoog – midden – hoog (do-sol-mi-sol). Mozart, Haydn.",
    beatsPerChord: 4,
    build: (rootMidi, intervals) => {
      const [r, t, f] = intervals.map((i) => rootMidi - 12 + i);
      return [
        { beat: 0,   midis: [r],    dur: 0.45 },
        { beat: 0.5, midis: [f],    dur: 0.45 },
        { beat: 1,   midis: [t],    dur: 0.45 },
        { beat: 1.5, midis: [f],    dur: 0.45 },
        { beat: 2,   midis: [r],    dur: 0.45 },
        { beat: 2.5, midis: [f],    dur: 0.45 },
        { beat: 3,   midis: [t],    dur: 0.45 },
        { beat: 3.5, midis: [f],    dur: 0.45 },
      ];
    },
  },
  {
    id: "waltz",
    name: "Wals-bas",
    description: "3/4: bas op tel 1, akkoord op 2 en 3. Chopin, Schubert.",
    beatsPerChord: 3,
    build: (rootMidi, intervals) => {
      const [r, t, f] = intervals.map((i) => rootMidi - 12 + i);
      return [
        { beat: 0, midis: [r],    dur: 0.9 },
        { beat: 1, midis: [t, f], dur: 0.45 },
        { beat: 2, midis: [t, f], dur: 0.45 },
      ];
    },
  },
  {
    id: "broken",
    name: "Gebroken akkoord",
    description: "Arpeggio omhoog per akkoord. Romantisch, Nocturne-stijl.",
    beatsPerChord: 4,
    build: (rootMidi, intervals) => {
      const notes = intervals.map((i) => rootMidi - 12 + i);
      return notes.map((m, i) => ({
        beat: i * (4 / notes.length),
        midis: [m],
        dur: 0.8,
      }));
    },
  },
  {
    id: "stride",
    name: "Stride-bas",
    description: "Jazz/ragtime: bas op 1&3, akkoord op 2&4. Joplin, Fats Waller.",
    beatsPerChord: 4,
    build: (rootMidi, intervals) => {
      const [r, t, f] = intervals.map((i) => rootMidi - 12 + i);
      return [
        { beat: 0, midis: [r],    dur: 0.45 },
        { beat: 1, midis: [t, f], dur: 0.45 },
        { beat: 2, midis: [r],    dur: 0.45 },
        { beat: 3, midis: [t, f], dur: 0.45 },
      ];
    },
  },
];

export function findLHPattern(id) {
  return LH_PATTERNS.find((p) => p.id === id) || LH_PATTERNS[0];
}

// Bouw de volledige LH-schedule voor één maat van de progressie.
// Geeft een array van { timeMs, midis, dur } terug.
export function buildSchedule(keyName, progressionId, patternId, bpm, octave = 3) {
  const prog = PROGRESSIONS.find((p) => p.id === progressionId) || PROGRESSIONS[0];
  const chords = renderProgression(keyName, prog, octave);
  const pattern = findLHPattern(patternId);
  const beatMs = 60000 / bpm;

  const schedule = [];
  let barStart = 0;

  chords.forEach((chord) => {
    const root = chord.midis[0];
    const intervals = [0, chord.midis[1] - chord.midis[0], chord.midis[2] - chord.midis[0]];
    const events = pattern.build(root, intervals);
    events.forEach((ev) => {
      schedule.push({
        timeMs: barStart + ev.beat * beatMs,
        midis: ev.midis,
        dur: ev.dur * beatMs / 1000,
      });
    });
    barStart += pattern.beatsPerChord * beatMs;
  });

  return { schedule, totalMs: barStart };
}

// Loop-speler: speelt de schedule oneindig in een lus via setTimeout.
export class DuetPlayer {
  constructor() {
    this.running = false;
    this._timers = [];
  }

  start(keyName, progressionId, patternId, bpm) {
    this.stop();
    this.running = true;
    const { schedule, totalMs } = buildSchedule(keyName, progressionId, patternId, bpm);
    this._loop(schedule, totalMs);
  }

  _loop(schedule, totalMs) {
    if (!this.running) return;
    const startTime = performance.now();
    schedule.forEach((ev) => {
      const t = this._timer(ev.timeMs, () => {
        if (this.running) synth.playChord(ev.midis, { duration: ev.dur, volume: 0.35 });
      });
      this._timers.push(t);
    });
    const loopTimer = this._timer(totalMs, () => {
      if (this.running) this._loop(schedule, totalMs);
    });
    this._timers.push(loopTimer);
  }

  _timer(ms, fn) {
    return setTimeout(fn, ms);
  }

  stop() {
    this.running = false;
    this._timers.forEach(clearTimeout);
    this._timers = [];
  }

  toggle(keyName, progressionId, patternId, bpm) {
    if (this.running) this.stop();
    else this.start(keyName, progressionId, patternId, bpm);
  }
}
