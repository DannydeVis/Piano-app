// Interactieve kwintencirkel als SVG.
// 12 majeur-segmenten (buitenste ring), 12 relatieve mineur-segmenten (middelste ring),
// voortekens-ring (binnenste gekleurde band), en een info-centrum.
//
// Gebruik: new CircleOfFifths(containerEl, { onSelect })
// onSelect(key) wordt aangeroepen telkens als de gebruiker een segment aanklikt.

// Kwintencirkel-volgorde (met de klok mee, startend boven = C)
const COF_MAJOR = ["C","G","D","A","E","B","F#","Db","Ab","Eb","Bb","F"];
const COF_MINOR = ["a","e","b","f#","c#","g#","d#","bb","f","c","g","d"];
const COF_ACCS  = [
  { sharps: 0, flats: 0 },
  { sharps: 1, flats: 0 },
  { sharps: 2, flats: 0 },
  { sharps: 3, flats: 0 },
  { sharps: 4, flats: 0 },
  { sharps: 5, flats: 0 },
  { sharps: 6, flats: 0 },
  { sharps: 0, flats: 5 },
  { sharps: 0, flats: 4 },
  { sharps: 0, flats: 3 },
  { sharps: 0, flats: 2 },
  { sharps: 0, flats: 1 },
];

// Kleuren op basis van positie: warm (rechts = kruizen) → koel (links = mollen)
const SEGMENT_COLORS = [
  "#e8f5e9","#c8e6c9","#a5d6a7","#81c784","#66bb6a","#4caf50",
  "#80cbc4","#80deea","#80d8ff","#82b1ff","#b39ddb","#f48fb1",
];
const MINOR_COLORS = SEGMENT_COLORS.map((c) => c + "aa"); // iets transparanter

function polarXY(angle, r, cx, cy) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, rInner, rOuter, startDeg, endDeg) {
  const gap = 1.5; // kleine ruimte tussen segmenten
  const s1 = polarXY(startDeg + gap, rOuter, cx, cy);
  const e1 = polarXY(endDeg   - gap, rOuter, cx, cy);
  const s2 = polarXY(startDeg + gap, rInner, cx, cy);
  const e2 = polarXY(endDeg   - gap, rInner, cx, cy);
  return [
    `M ${s1.x.toFixed(2)} ${s1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 0 1 ${e1.x.toFixed(2)} ${e1.y.toFixed(2)}`,
    `L ${e2.x.toFixed(2)} ${e2.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 0 0 ${s2.x.toFixed(2)} ${s2.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function svgText(svg, x, y, text, opts = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
  el.setAttribute("x", x);
  el.setAttribute("y", y);
  el.setAttribute("text-anchor", "middle");
  el.setAttribute("dominant-baseline", "middle");
  el.setAttribute("font-family", "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif");
  el.setAttribute("font-size", opts.fontSize || 14);
  el.setAttribute("font-weight", opts.fontWeight || "normal");
  el.setAttribute("fill", opts.fill || "#1c1a17");
  if (opts.opacity) el.setAttribute("opacity", opts.opacity);
  el.textContent = text;
  svg.appendChild(el);
  return el;
}

function svgEl(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

export class CircleOfFifths {
  constructor(container, { onSelect } = {}) {
    this.container = container;
    this.onSelect = onSelect || (() => {});
    this.selected = 0; // index in COF_MAJOR
    this._build();
  }

  _build() {
    this.container.innerHTML = "";
    const SIZE = Math.min(this.container.clientWidth || 440, 440);
    const cx = SIZE / 2, cy = SIZE / 2;

    // Radii
    const R_OUTER  = SIZE * 0.46;
    const R_MAJOR  = SIZE * 0.36;
    const R_MINOR  = SIZE * 0.26;
    const R_ACC    = SIZE * 0.17;
    const R_CENTER = SIZE * 0.13;

    const svg = svgEl("svg", {
      viewBox: `0 0 ${SIZE} ${SIZE}`,
      width: SIZE,
      height: SIZE,
      style: "display:block;margin:0 auto;",
    });
    this.svg = svg;
    this.cx = cx; this.cy = cy;
    this.R_CENTER = R_CENTER;

    const STEP = 360 / 12;

    // --- Majeur-segmenten (buitenste ring) ---
    this._majorPaths = [];
    COF_MAJOR.forEach((key, i) => {
      const startDeg = i * STEP;
      const midDeg = startDeg + STEP / 2;

      const path = svgEl("path", {
        d: arcPath(cx, cy, R_MAJOR, R_OUTER, startDeg, startDeg + STEP),
        fill: SEGMENT_COLORS[i],
        stroke: "#fff",
        "stroke-width": 1,
        cursor: "pointer",
        "data-idx": i,
      });
      path.addEventListener("click", () => this._select(i));
      svg.appendChild(path);
      this._majorPaths.push(path);

      // Label
      const lp = polarXY(midDeg, (R_MAJOR + R_OUTER) / 2, cx, cy);
      const label = svgText(svg, lp.x, lp.y, key, {
        fontSize: SIZE * 0.055,
        fontWeight: "600",
        fill: "#1c1a17",
      });
      label.style.pointerEvents = "none";
    });

    // --- Mineur-ring ---
    this._minorPaths = [];
    COF_MINOR.forEach((key, i) => {
      const startDeg = i * STEP;
      const midDeg = startDeg + STEP / 2;

      const path = svgEl("path", {
        d: arcPath(cx, cy, R_MINOR, R_MAJOR, startDeg, startDeg + STEP),
        fill: MINOR_COLORS[i],
        stroke: "#fff",
        "stroke-width": 1,
        cursor: "pointer",
        "data-idx": i,
      });
      path.addEventListener("click", () => this._select(i));
      svg.appendChild(path);
      this._minorPaths.push(path);

      const lp = polarXY(midDeg, (R_MINOR + R_MAJOR) / 2, cx, cy);
      const label = svgText(svg, lp.x, lp.y, key + "m", {
        fontSize: SIZE * 0.038,
        fill: "#333",
      });
      label.style.pointerEvents = "none";
    });

    // --- Voortekens-ring (binnenste gekleurde band) ---
    COF_ACCS.forEach((acc, i) => {
      const startDeg = i * STEP;
      const midDeg = startDeg + STEP / 2;

      const hasAccs = acc.sharps > 0 || acc.flats > 0;
      const path = svgEl("path", {
        d: arcPath(cx, cy, R_ACC, R_MINOR, startDeg, startDeg + STEP),
        fill: acc.sharps > 0 ? `hsl(38,80%,${90 - acc.sharps * 8}%)` :
              acc.flats  > 0 ? `hsl(210,60%,${90 - acc.flats * 8}%)` :
              "#f5f5f5",
        stroke: "#fff",
        "stroke-width": 1,
      });
      svg.appendChild(path);

      const lp = polarXY(midDeg, (R_ACC + R_MINOR) / 2, cx, cy);
      const count = acc.sharps || acc.flats;
      const sym   = acc.sharps > 0 ? "♯" : acc.flats > 0 ? "♭" : "∅";
      svgText(svg, lp.x, lp.y, hasAccs ? `${count}${sym}` : sym, {
        fontSize: SIZE * 0.034,
        fill: "#444",
      });
    });

    // --- Centrum (wit vlak + geselecteerde info) ---
    const circle = svgEl("circle", {
      cx, cy, r: R_ACC,
      fill: "#fff",
      stroke: "#e5e0d6",
      "stroke-width": 1.5,
    });
    svg.appendChild(circle);

    this._centerKey   = svgText(svg, cx, cy - SIZE * 0.04, "C", {
      fontSize: SIZE * 0.09, fontWeight: "700", fill: "#d64933",
    });
    this._centerMinor = svgText(svg, cx, cy + SIZE * 0.04, "a mineur", {
      fontSize: SIZE * 0.038, fill: "#6b665e",
    });
    this._centerAccs  = svgText(svg, cx, cy + SIZE * 0.09, "geen voortekens", {
      fontSize: SIZE * 0.028, fill: "#aaa",
    });

    this.container.appendChild(svg);
    this._applySelection();
  }

  _select(idx) {
    this.selected = idx;
    this._applySelection();
    this.onSelect(COF_MAJOR[idx]);
  }

  _applySelection() {
    const i = this.selected;
    const acc = COF_ACCS[i];

    // Reset alle paden
    this._majorPaths.forEach((p, j) => {
      p.setAttribute("fill", SEGMENT_COLORS[j]);
      p.setAttribute("stroke", "#fff");
      p.setAttribute("stroke-width", 1);
    });
    this._minorPaths.forEach((p, j) => {
      p.setAttribute("fill", MINOR_COLORS[j]);
    });

    // Buur-highlight (kwintencirkel-buren)
    const neighbors = [(i + 1) % 12, (i + 11) % 12];
    neighbors.forEach((n) => {
      this._majorPaths[n].setAttribute("stroke", "#d64933");
      this._majorPaths[n].setAttribute("stroke-width", 2.5);
    });

    // Geselecteerd segment: donkere rand
    this._majorPaths[i].setAttribute("stroke", "#1c1a17");
    this._majorPaths[i].setAttribute("stroke-width", 3);
    this._majorPaths[i].setAttribute("fill", "#ffe066");
    this._minorPaths[i].setAttribute("fill", "#fff3b0");

    // Centrum bijwerken
    const accText = acc.sharps > 0 ? `${acc.sharps} kruis${acc.sharps > 1 ? "en" : ""}` :
                    acc.flats  > 0 ? `${acc.flats} mol${acc.flats  > 1 ? "len" : ""}` :
                    "geen voortekens";
    this._centerKey.textContent   = COF_MAJOR[i];
    this._centerMinor.textContent = COF_MINOR[i] + " mineur";
    this._centerAccs.textContent  = accText;
  }

  // Programmatisch een toonsoort selecteren (bijv. vanuit andere tab)
  selectKey(keyName) {
    const idx = COF_MAJOR.indexOf(keyName);
    if (idx >= 0) this._select(idx);
  }

  // Herrender bij resize
  resize() { this._build(); }
}
