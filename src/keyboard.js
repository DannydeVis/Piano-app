// SVG piano-keyboard renderer. Markeert één of meerdere toetsen.
import { isBlackKey, midiToName, nameToMidi } from "./music.js";

const WHITE_W = 36;
const WHITE_H = 150;
const BLACK_W = 22;
const BLACK_H = 95;

export class PianoKeyboard {
  constructor(container, { min = nameToMidi("C3"), max = nameToMidi("C6") } = {}) {
    this.container = container;
    this.min = min;
    this.max = max;
    this.highlights = new Map(); // midi -> className
    this.fingerings = new Map(); // midi -> finger number (1-5)
    this.render();
  }

  // Toont vingerzetting-cijfers boven de gemarkeerde toetsen.
  // Geef een Map of { midi: finger } object mee.
  setFingerings(map) {
    this.fingerings = map instanceof Map ? map : new Map(Object.entries(map).map(([k, v]) => [parseInt(k, 10), v]));
    this.applyHighlights();
  }

  clearFingerings() {
    this.fingerings.clear();
    this.applyHighlights();
  }

  setRange(min, max) {
    this.min = min;
    this.max = max;
    this.render();
  }

  clearHighlights() {
    this.highlights.clear();
    this.applyHighlights();
  }

  highlight(midi, kind = "target") {
    this.highlights.set(midi, kind);
    this.applyHighlights();
  }

  unhighlight(midi) {
    this.highlights.delete(midi);
    this.applyHighlights();
  }

  applyHighlights() {
    if (!this.svg) return;
    this.svg.querySelectorAll("[data-midi]").forEach((el) => {
      const midi = parseInt(el.dataset.midi, 10);
      const kind = this.highlights.get(midi);
      el.setAttribute("fill", this.#fillFor(midi, kind));
    });
    // Labels verbergen/tonen voor gemarkeerde toetsen
    this.svg.querySelectorAll("[data-label-for]").forEach((t) => {
      const midi = parseInt(t.dataset.labelFor, 10);
      t.style.display = this.highlights.has(midi) ? "" : "none";
    });
    // Vingerzetting-cirkels tonen voor toetsen waarvoor er een finger is
    this.svg.querySelectorAll("[data-finger-for]").forEach((el) => {
      const midi = parseInt(el.dataset.fingerFor, 10);
      const finger = this.fingerings.get(midi);
      if (finger != null) {
        el.style.display = "";
        if (el.tagName === "text") el.textContent = String(finger);
      } else {
        el.style.display = "none";
      }
    });
  }

  #fillFor(midi, kind) {
    const black = isBlackKey(midi);
    if (kind === "target")  return "#ffe066";
    if (kind === "correct") return "#7bd389";
    if (kind === "wrong")   return "#f08080";
    return black ? "#1a1a1a" : "#ffffff";
  }

  render() {
    this.container.innerHTML = "";
    // Tel witte toetsen in range
    const whiteMidis = [];
    for (let m = this.min; m <= this.max; m++) if (!isBlackKey(m)) whiteMidis.push(m);
    const width = whiteMidis.length * WHITE_W;
    const height = WHITE_H + 24;

    // Extra verticale ruimte bovenin voor vingerzetting-badges
    const FINGER_AREA = 22;
    const totalHeight = height + FINGER_AREA;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${totalHeight}`);
    svg.setAttribute("width", width);
    svg.setAttribute("height", totalHeight);
    svg.style.maxWidth = "none";

    // Verschuif alle toetsen naar beneden om ruimte te laten voor fingers
    const keyGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    keyGroup.setAttribute("transform", `translate(0, ${FINGER_AREA})`);
    svg.appendChild(keyGroup);

    // Helper om in keyGroup toe te voegen i.p.v. direct aan svg
    const addKey = (el) => keyGroup.appendChild(el);

    // Helper om finger-badge aan te maken (cirkel + cijfer bovenin de SVG)
    const addFingerBadge = (cx, midi, isBlack) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", FINGER_AREA / 2);
      circle.setAttribute("r", 9);
      circle.setAttribute("fill", isBlack ? "#1a1a1a" : "#d64933");
      circle.setAttribute("stroke", "#fff");
      circle.setAttribute("stroke-width", "1.5");
      circle.dataset.fingerFor = midi;
      circle.style.display = "none";
      svg.appendChild(circle);

      const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("x", cx);
      txt.setAttribute("y", FINGER_AREA / 2 + 4);
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("font-size", "12");
      txt.setAttribute("font-weight", "bold");
      txt.setAttribute("fill", "#fff");
      txt.setAttribute("font-family", "sans-serif");
      txt.dataset.fingerFor = midi;
      txt.style.display = "none";
      svg.appendChild(txt);
    };

    // Witte toetsen eerst
    whiteMidis.forEach((midi, i) => {
      const x = i * WHITE_W;
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", 0);
      rect.setAttribute("width", WHITE_W - 1);
      rect.setAttribute("height", WHITE_H);
      rect.setAttribute("fill", "#ffffff");
      rect.setAttribute("stroke", "#222");
      rect.setAttribute("stroke-width", "1");
      rect.setAttribute("rx", "3");
      rect.dataset.midi = midi;
      addKey(rect);

      // Label (alleen zichtbaar bij highlight)
      const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("x", x + WHITE_W / 2 - 0.5);
      txt.setAttribute("y", WHITE_H - 10);
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("font-size", "11");
      txt.setAttribute("font-family", "sans-serif");
      txt.setAttribute("fill", "#222");
      txt.dataset.labelFor = midi;
      txt.textContent = midiToName(midi);
      txt.style.display = "none";
      addKey(txt);

      // C-markering
      if (midi % 12 === 0) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "text");
        c.setAttribute("x", x + WHITE_W / 2 - 0.5);
        c.setAttribute("y", height - 6);
        c.setAttribute("text-anchor", "middle");
        c.setAttribute("font-size", "10");
        c.setAttribute("fill", "#999");
        c.textContent = midiToName(midi);
        addKey(c);
      }

      // Finger-badge voor deze witte toets
      addFingerBadge(x + WHITE_W / 2 - 0.5, midi, false);
    });

    // Zwarte toetsen bovenop
    for (let m = this.min; m <= this.max; m++) {
      if (!isBlackKey(m)) continue;
      // Positioneer tussen vorige en volgende witte toets
      const prevWhiteIdx = whiteMidis.findIndex((w) => w === m - 1);
      if (prevWhiteIdx < 0) continue;
      const x = (prevWhiteIdx + 1) * WHITE_W - BLACK_W / 2 - 0.5;
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", 0);
      rect.setAttribute("width", BLACK_W);
      rect.setAttribute("height", BLACK_H);
      rect.setAttribute("fill", "#1a1a1a");
      rect.setAttribute("rx", "2");
      rect.dataset.midi = m;
      addKey(rect);

      const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("x", x + BLACK_W / 2);
      txt.setAttribute("y", BLACK_H - 8);
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("font-size", "9");
      txt.setAttribute("fill", "#fff");
      txt.dataset.labelFor = m;
      txt.textContent = midiToName(m);
      txt.style.display = "none";
      addKey(txt);

      // Zwarte toetsen delen een horizontale positie maar hun finger-badge
      // komt er net boven (iets naar rechts voor visuele offset).
      addFingerBadge(x + BLACK_W / 2, m, true);
    }

    this.svg = svg;
    this.container.appendChild(svg);
    this.applyHighlights();
  }
}
