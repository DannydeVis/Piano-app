// Ritme-trainer: laat de gebruiker ritmische patronen tikken tegen een metronoom.
// Patronen zijn uitgedrukt in 1/16-noot-eenheden binnen één maat (16 = een volle maat in 4/4).
// { beats: [0,4,8,12], meter: 4 } = vier kwartnoten in 4/4.
//
// Analyse: per verwachte tik bereken de dichtstbijzijnde gebruikersstap en
// rapporteer de afwijking in milliseconden.

export const RHYTHM_PATTERNS = [
  // ---- Beginner ----
  {
    id: "quarters",
    name: "Kwartnoten — 4 tellen",
    category: "Beginner",
    beats: [0, 4, 8, 12],
    meter: 4,
    description: "De basis: elke tel één tik. Houd het gelijkmatig.",
  },
  {
    id: "half-quarter",
    name: "Halve + kwartnoten",
    category: "Beginner",
    beats: [0, 8, 12],
    meter: 4,
    description: "Halve noot (2 tellen) gevolgd door twee kwartnoten.",
  },
  {
    id: "quarter-rest",
    name: "Kwartrust — overslaan!",
    category: "Beginner",
    beats: [0, 8, 12],
    meter: 4,
    description: "Rust op tel 2 — tik op 1, 3 en 4. Voel de rust innerlijk.",
  },
  // ---- Gevorderd ----
  {
    id: "eighth-pairs",
    name: "Achtste noten",
    category: "Gevorderd",
    beats: [0, 2, 4, 6, 8, 10, 12, 14],
    meter: 4,
    description: "Twee per tel — 'één-en twee-en drie-en vier-en'.",
  },
  {
    id: "synco-1",
    name: "Syncope 1 — off-beat",
    category: "Gevorderd",
    beats: [0, 2, 6, 8, 10, 14],
    meter: 4,
    description: "Kwart, acht, acht + off-beat, acht, acht + off-beat.",
  },
  {
    id: "dotted-quarter",
    name: "Gepunteerde kwart + achtste",
    category: "Gevorderd",
    beats: [0, 6, 8, 14],
    meter: 4,
    description: "Gepunteerde kwart (1½ tel) + achtste — typisch patroon in veel stukken.",
  },
  // ---- Moeilijk ----
  {
    id: "triplets",
    name: "Triolen",
    category: "Moeilijk",
    // 4/4 met triolen: 16 = 1 maat, triool-slot = 16/3 ≈ 5.33 per groep
    // 4 groepen van 3: posities 0, 5.33, 10.67 en 16, 21.33, 26.67 → scale to 24 = 3 beats
    // Eenvoudiger: gebruik meter 3 (3/4), dan 3 triolen = 9 noten = elk 1/3 beat = pos [0,1,2,3,4,5,6,7,8] in /9
    // Representeer als 12 eenheden, 4 per tel, triool = 3 in 4 → gebruik decimale posities afgerond
    beats: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44],   // 12 triool-noten in 3/4 (meter=3, 4 units per tel)
    meter: 3,
    description: "Triolen: drie noten per tel. Tel 'één-en-a twee-en-a drie-en-a'.",
    unitsPerMeasure: 12,
  },
  {
    id: "synco-advanced",
    name: "Syncopatie — across the beat",
    category: "Moeilijk",
    beats: [0, 6, 8, 14, 16, 22],
    meter: 4,
    description: "Achtste, gepunteerde kwart, achtste, gepunteerde kwart — crossed beat.",
    unitsPerMeasure: 24,
  },
];

export function findPattern(id) {
  return RHYTHM_PATTERNS.find((p) => p.id === id) || RHYTHM_PATTERNS[0];
}

// Groepeer patronen per categorie
export function groupedPatterns() {
  const cats = {};
  RHYTHM_PATTERNS.forEach((p) => {
    if (!cats[p.category]) cats[p.category] = [];
    cats[p.category].push(p);
  });
  return cats;
}

// Analyseer taps:
// expectedTimes = array van ms-tijdstippen van de verwachte tiks
// actualTimes   = array van ms-tijdstippen van de gebruiker-taps
// Geeft terug: array van { expected, actual, diffMs, ok } per verwachte tik
export function analyzeTaps(expectedTimes, actualTimes, windowMs = 200) {
  return expectedTimes.map((exp) => {
    // Zoek de dichtstbijzijnde tap
    let best = null;
    let bestDiff = Infinity;
    actualTimes.forEach((act) => {
      const diff = act - exp;
      if (Math.abs(diff) < Math.abs(bestDiff)) {
        bestDiff = diff;
        best = act;
      }
    });
    return {
      expected: exp,
      actual: best,
      diffMs: best != null ? Math.round(bestDiff) : null,
      ok: best != null && Math.abs(bestDiff) <= windowMs,
    };
  });
}

// Bereken BPM-tijden voor een patroon (in ms) over `measures` maten.
export function patternToTimes(pattern, bpm, startMs = 0, measures = 2) {
  const unitsPerMeasure = pattern.unitsPerMeasure || 16;
  const msPerUnit = (60000 / bpm) / (unitsPerMeasure / (4 * pattern.meter / 4));
  // Simpeler: msPerUnit = (60000 / bpm) * 4 / unitsPerMeasure
  const msPerU = (60000 / bpm) * 4 / unitsPerMeasure;
  const times = [];
  for (let m = 0; m < measures; m++) {
    const measureStart = startMs + m * unitsPerMeasure * msPerU;
    pattern.beats.forEach((b) => {
      times.push(measureStart + b * msPerU);
    });
  }
  return times;
}
