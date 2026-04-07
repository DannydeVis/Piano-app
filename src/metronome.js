// Metronoom met Web Audio scheduling voor nauwkeurige timing.
//
// Naïeve setInterval() drift tot ~20ms per tik — te veel voor serieuze
// oefening. In plaats daarvan plannen we klikken vooruit in de AudioContext
// timeline (lookahead-pattern) en gebruiken we setInterval alleen om
// regelmatig nieuwe klikken vooruit te schedulen.
//
// Referentie: https://web.dev/articles/audio-scheduling (Chris Wilson 2013).

import { synth } from "./synth.js";

const LOOKAHEAD_MS = 25;        // hoe vaak de scheduler loopt
const SCHEDULE_AHEAD_S = 0.1;   // hoe ver vooruit we plannen

export class Metronome {
  constructor({ onBeat } = {}) {
    this.bpm = 80;
    this.beatsPerMeasure = 4;
    this.running = false;
    this.currentBeat = 0;
    this.nextTickTime = 0;
    this.schedulerTimer = null;
    this.onBeat = onBeat; // (beat, accent) — aangeroepen ~op het tik-moment
  }

  setBpm(bpm) {
    this.bpm = Math.max(20, Math.min(300, bpm));
  }

  setMeter(beats) {
    this.beatsPerMeasure = Math.max(1, Math.min(12, beats));
    if (this.currentBeat >= this.beatsPerMeasure) this.currentBeat = 0;
  }

  start() {
    if (this.running) return;
    const ctx = synth.ensure();
    this.running = true;
    this.currentBeat = 0;
    this.nextTickTime = ctx.currentTime + 0.05;
    this.#scheduler();
    this.schedulerTimer = setInterval(() => this.#scheduler(), LOOKAHEAD_MS);
  }

  stop() {
    this.running = false;
    if (this.schedulerTimer) clearInterval(this.schedulerTimer);
    this.schedulerTimer = null;
  }

  toggle() {
    if (this.running) this.stop(); else this.start();
  }

  #scheduler() {
    const ctx = synth.ctx;
    if (!ctx) return;
    while (this.nextTickTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const accent = this.currentBeat === 0;
      const when = this.nextTickTime - ctx.currentTime;
      synth.click({ accent, when });

      // Visueel callback getimed op het audio-moment
      if (this.onBeat) {
        const beatCopy = this.currentBeat;
        const delayMs = Math.max(0, when * 1000);
        setTimeout(() => this.onBeat(beatCopy, accent), delayMs);
      }

      this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
      this.nextTickTime += 60 / this.bpm;
    }
  }
}
