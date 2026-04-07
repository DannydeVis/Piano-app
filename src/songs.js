// Een kleine bibliotheek aan herkenbare, rechtenvrije liedjes.
// Elke melodie is een lijst noot-namen (eenstemmig, rechterhand).
// Octaven volgens wetenschappelijke notatie: middle C = C4.

export const SONGS = [
  {
    id: "vader-jacob",
    title: "Vader Jacob",
    difficulty: 1,
    notes: [
      "C4","D4","E4","C4",
      "C4","D4","E4","C4",
      "E4","F4","G4",
      "E4","F4","G4",
      "G4","A4","G4","F4","E4","C4",
      "G4","A4","G4","F4","E4","C4",
      "C4","G3","C4",
      "C4","G3","C4",
    ],
  },
  {
    id: "twinkle",
    title: "Twinkle Twinkle Little Star",
    difficulty: 1,
    notes: [
      "C4","C4","G4","G4","A4","A4","G4",
      "F4","F4","E4","E4","D4","D4","C4",
      "G4","G4","F4","F4","E4","E4","D4",
      "G4","G4","F4","F4","E4","E4","D4",
      "C4","C4","G4","G4","A4","A4","G4",
      "F4","F4","E4","E4","D4","D4","C4",
    ],
  },
  {
    id: "ode",
    title: "Ode an die Freude (thema)",
    difficulty: 2,
    notes: [
      "E4","E4","F4","G4","G4","F4","E4","D4",
      "C4","C4","D4","E4","E4","D4","D4",
      "E4","E4","F4","G4","G4","F4","E4","D4",
      "C4","C4","D4","E4","D4","C4","C4",
    ],
  },
  {
    id: "happy-birthday",
    title: "Happy Birthday (melodie)",
    difficulty: 2,
    notes: [
      "C4","C4","D4","C4","F4","E4",
      "C4","C4","D4","C4","G4","F4",
      "C4","C4","C5","A4","F4","E4","D4",
      "A4","A4","A4","F4","G4","F4",
    ],
  },
  {
    id: "jingle-bells",
    title: "Jingle Bells (refrein)",
    difficulty: 2,
    notes: [
      "E4","E4","E4",
      "E4","E4","E4",
      "E4","G4","C4","D4","E4",
      "F4","F4","F4","F4","F4","E4","E4","E4","E4","D4","D4","E4","D4","G4",
    ],
  },
  {
    id: "minuet-g",
    title: "Minuet in G (Bach, opening)",
    difficulty: 3,
    notes: [
      "D5","G4","A4","B4","C5","D5",
      "G4","G4",
      "E5","C5","D5","E5","F#5","G5",
      "G4","G4",
      "C5","D5","C5","B4","A4","B4",
      "C5","B4","A4","G4",
      "F#4","G4","A4","B4","G4","B4","A4",
    ],
  },
  {
    id: "alle-eendjes",
    title: "Alle eendjes zwemmen in het water",
    difficulty: 1,
    notes: [
      "C4","C4","D4","D4","E4","E4","C4",
      "E4","E4","F4","F4","G4",
      "G4","F4","E4","D4","C4",
    ],
  },
  {
    id: "mary-lamb",
    title: "Mary Had a Little Lamb",
    difficulty: 1,
    notes: [
      "E4","D4","C4","D4","E4","E4","E4",
      "D4","D4","D4",
      "E4","G4","G4",
      "E4","D4","C4","D4","E4","E4","E4","E4",
      "D4","D4","E4","D4","C4",
    ],
  },
  {
    id: "london-bridge",
    title: "London Bridge",
    difficulty: 1,
    notes: [
      "G4","A4","G4","F4","E4","F4","G4",
      "D4","E4","F4",
      "E4","F4","G4",
      "G4","A4","G4","F4","E4","F4","G4",
      "D4","G4","E4","C4",
    ],
  },
  {
    id: "old-macdonald",
    title: "Old MacDonald",
    difficulty: 1,
    notes: [
      "G4","G4","G4","D4","E4","E4","D4",
      "B4","B4","A4","A4","G4",
      "D4","G4","G4","G4","D4","E4","E4","D4",
      "B4","B4","A4","A4","G4",
    ],
  },
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    difficulty: 2,
    notes: [
      "D4","G4","B4","G4","B4","A4",
      "G4","E4","D4",
      "D4","G4","B4","G4","B4","A4",
      "D5","B4",
      "D5","B4","G4","G4","E4","D4",
      "G4","A4","G4","E4","D4","G4",
    ],
  },
  {
    id: "scarborough-fair",
    title: "Scarborough Fair",
    difficulty: 2,
    notes: [
      "A4","E5","E5","F#5","E5","D5","C5","A4",
      "A4","C5","B4","A4","G4","A4",
      "B4","C5","A4","G4","A4",
      "E4","A4","A4","B4","C5","B4","A4","G4",
      "A4",
    ],
  },
  {
    id: "canon-d",
    title: "Canon in D (Pachelbel, melodie)",
    difficulty: 3,
    notes: [
      "F#5","E5","D5","C#5","B4","A4","B4","C#5",
      "D5","C#5","B4","A4","G4","F#4","G4","E4",
      "F#4","E4","D4","E4","F#4","G4","A4","B4",
      "A4","G4","F#4","G4","A4","B4","C#5","D5",
    ],
  },
  {
    id: "greensleeves",
    title: "Greensleeves",
    difficulty: 3,
    notes: [
      "A4","C5","D5","E5","F5","E5","D5","B4",
      "G4","A4","B4","C5","A4","A4","G#4","A4",
      "A4","C5","D5","E5","F5","E5","D5","B4",
      "G4","A4","B4","A4","G#4","F#4","E4",
    ],
  },
  {
    id: "fur-elise",
    title: "Für Elise (opening)",
    difficulty: 3,
    notes: [
      "E5","D#5","E5","D#5","E5","B4","D5","C5","A4",
      "C4","E4","A4","B4",
      "E4","G#4","B4","C5",
      "E4","E5","D#5","E5","D#5","E5","B4","D5","C5","A4",
    ],
  },
  // ---- Niveau 3–4: herkende klassiekers ----
  {
    id: "eine-kleine",
    title: "Eine kleine Nachtmusik (Mozart)",
    difficulty: 3,
    notes: [
      "G4","G4","D5","D5","E5","D5","C5","B4",
      "A4","A4","D5","D5","E5","D5","C5","B4",
      "G5","F#5","E5","D5","C5","B4","A4","G4",
    ],
  },
  {
    id: "turkish-march",
    title: "Turkse Mars (Mozart)",
    difficulty: 4,
    notes: [
      "A4","G#4","A4","B4","C5","B4","A4","G#4",
      "A4","E5","D5","C5","D5","F5","E5","D5","C5","B4","A4",
      "C5","B4","A4","G#4","A4","E5","D5","C5",
      "D5","F5","E5","D5","C5","B4","A4",
    ],
  },
  {
    id: "entertainer",
    title: "The Entertainer (Joplin)",
    difficulty: 4,
    notes: [
      "D5","B4","D5","D4","E4","G4","E4","C4","D4",
      "D5","B4","D5","D4","E4","G4","A4","G4",
      "D5","B4","D5","D4","E4","G4","E4","C4","D4",
      "A4","G#4","A4","C5","B4","A4","G4",
    ],
  },
  {
    id: "gymnopédie",
    title: "Gymnopédie No.1 (Satie)",
    difficulty: 4,
    notes: [
      "D5","B4","D5","B4","E5","B4",
      "A4","B4","D5","A4","F#5","A4",
      "G5","F#5","E5","D5","C#5","B4",
      "A4","B4","D5","B4","E5","B4",
    ],
  },
  {
    id: "waltz-am",
    title: "Wals in A mineur (Chopin attr.)",
    difficulty: 4,
    notes: [
      "A4","B4","C5","B4","A4","E5",
      "D5","C5","A4","C5","B4","A4","G#4","A4",
      "A4","B4","C5","D5","E5","A5","G#5","A5",
      "F5","E5","D5","C5","B4","A4",
    ],
  },
  // ---- Niveau 5: gevorderd ----
  {
    id: "moonlight",
    title: "Maanlichtsonate (Beethoven, thema)",
    difficulty: 5,
    notes: [
      "G#4","A4","B4","A4","G#4","F#4","E4","D#4",
      "E4","F#4","G#4","A4","B4","C#5","B4","A4",
      "G#4","A4","B4","C#5","D#5","E5","D#5","C#5",
      "B4","G#4","A4","B4","C#5","D#5","E5",
    ],
  },
  {
    id: "nocturne-eb",
    title: "Nocturne in Eb (Chopin, thema)",
    difficulty: 5,
    notes: [
      "Bb4","Eb5","G5","F5","Eb5","D5","C5","Bb4",
      "Ab4","C5","Eb5","Ab5","G5","F5","Eb5","D5",
      "C5","Bb4","Ab4","G4","F4","Eb4","Bb3",
      "Bb4","Eb5","G5","Bb5","Ab5","G5","F5","Eb5",
    ],
  },
];

export function getSong(id) {
  return SONGS.find((s) => s.id === id);
}
