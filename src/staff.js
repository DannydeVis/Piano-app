// Notenbalk renderer via VexFlow (UMD-versie, globaal als `Vex`).
import { midiToName, nameToMidi } from "./music.js";

const VF = () => (window.Vex ? window.Vex.Flow : null);

function midiToVexKey(midi) {
  // VexFlow wil bv "c/4", "f#/5", "bb/3"
  const name = midiToName(midi); // bv "F#4"
  const m = name.match(/^([A-G])([#b]?)(-?\d+)$/);
  return `${m[1].toLowerCase()}${m[2]}/${m[3]}`;
}

export class Staff {
  constructor(container, { width = 420, height = 160 } = {}) {
    this.container = container;
    this.width = width;
    this.height = height;
  }

  // Toon één losse noot. Kiest G- of F-sleutel op basis van toonhoogte.
  showNote(midi) {
    const Flow = VF();
    if (!Flow) {
      this.container.textContent = "VexFlow niet geladen";
      return;
    }
    this.container.innerHTML = "";
    const { Renderer, Stave, StaveNote, Formatter, Voice } = Flow;
    const renderer = new Renderer(this.container, Renderer.Backends.SVG);
    renderer.resize(this.width, this.height);
    const ctx = renderer.getContext();
    const clef = midi >= nameToMidi("B3") ? "treble" : "bass";
    const stave = new Stave(10, 20, this.width - 20);
    stave.addClef(clef).setContext(ctx).draw();

    const key = midiToVexKey(midi);
    const note = new StaveNote({
      clef,
      keys: [key],
      duration: "w",
      auto_stem: true,
    });
    // Kruis/mol toevoegen
    if (key.includes("#")) note.addModifier(new Flow.Accidental("#"));
    else if (key.includes("b")) note.addModifier(new Flow.Accidental("b"));

    const voice = new Voice({ num_beats: 4, beat_value: 4 }).addTickables([note]);
    new Formatter().joinVoices([voice]).format([voice], this.width - 80);
    voice.draw(ctx, stave);
  }

  // Toon een reeks noten (voor liedjes), hilight de huidige index.
  showSequence(midis, currentIndex = 0) {
    const Flow = VF();
    if (!Flow) return;
    this.container.innerHTML = "";
    const { Renderer, Stave, StaveNote, Formatter, Voice, Accidental } = Flow;
    const renderer = new Renderer(this.container, Renderer.Backends.SVG);
    const w = Math.max(this.width, 80 + midis.length * 50);
    renderer.resize(w, this.height);
    const ctx = renderer.getContext();
    // Gebruik viool-sleutel als meeste noten ≥ B3
    const above = midis.filter((m) => m >= nameToMidi("B3")).length;
    const clef = above >= midis.length / 2 ? "treble" : "bass";
    const stave = new Stave(10, 20, w - 20);
    stave.addClef(clef).setContext(ctx).draw();

    const notes = midis.map((midi, i) => {
      const key = midiToVexKey(midi);
      const n = new StaveNote({ clef, keys: [key], duration: "q", auto_stem: true });
      if (key.includes("#")) n.addModifier(new Accidental("#"));
      else if (key.includes("b")) n.addModifier(new Accidental("b"));
      if (i === currentIndex) n.setStyle({ fillStyle: "#d64933", strokeStyle: "#d64933" });
      return n;
    });

    const voice = new Voice({ num_beats: notes.length, beat_value: 4 })
      .setStrict(false)
      .addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], w - 80);
    voice.draw(ctx, stave);
  }
}
