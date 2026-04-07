// Volledig curriculum: beginner → gevorderd, gegroepeerd in units.
//
// Drill-types:
//   { type: "notes",    notes: [...] }           → random-drill van deze set
//   { type: "sequence", notes: [...] }           → exact in deze volgorde spelen
//   { type: "song",     songId: "..." }          → openen in de songs-tab

export const UNITS = [
  {
    id: "u1",
    title: "Unit 1 — Eerste stappen",
    lessons: [
      {
        id: "l1-1",
        title: "Middle C vinden",
        goal: "Leer middle C (C4) herkennen en aanslaan.",
        drill: { type: "notes", notes: ["C4"] },
      },
      {
        id: "l1-2",
        title: "C, D, E",
        goal: "De eerste drie witte toetsen rechts van middle C.",
        drill: { type: "notes", notes: ["C4","D4","E4"] },
      },
      {
        id: "l1-3",
        title: "F en G erbij",
        goal: "Breid uit met F4 en G4 — de vijf vingers van de rechterhand.",
        drill: { type: "notes", notes: ["C4","D4","E4","F4","G4"] },
      },
      {
        id: "l1-4",
        title: "A, B, C5 — eerste octaaf compleet",
        goal: "Herken alle witte toetsen van C4 tot C5.",
        drill: { type: "notes", notes: ["C4","D4","E4","F4","G4","A4","B4","C5"] },
      },
      {
        id: "l1-5",
        title: "C-majeur toonladder (omhoog en omlaag)",
        goal: "Speel de C-majeur toonladder in volgorde.",
        drill: { type: "sequence", notes: ["C4","D4","E4","F4","G4","A4","B4","C5","B4","A4","G4","F4","E4","D4","C4"] },
      },
      {
        id: "l1-6",
        title: "Alle eendjes zwemmen in het water",
        goal: "Eerste echte liedje — blijf binnen één octaaf.",
        drill: { type: "song", songId: "alle-eendjes" },
      },
      {
        id: "l1-7",
        title: "Mary Had a Little Lamb",
        goal: "Drie-noten-patroon met herhalingen.",
        drill: { type: "song", songId: "mary-lamb" },
      },
    ],
  },
  {
    id: "u2",
    title: "Unit 2 — Notenlezen viool-sleutel",
    lessons: [
      {
        id: "l2-1",
        title: "Lijnen: E G B D F",
        goal: "De noten op de vijf lijnen van de viool-sleutel.",
        drill: { type: "notes", notes: ["E4","G4","B4","D5","F5"] },
      },
      {
        id: "l2-2",
        title: "Tussen de lijnen: F A C E",
        goal: "De noten in de vier ruimtes.",
        drill: { type: "notes", notes: ["F4","A4","C5","E5"] },
      },
      {
        id: "l2-3",
        title: "Hulplijnen onder",
        goal: "Middle C (C4) en D4 op de hulplijn.",
        drill: { type: "notes", notes: ["C4","D4","E4"] },
      },
      {
        id: "l2-4",
        title: "Hulplijnen boven",
        goal: "A5, B5, C6 — boven de vijfde lijn.",
        drill: { type: "notes", notes: ["G5","A5","B5","C6"] },
      },
      {
        id: "l2-5",
        title: "Vader Jacob",
        goal: "Melodie met stapsgewijze beweging.",
        drill: { type: "song", songId: "vader-jacob" },
      },
      {
        id: "l2-6",
        title: "Twinkle Twinkle",
        goal: "Grotere sprongen herkennen (C→G, F→E).",
        drill: { type: "song", songId: "twinkle" },
      },
    ],
  },
  {
    id: "u3",
    title: "Unit 3 — Notenlezen bas-sleutel (linkerhand)",
    lessons: [
      {
        id: "l3-1",
        title: "Lijnen F-sleutel: G B D F A",
        goal: "De noten op de lijnen van de F-sleutel.",
        drill: { type: "notes", notes: ["G2","B2","D3","F3","A3"] },
      },
      {
        id: "l3-2",
        title: "Tussen de lijnen: A C E G",
        goal: "De ruimtes van de F-sleutel.",
        drill: { type: "notes", notes: ["A2","C3","E3","G3"] },
      },
      {
        id: "l3-3",
        title: "Lage C, G, F",
        goal: "Oriëntatie in het lage register.",
        drill: { type: "notes", notes: ["C2","F2","G2","C3"] },
      },
      {
        id: "l3-4",
        title: "Linkerhand C-akkoord als losse noten",
        goal: "Speel C-E-G (gebroken akkoord) in het bas-register.",
        drill: { type: "sequence", notes: ["C3","E3","G3","C4","G3","E3","C3"] },
      },
      {
        id: "l3-5",
        title: "Linkerhand F- en G-akkoord",
        goal: "F-A-C en G-B-D als gebroken akkoorden.",
        drill: { type: "sequence", notes: ["F3","A3","C4","G3","B3","D4"] },
      },
    ],
  },
  {
    id: "u4",
    title: "Unit 4 — Zwarte toetsen",
    lessons: [
      {
        id: "l4-1",
        title: "De kruisen: F#, C#, G#",
        goal: "Herken kruis-noten op de zwarte toetsen.",
        drill: { type: "notes", notes: ["F#4","C#5","G#4"] },
      },
      {
        id: "l4-2",
        title: "De mollen: Bb, Eb, Ab",
        goal: "Herken mol-noten — dezelfde toetsen, andere namen.",
        drill: { type: "notes", notes: ["Bb4","Eb4","Ab4"] },
      },
      {
        id: "l4-3",
        title: "Chromatische toonladder C4 → C5",
        goal: "Alle twaalf halve tonen achter elkaar.",
        drill: { type: "sequence", notes: ["C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5"] },
      },
      {
        id: "l4-4",
        title: "Alle zwarte toetsen in twee octaven",
        goal: "Navigeer over de zwarte-toets-groepen heen.",
        drill: { type: "notes", notes: ["C#3","D#3","F#3","G#3","A#3","C#4","D#4","F#4","G#4","A#4"] },
      },
    ],
  },
  {
    id: "u5",
    title: "Unit 5 — Majeur toonladders",
    lessons: [
      {
        id: "l5-1",
        title: "G majeur (1 kruis)",
        goal: "G-A-B-C-D-E-F#-G.",
        drill: { type: "sequence", notes: ["G4","A4","B4","C5","D5","E5","F#5","G5","F#5","E5","D5","C5","B4","A4","G4"] },
      },
      {
        id: "l5-2",
        title: "D majeur (2 kruisen)",
        goal: "D-E-F#-G-A-B-C#-D.",
        drill: { type: "sequence", notes: ["D4","E4","F#4","G4","A4","B4","C#5","D5","C#5","B4","A4","G4","F#4","E4","D4"] },
      },
      {
        id: "l5-3",
        title: "A majeur (3 kruisen)",
        goal: "A-B-C#-D-E-F#-G#-A.",
        drill: { type: "sequence", notes: ["A3","B3","C#4","D4","E4","F#4","G#4","A4","G#4","F#4","E4","D4","C#4","B3","A3"] },
      },
      {
        id: "l5-4",
        title: "F majeur (1 mol)",
        goal: "F-G-A-Bb-C-D-E-F.",
        drill: { type: "sequence", notes: ["F4","G4","A4","Bb4","C5","D5","E5","F5","E5","D5","C5","Bb4","A4","G4","F4"] },
      },
      {
        id: "l5-5",
        title: "Bb majeur (2 mollen)",
        goal: "Bb-C-D-Eb-F-G-A-Bb.",
        drill: { type: "sequence", notes: ["Bb3","C4","D4","Eb4","F4","G4","A4","Bb4","A4","G4","F4","Eb4","D4","C4","Bb3"] },
      },
      {
        id: "l5-6",
        title: "Eb majeur (3 mollen)",
        goal: "Eb-F-G-Ab-Bb-C-D-Eb.",
        drill: { type: "sequence", notes: ["Eb4","F4","G4","Ab4","Bb4","C5","D5","Eb5","D5","C5","Bb4","Ab4","G4","F4","Eb4"] },
      },
    ],
  },
  {
    id: "u6",
    title: "Unit 6 — Liedjes intermediate",
    lessons: [
      {
        id: "l6-1",
        title: "London Bridge",
        goal: "Melodische lijnen over een octaaf.",
        drill: { type: "song", songId: "london-bridge" },
      },
      {
        id: "l6-2",
        title: "Old MacDonald",
        goal: "Grotere sprongen: G→D, B→G.",
        drill: { type: "song", songId: "old-macdonald" },
      },
      {
        id: "l6-3",
        title: "Ode an die Freude",
        goal: "Stapsgewijze melodie van Beethoven.",
        drill: { type: "song", songId: "ode" },
      },
      {
        id: "l6-4",
        title: "Happy Birthday",
        goal: "Melodie met opmaat en octaaf-sprong.",
        drill: { type: "song", songId: "happy-birthday" },
      },
      {
        id: "l6-5",
        title: "Jingle Bells",
        goal: "Ritmische herhalingen.",
        drill: { type: "song", songId: "jingle-bells" },
      },
    ],
  },
  {
    id: "u7",
    title: "Unit 7 — Mineur & intervallen",
    lessons: [
      {
        id: "l7-1",
        title: "a-mineur toonladder (natuurlijk)",
        goal: "A-B-C-D-E-F-G-A.",
        drill: { type: "sequence", notes: ["A3","B3","C4","D4","E4","F4","G4","A4","G4","F4","E4","D4","C4","B3","A3"] },
      },
      {
        id: "l7-2",
        title: "e-mineur toonladder (natuurlijk)",
        goal: "E-F#-G-A-B-C-D-E.",
        drill: { type: "sequence", notes: ["E4","F#4","G4","A4","B4","C5","D5","E5","D5","C5","B4","A4","G4","F#4","E4"] },
      },
      {
        id: "l7-3",
        title: "d-mineur toonladder (natuurlijk)",
        goal: "D-E-F-G-A-Bb-C-D.",
        drill: { type: "sequence", notes: ["D4","E4","F4","G4","A4","Bb4","C5","D5","C5","Bb4","A4","G4","F4","E4","D4"] },
      },
      {
        id: "l7-4",
        title: "a-mineur harmonisch",
        goal: "Met verhoogde zevende: G#.",
        drill: { type: "sequence", notes: ["A3","B3","C4","D4","E4","F4","G#4","A4","G#4","F4","E4","D4","C4","B3","A3"] },
      },
      {
        id: "l7-5",
        title: "Intervallen: grote tertsen in C",
        goal: "Speel C-E, D-F, E-G, F-A, G-B, A-C, B-D — als losse noten na elkaar.",
        drill: { type: "sequence", notes: ["C4","E4","D4","F4","E4","G4","F4","A4","G4","B4","A4","C5","B4","D5"] },
      },
      {
        id: "l7-6",
        title: "Intervallen: kwinten in C",
        goal: "C-G, D-A, E-B, F-C, G-D.",
        drill: { type: "sequence", notes: ["C4","G4","D4","A4","E4","B4","F4","C5","G4","D5"] },
      },
    ],
  },
  {
    id: "u8",
    title: "Unit 8 — Klassieke eerste stukken",
    lessons: [
      {
        id: "l8-1",
        title: "Minuet in G (Bach, opening)",
        goal: "Eerste klassieke stuk.",
        drill: { type: "song", songId: "minuet-g" },
      },
      {
        id: "l8-2",
        title: "Canon in D (Pachelbel)",
        goal: "Barok-melodie met dalende sequensen.",
        drill: { type: "song", songId: "canon-d" },
      },
      {
        id: "l8-3",
        title: "Amazing Grace",
        goal: "Spirituele melodie met sprongen.",
        drill: { type: "song", songId: "amazing-grace" },
      },
      {
        id: "l8-4",
        title: "Scarborough Fair",
        goal: "Mineur-melodie met modale kleur.",
        drill: { type: "song", songId: "scarborough-fair" },
      },
    ],
  },
  {
    id: "u9",
    title: "Unit 9 — Gevorderd",
    lessons: [
      {
        id: "l9-1",
        title: "Für Elise (opening)",
        goal: "Chromatische beweging en snelle wisselingen.",
        drill: { type: "song", songId: "fur-elise" },
      },
      {
        id: "l9-2",
        title: "Greensleeves",
        goal: "Lange frasen in mineur.",
        drill: { type: "song", songId: "greensleeves" },
      },
      {
        id: "l9-3",
        title: "C-majeur over twee octaven",
        goal: "Grote range van C3 tot C5 en terug.",
        drill: { type: "sequence", notes: ["C3","D3","E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4","B4","C5","B4","A4","G4","F4","E4","D4","C4","B3","A3","G3","F3","E3","D3","C3"] },
      },
      {
        id: "l9-4",
        title: "Alle zeven kruistekens herkennen",
        goal: "F#, C#, G#, D#, A#, E#, B# — oplopende volgorde van de kwintencirkel.",
        drill: { type: "notes", notes: ["F#4","C#4","G#4","D#4","A#4","F4","C5"] },
      },
      {
        id: "l9-5",
        title: "Alle zeven moltekens herkennen",
        goal: "Bb, Eb, Ab, Db, Gb, Cb, Fb — dalende volgorde van de kwintencirkel.",
        drill: { type: "notes", notes: ["Bb4","Eb4","Ab4","Db4","Gb4","B3","E4"] },
      },
      {
        id: "l9-6",
        title: "Chromatisch over twee octaven",
        goal: "Alle 24 halve tonen van C3 tot C5.",
        drill: { type: "sequence", notes: ["C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5"] },
      },
    ],
  },
];

// Platte lijst voor backwards-compat en voortgang.
export const LESSONS = UNITS.flatMap((u) =>
  u.lessons.map((l) => ({ ...l, unitId: u.id, unitTitle: u.title }))
);

import { SONGS } from "./songs.js";

// Bouwt een synthetische "oefen-batterij" (review) voor een unit. De review
// combineert materiaal uit alle lessen in de unit.
//
// - Skill-units (notes/sequence drills): mix alle unieke noten, presenteer
//   in willekeurige volgorde voor noot-herkenning. Max ~20 noten.
// - Song-units (meerderheid songs): medley van de eerste 6 noten van elk
//   liedje in de unit, aaneen gespeeld als één sequence.
// - Gemengde units: combineert beide — eerst een noot-mix, dan de medley.
export function buildUnitReview(unit) {
  const noteDrills = unit.lessons.filter((l) => l.drill.type === "notes" || l.drill.type === "sequence");
  const songDrills = unit.lessons.filter((l) => l.drill.type === "song");

  // Song-overheersend
  if (songDrills.length >= 3 && noteDrills.length <= 1) {
    const medley = [];
    songDrills.forEach((l) => {
      const song = SONGS.find((s) => s.id === l.drill.songId);
      if (song) medley.push(...song.notes.slice(0, 6));
    });
    return {
      id: `${unit.id}-review`,
      title: `⭐ Oefen-batterij — medley`,
      goal: `Speel korte fragmenten uit elk liedje in ${unit.title}.`,
      isReview: true,
      drill: { type: "sequence", notes: medley },
    };
  }

  // Notes/sequence-overheersend of gemengd
  const uniq = new Set();
  noteDrills.forEach((l) => l.drill.notes.forEach((n) => uniq.add(n)));
  let noteList = Array.from(uniq);
  // Max 20 noten om het behapbaar te houden
  if (noteList.length > 20) {
    noteList = noteList.sort(() => Math.random() - 0.5).slice(0, 20);
  }

  if (songDrills.length === 0) {
    return {
      id: `${unit.id}-review`,
      title: `⭐ Oefen-batterij — mix`,
      goal: `Herken alle noten uit ${unit.title} in willekeurige volgorde.`,
      isReview: true,
      drill: { type: "notes", notes: noteList },
    };
  }

  // Gemengd: doe de noten-drill als review
  return {
    id: `${unit.id}-review`,
    title: `⭐ Oefen-batterij — gemengd`,
    goal: `Herken alle noten uit ${unit.title}. De liedjes oefen je los in de unit zelf.`,
    isReview: true,
    drill: { type: "notes", notes: noteList },
  };
}

const STORAGE_KEY = "piano-lesson-progress";

export function getProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

export function markDone(id) {
  const p = getProgress();
  p[id] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
