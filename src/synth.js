// Herbruikbare Web Audio synthesizer voor referentietonen, gehoortraining
// en metronoom. Eén gedeelde AudioContext — op iOS moet die ontgrendeld
// worden binnen een user-gesture, wat automatisch gebeurt omdat play-calls
// altijd vanuit een click/keydown komen.

class Synth {
  constructor() {
    this.ctx = null;
  }

  ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  // Speel een noot op een gegeven MIDI-hoogte. Gebruikt een zachte
  // triangle-wave met ADSR-achtige envelope zodat het niet klikt.
  playNote(midi, { duration = 0.7, velocity = 0.5, type = "triangle", when = 0 } = {}) {
    const ctx = this.ensure();
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const start = ctx.currentTime + when;

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(velocity, start + 0.015);
    gain.gain.linearRampToValueAtTime(velocity * 0.7, start + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  // Speel meerdere noten tegelijk (voor akkoord-gehoortraining).
  playChord(midis, opts = {}) {
    midis.forEach((m) => this.playNote(m, opts));
  }

  // Speel noten één voor één (melodisch).
  playMelodic(midis, { gap = 0.35, ...opts } = {}) {
    midis.forEach((m, i) => this.playNote(m, { ...opts, when: i * gap }));
  }

  // Scherpe "klik" voor metronoom. Accent = hogere, luidere klik op de 1.
  click({ accent = false, when = 0 } = {}) {
    const ctx = this.ensure();
    const start = ctx.currentTime + when;

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = accent ? 1600 : 1000;

    const gain = ctx.createGain();
    const peak = accent ? 0.45 : 0.25;
    gain.gain.setValueAtTime(peak, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.04);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.05);
  }
}

export const synth = new Synth();
