// Toonladders, arpeggio's en technische oefeningen MET vingerzettingen.
//
// Vingerzettingen zijn standaard klassieke pianovingerzettingen zoals
// gedoceerd in Hanon, Czerny en de RCM/ABRSM methodes. Voor elke regel
// geef ik de stijgende vingerzetting; dalend is gewoonlijk het spiegelbeeld.
//
// Vingers: 1=duim, 2=wijsvinger, 3=middelvinger, 4=ringvinger, 5=pink.
// RH = rechterhand, LH = linkerhand.

// --- MAJEUR TOONLADDERS (één octaaf stijgend) ---
export const MAJOR_SCALES = [
  {
    id: "c-major", name: "C majeur", difficulty: 1,
    notes: ["C4","D4","E4","F4","G4","A4","B4","C5"],
    rhFingers: [1,2,3,1,2,3,4,5],
    lhFingers: [5,4,3,2,1,3,2,1],
    description: "De makkelijkste — alle witte toetsen. Begin hier.",
  },
  {
    id: "g-major", name: "G majeur (1 kruis: F#)", difficulty: 1,
    notes: ["G4","A4","B4","C5","D5","E5","F#5","G5"],
    rhFingers: [1,2,3,1,2,3,4,5],
    lhFingers: [5,4,3,2,1,3,2,1],
    description: "Zelfde patroon als C, met F# in plaats van F.",
  },
  {
    id: "d-major", name: "D majeur (2 kruisen: F#, C#)", difficulty: 2,
    notes: ["D4","E4","F#4","G4","A4","B4","C#5","D5"],
    rhFingers: [1,2,3,1,2,3,4,5],
    lhFingers: [5,4,3,2,1,3,2,1],
    description: "Nog steeds de standaard vingerzetting 1-2-3-1-2-3-4-5.",
  },
  {
    id: "a-major", name: "A majeur (3 kruisen)", difficulty: 2,
    notes: ["A3","B3","C#4","D4","E4","F#4","G#4","A4"],
    rhFingers: [1,2,3,1,2,3,4,5],
    lhFingers: [5,4,3,2,1,3,2,1],
    description: "F#, C#, G# — drie zwarte toetsen.",
  },
  {
    id: "e-major", name: "E majeur (4 kruisen)", difficulty: 3,
    notes: ["E4","F#4","G#4","A4","B4","C#5","D#5","E5"],
    rhFingers: [1,2,3,1,2,3,4,5],
    lhFingers: [5,4,3,2,1,3,2,1],
    description: "Zelfde standaard vingerzetting — blijf dit patroon aanvoelen.",
  },
  {
    id: "f-major", name: "F majeur (1 mol: Bb)", difficulty: 2,
    notes: ["F4","G4","A4","Bb4","C5","D5","E5","F5"],
    rhFingers: [1,2,3,4,1,2,3,4],
    lhFingers: [5,4,3,2,1,3,2,1],
    description: "LET OP: rechterhand eindigt op vinger 4, niet 5. Bb valt onder de 4.",
  },
  {
    id: "bb-major", name: "Bb majeur (2 mollen)", difficulty: 3,
    notes: ["Bb3","C4","D4","Eb4","F4","G4","A4","Bb4"],
    rhFingers: [2,1,2,3,1,2,3,4],
    lhFingers: [3,2,1,4,3,2,1,3],
    description: "Begint met vinger 2 (niet 1!) in beide handen. Tricky.",
  },
  {
    id: "eb-major", name: "Eb majeur (3 mollen)", difficulty: 3,
    notes: ["Eb4","F4","G4","Ab4","Bb4","C5","D5","Eb5"],
    rhFingers: [3,1,2,3,1,2,3,4],
    lhFingers: [3,2,1,4,3,2,1,3],
    description: "Begint op zwarte toets → vinger 3 rechts, 3 links.",
  },
];

// --- MINEUR TOONLADDERS (natuurlijk mineur) ---
export const MINOR_SCALES = [
  {
    id: "a-minor", name: "a mineur (natuurlijk)", difficulty: 1,
    notes: ["A3","B3","C4","D4","E4","F4","G4","A4"],
    rhFingers: [1,2,3,1,2,3,4,5],
    lhFingers: [5,4,3,2,1,3,2,1],
    description: "De relatieve mineur van C — alleen witte toetsen.",
  },
  {
    id: "e-minor", name: "e mineur (natuurlijk)", difficulty: 1,
    notes: ["E4","F#4","G4","A4","B4","C5","D5","E5"],
    rhFingers: [1,2,3,1,2,3,4,5],
    lhFingers: [5,4,3,2,1,3,2,1],
    description: "Relatieve mineur van G, met F#.",
  },
  {
    id: "d-minor", name: "d mineur (natuurlijk)", difficulty: 2,
    notes: ["D4","E4","F4","G4","A4","Bb4","C5","D5"],
    rhFingers: [1,2,3,1,2,3,4,5],
    lhFingers: [5,4,3,2,1,3,2,1],
    description: "Relatieve mineur van F, met Bb.",
  },
  {
    id: "a-minor-harmonic", name: "a mineur (harmonisch)", difficulty: 2,
    notes: ["A3","B3","C4","D4","E4","F4","G#4","A4"],
    rhFingers: [1,2,3,1,2,3,4,5],
    lhFingers: [5,4,3,2,1,3,2,1],
    description: "Harmonisch = verhoogde 7de (G#). Exotische klank door de anderhalve toon.",
  },
];

// --- MAJEUR ARPEGGIO'S (drieklank, één octaaf) ---
// Standaard arpeggio-vingerzetting: RH 1-2-3-5, LH 5-3-2-1.
export const MAJOR_ARPEGGIOS = [
  {
    id: "c-arp", name: "C majeur arpeggio", difficulty: 1,
    notes: ["C4","E4","G4","C5"],
    rhFingers: [1,2,3,5],
    lhFingers: [5,3,2,1],
    description: "Grondtoon-terts-kwint-grondtoon. De bouwsteen van alle akkoorden.",
  },
  {
    id: "g-arp", name: "G majeur arpeggio", difficulty: 1,
    notes: ["G3","B3","D4","G4"],
    rhFingers: [1,2,3,5],
    lhFingers: [5,3,2,1],
    description: "Zelfde vingerpatroon als C.",
  },
  {
    id: "f-arp", name: "F majeur arpeggio", difficulty: 1,
    notes: ["F3","A3","C4","F4"],
    rhFingers: [1,2,3,5],
    lhFingers: [5,3,2,1],
  },
  {
    id: "d-arp", name: "D majeur arpeggio", difficulty: 2,
    notes: ["D4","F#4","A4","D5"],
    rhFingers: [1,2,3,5],
    lhFingers: [5,3,2,1],
  },
  {
    id: "a-arp", name: "A mineur arpeggio", difficulty: 1,
    notes: ["A3","C4","E4","A4"],
    rhFingers: [1,2,3,5],
    lhFingers: [5,3,2,1],
    description: "Mineur-arpeggio: terts is een halve toon lager dan bij majeur.",
  },
];

// --- TECHNIEK-OEFENINGEN ---
// Hanon exercise #1 — de legendarische vingeronafhankelijkheidsoefening.
// Patroon: C E F G A G F E — één octaaf omhoog shiften per herhaling.
// Voor MVP: alleen de eerste groep, met standaard vingerzetting.
export const EXERCISES = [
  {
    id: "hanon-1", name: "Hanon #1 — opening", difficulty: 1,
    notes: ["C4","E4","F4","G4","A4","G4","F4","E4",
            "D4","F4","G4","A4","B4","A4","G4","F4",
            "E4","G4","A4","B4","C5","B4","A4","G4",
            "F4","A4","B4","C5","D5","C5","B4","A4"],
    rhFingers: [1,2,3,4,5,4,3,2,
                1,2,3,4,5,4,3,2,
                1,2,3,4,5,4,3,2,
                1,2,3,4,5,4,3,2],
    lhFingers: [5,4,3,2,1,2,3,4,
                5,4,3,2,1,2,3,4,
                5,4,3,2,1,2,3,4,
                5,4,3,2,1,2,3,4],
    description: "Klassieke vingeronafhankelijkheid. Speel traag (60 bpm), daarna opvoeren. Elke vinger moet onafhankelijk werken.",
  },
  {
    id: "five-finger-c", name: "5-vinger patroon C majeur", difficulty: 1,
    notes: ["C4","D4","E4","F4","G4","F4","E4","D4","C4"],
    rhFingers: [1,2,3,4,5,4,3,2,1],
    lhFingers: [5,4,3,2,1,2,3,4,5],
    description: "De eerste vijf vingers trainen. Hand blijft stil, alleen vingers bewegen.",
  },
  {
    id: "thumb-under-c", name: "Duim-onder oefening (C majeur)", difficulty: 2,
    notes: ["C4","D4","E4","F4","G4","A4","B4","C5","B4","A4","G4","F4","E4","D4","C4"],
    rhFingers: [1,2,3,1,2,3,4,5,4,3,2,1,3,2,1],
    lhFingers: [5,4,3,2,1,3,2,1,2,3,1,2,3,4,5],
    description: "Dé pianotechniek: duim onder de derde vinger door schuiven om het octaaf te halen. Speel traag en kijk naar je duim.",
  },
];

export const ALL_TECHNIQUE = [
  { category: "Majeur toonladders", items: MAJOR_SCALES },
  { category: "Mineur toonladders", items: MINOR_SCALES },
  { category: "Arpeggio's",         items: MAJOR_ARPEGGIOS },
  { category: "Techniek-oefeningen",items: EXERCISES },
];

export function findTechnique(id) {
  for (const group of ALL_TECHNIQUE) {
    const f = group.items.find((it) => it.id === id);
    if (f) return f;
  }
  return null;
}
