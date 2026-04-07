// Bladmuziek-modus: laadt MusicXML (.xml/.musicxml/.mxl), rendert via
// OpenSheetMusicDisplay (OSMD) en gebruikt OSMD's cursor API om mee te
// volgen. De cursor loopt door alle "ticks" (beat-posities) in de partituur;
// per positie kijken we welke noot er onder staat en wachten op de juiste
// mic-input voor we doorstappen.

import { midiToName } from "./music.js";

const OSMD = () => window.opensheetmusicdisplay;

export class SheetPlayer {
  constructor(container, { onProgress } = {}) {
    this.container = container;
    this.onProgress = onProgress;
    this.osmd = null;
    this.totalPitchedPositions = 0;
    this.passedPositions = 0;
    this.active = false;
    this.pitchRange = null; // { min, max } van MIDI-noten in de partituur
  }

  async loadFile(file) {
    const xml = await readMusicXml(file);
    await this.loadXml(xml);
  }

  async loadXml(xml) {
    const mod = OSMD();
    if (!mod) throw new Error("OpenSheetMusicDisplay niet geladen");
    if (!this.osmd) {
      this.osmd = new mod.OpenSheetMusicDisplay(this.container, {
        autoResize: true,
        drawTitle: true,
        drawPartNames: false,
        followCursor: true,
        drawingParameters: "compact",
      });
    }
    await this.osmd.load(xml);
    this.osmd.render();

    // Eerste run: tel hoeveel posities er met een toonhoogte zijn. Dit geeft
    // een totaal voor de voortgangsindicator en valideert de partituur.
    this.totalPitchedPositions = this.#countPitchedPositions();

    // Zet cursor klaar op de eerste pitched positie, maar nog niet tonen.
    this.osmd.cursor.reset();
    this.osmd.cursor.show();
    this.#advanceToPitchedPosition();
    this.passedPositions = 0;
    this.active = false;
    this.#emitProgress();
  }

  start() {
    if (!this.osmd) return;
    this.osmd.cursor.reset();
    this.osmd.cursor.show();
    this.#advanceToPitchedPosition();
    this.passedPositions = 0;
    this.active = true;
    this.#emitProgress();
    this.#scrollCursorIntoView();
  }

  reset() {
    if (!this.osmd) return;
    this.active = false;
    this.osmd.cursor.reset();
    this.osmd.cursor.show();
    this.#advanceToPitchedPosition();
    this.passedPositions = 0;
    this.#emitProgress();
  }

  // Mic-callback: vergelijk met de huidige noot onder de cursor.
  onNote(info) {
    if (!this.active || !this.osmd) return;
    const expected = this.currentMidi();
    if (expected == null) return;
    if (info.midi === expected) {
      this.passedPositions++;
      this.osmd.cursor.next();
      this.#advanceToPitchedPosition();
      this.#emitProgress();
      this.#scrollCursorIntoView();
      if (this.osmd.cursor.iterator.EndReached) {
        this.active = false;
      }
    }
  }

  // Geeft de verwachte MIDI-noot op de huidige cursor-positie (bovenste
  // pitch als er meerdere tegelijk klinken — meestal de melodie).
  currentMidi() {
    if (!this.osmd) return null;
    const it = this.osmd.cursor.iterator;
    if (!it || it.EndReached) return null;
    const notes = this.osmd.cursor.NotesUnderCursor();
    return topMidiFromNotes(notes);
  }

  get total() { return this.totalPitchedPositions; }

  #emitProgress() {
    if (this.onProgress) this.onProgress(this.passedPositions, this.totalPitchedPositions);
  }

  // Stap de cursor vooruit totdat er een positie met toonhoogte onder staat
  // (skip rusten en lege posities). Stopt als het einde bereikt is.
  #advanceToPitchedPosition() {
    const cursor = this.osmd.cursor;
    while (!cursor.iterator.EndReached) {
      const notes = cursor.NotesUnderCursor();
      if (topMidiFromNotes(notes) != null) return;
      cursor.next();
    }
  }

  #countPitchedPositions() {
    // Niet-destructief tellen + min/max bepalen. OSMD heeft geen eenvoudige
    // kloon-methode, dus we gebruiken de cursor zelf en resetten 'm achteraf.
    const cursor = this.osmd.cursor;
    cursor.reset();
    let count = 0;
    let min = Infinity;
    let max = -Infinity;
    while (!cursor.iterator.EndReached) {
      const notes = cursor.NotesUnderCursor();
      // Voor min/max kijken we naar ALLE pitched noten op deze positie,
      // niet alleen de top — zo includeren we ook linkerhand.
      if (notes) {
        for (const n of notes) {
          if (!n || (n.isRest && n.isRest())) continue;
          if (!n.Pitch) continue;
          const m = osmdPitchToMidi(n.Pitch);
          if (m == null) continue;
          if (m < min) min = m;
          if (m > max) max = m;
        }
      }
      if (topMidiFromNotes(notes) != null) count++;
      cursor.next();
    }
    cursor.reset();
    this.pitchRange = isFinite(min) ? { min, max } : null;
    return count;
  }

  #scrollCursorIntoView() {
    // OSMD rendert de cursor als een <img> of <div> binnen de container.
    // We zoeken 'm en scrollen 'm in beeld.
    const el = this.container.querySelector("img.cursor, .cursor, [id^='osmdCanvasCursor']");
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }
}

// Pak de hoogste MIDI-noot uit een array van OSMD Notes (bovenstem/melodie).
// Retourneert null als er geen pitched noot is.
function topMidiFromNotes(notes) {
  if (!notes || notes.length === 0) return null;
  let best = null;
  for (const n of notes) {
    if (!n || (n.isRest && n.isRest())) continue;
    const p = n.Pitch;
    if (!p) continue;
    const midi = osmdPitchToMidi(p);
    if (midi == null) continue;
    if (best == null || midi > best) best = midi;
  }
  return best;
}

function osmdPitchToMidi(pitch) {
  // OSMD Pitch: FundamentalNote enum → 0..6 (C..B), Octave (int), AccidentalHalfTones
  const step = pitch.FundamentalNote;
  const base = [0, 2, 4, 5, 7, 9, 11][step];
  if (base == null) return null;
  const octave = pitch.Octave; // OSMD: middle C (C4) = octave 1
  return base + (octave + 4) * 12 + (pitch.AccidentalHalfTones || 0);
}

// --- MusicXML file reading ---
async function readMusicXml(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".mxl")) {
    return await unzipMxl(file);
  }
  return await file.text();
}

// .mxl is een ZIP met een container.xml + de eigenlijke .xml. We zoeken
// de eerste .xml/.musicxml entry die niet in META-INF zit.
async function unzipMxl(file) {
  const buf = new Uint8Array(await file.arrayBuffer());
  const entries = parseZip(buf);
  const main = entries.find((e) =>
    !e.name.startsWith("META-INF/") &&
    (e.name.endsWith(".xml") || e.name.endsWith(".musicxml"))
  );
  if (!main) throw new Error("Geen MusicXML in .mxl bestand gevonden");
  const xmlBytes = await inflate(main.data, main.method);
  return new TextDecoder("utf-8").decode(xmlBytes);
}

// Minimale ZIP-parser: leest Local File Headers. Ondersteunt store (0) en
// deflate (8), wat MusicXML altijd gebruikt.
function parseZip(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const entries = [];
  let p = 0;
  while (p + 4 <= buf.length) {
    const sig = dv.getUint32(p, true);
    if (sig !== 0x04034b50) break;
    const method = dv.getUint16(p + 8, true);
    const compSize = dv.getUint32(p + 18, true);
    const nameLen = dv.getUint16(p + 26, true);
    const extraLen = dv.getUint16(p + 28, true);
    const nameStart = p + 30;
    const dataStart = nameStart + nameLen + extraLen;
    const name = new TextDecoder().decode(buf.subarray(nameStart, nameStart + nameLen));
    const data = buf.subarray(dataStart, dataStart + compSize);
    entries.push({ name, method, data });
    p = dataStart + compSize;
  }
  return entries;
}

async function inflate(bytes, method) {
  if (method === 0) return bytes;
  if (method === 8) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("DecompressionStream niet beschikbaar — werk je browser bij");
    }
    const ds = new DecompressionStream("deflate-raw");
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  throw new Error("Onbekende compressiemethode: " + method);
}
