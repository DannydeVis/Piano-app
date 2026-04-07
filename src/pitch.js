// Mic pitch-detectie. Gebruikt de Web Audio API + een compacte YIN-achtige
// autocorrelatie. Geen externe dependency om iPad Safari-compatibel te blijven.
//
// Werkt voor mono-stemmige input (één noot tegelijk). Bij akkoorden wordt
// doorgaans de sterkste grondtoon gedetecteerd.

import { freqToNearestNote } from "./music.js";

const SAMPLE_WINDOW = 2048;

export class PitchDetector {
  constructor({ onNote, minClarity = 0.9, minRms = 0.01 } = {}) {
    this.onNote = onNote;
    this.minClarity = minClarity;
    this.minRms = minRms;
    this.running = false;
    this.audioCtx = null;
    this.stream = null;
    this.analyser = null;
    this.buf = null;
    this.lastMidi = null;
    this.stableCount = 0;
  }

  async start() {
    if (this.running) return;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = SAMPLE_WINDOW;
    source.connect(this.analyser);
    this.buf = new Float32Array(this.analyser.fftSize);
    this.running = true;
    this.#loop();
  }

  stop() {
    this.running = false;
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    if (this.audioCtx) this.audioCtx.close();
    this.stream = null;
    this.audioCtx = null;
    this.analyser = null;
  }

  #loop = () => {
    if (!this.running) return;
    this.analyser.getFloatTimeDomainData(this.buf);
    const result = detectPitch(this.buf, this.audioCtx.sampleRate);
    if (result && result.clarity >= this.minClarity && result.rms >= this.minRms) {
      const { midi, cents, name } = freqToNearestNote(result.freq);
      // Debouncing: alleen melden wanneer stabiel (2 opeenvolgende frames)
      if (midi === this.lastMidi) {
        this.stableCount++;
      } else {
        this.lastMidi = midi;
        this.stableCount = 1;
      }
      if (this.stableCount === 2) {
        this.onNote && this.onNote({ midi, name, cents, freq: result.freq });
      }
    } else {
      this.stableCount = 0;
      this.lastMidi = null;
    }
    requestAnimationFrame(this.#loop);
  };
}

// --- Pitch-algoritme: McLeod-achtige autocorrelatie met clarity-score ---
// Gebaseerd op de klassieke autocorrelatie + normalisatie uit de McLeod
// Pitch Method (Philip McLeod, 2005). Compact en robuust voor zang/piano.
function detectPitch(buf, sampleRate) {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.005) return { freq: 0, clarity: 0, rms };

  // Autocorrelatie via directe methode (SIZE klein genoeg)
  const nsdf = new Float32Array(SIZE);
  for (let tau = 0; tau < SIZE; tau++) {
    let acf = 0;
    let div = 0;
    for (let i = 0; i < SIZE - tau; i++) {
      acf += buf[i] * buf[i + tau];
      div += buf[i] * buf[i] + buf[i + tau] * buf[i + tau];
    }
    nsdf[tau] = div > 0 ? (2 * acf) / div : 0;
  }

  // Zoek de eerste positieve zero-crossing, dan de eerste piek daarna.
  let tau = 1;
  while (tau < SIZE - 1 && nsdf[tau] > 0) tau++;     // skip initieel positief blok
  while (tau < SIZE - 1 && nsdf[tau] <= 0) tau++;     // skip negatief blok
  let bestTau = -1;
  let bestVal = -1;
  while (tau < SIZE - 1) {
    if (nsdf[tau] > nsdf[tau - 1] && nsdf[tau] >= nsdf[tau + 1]) {
      if (nsdf[tau] > bestVal) {
        bestVal = nsdf[tau];
        bestTau = tau;
      }
    }
    tau++;
  }
  if (bestTau < 0 || bestVal < 0.5) return { freq: 0, clarity: 0, rms };

  // Parabolische interpolatie rond piek voor sub-sample-nauwkeurigheid
  const y1 = nsdf[bestTau - 1];
  const y2 = nsdf[bestTau];
  const y3 = nsdf[bestTau + 1];
  const denom = 2 * (2 * y2 - y1 - y3);
  const shift = denom !== 0 ? (y3 - y1) / denom : 0;
  const refinedTau = bestTau + shift;

  const freq = sampleRate / refinedTau;
  if (freq < 40 || freq > 5000) return { freq: 0, clarity: 0, rms };
  return { freq, clarity: bestVal, rms };
}
