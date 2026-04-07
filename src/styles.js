// Muziekstijlen: educatieve beschrijvingen per periode met pianotechniek-tips
// en karakteristieke demo-fragmenten (als MIDI-noten via synth).

import { nameToMidi } from "./music.js";

export const MUSIC_STYLES = [
  {
    id: "baroque",
    name: "Barok",
    period: "ca. 1600 – 1750",
    color: "#b8860b",
    composers: ["Johann Sebastian Bach", "Georg Friedrich Händel", "Domenico Scarlatti", "Henry Purcell"],
    characteristics: [
      "Polyfonie: meerdere onafhankelijke melodielijnen tegelijk",
      "Ornamentiek: trillers, mordenten, turns — noten versieren",
      "Gelijkmatige pulsatie, weinig rubato",
      "Terrasendynamiek: geen geleidelijke crescendo, maar blok-dynamiek",
      "Continuo: akkoorden geïmproviseerd op basis van een bas-stem",
    ],
    pianoTips: [
      "Speel staccato en non-legato — de clavecimbel kon geen dynamiek, articulatie was alles",
      "Oefen iedere stem apart voor je ze samenvoegt (Bach inventies)",
      "Ornamentiek zit op de tel, niet ervoor",
      "Houd de bas- en melodiestem goed gescheiden in klankleur",
    ],
    pieces: ["Preludes & Fuga's (WTC)", "Inventies", "Partita's", "Goldberg-variaties", "Scarlatti-sonates"],
    // Demo: C-groot arpeggio in barokke stijl (gebroken akkoord)
    demo: ["C4","E4","G4","C5","E5","G5","E5","C5","G4","E4","C4"],
    demoLabel: "Gebroken akkoord (typisch barok)",
  },
  {
    id: "classical",
    name: "Klassiek",
    period: "ca. 1750 – 1820",
    color: "#2e7d32",
    composers: ["Wolfgang Amadeus Mozart", "Joseph Haydn", "Ludwig van Beethoven (vroeg)", "Muzio Clementi"],
    characteristics: [
      "Homofonie: één melodielijn met akkoordbegeleiding",
      "Duidelijke frasestructuur: 4+4 of 8+8 maten",
      "Dynamisch contrast: forte vs piano, crescendo/decrescendo",
      "Alberti-bas: gebroken drieklank in de LH (do-sol-mi-sol herhaling)",
      "Klassieke vormen: sonatevorm, rondo, menuet & trio",
    ],
    pianoTips: [
      "Alberti-bas (LH) heel licht spelen — het is begeleiding, geen melodie",
      "Fraseringen als boogjes: begin licht, ga naar de top, kom terug",
      "Sforzando-accenten op onverwachte momenten (typisch Beethoven)",
      "Mozart: kristalheldere aanslag, geen pedaal overgebruiken",
    ],
    pieces: ["Sonate in A (K.331)", "Sonate 'Pathétique'", "Rondo alla Turca", "Sonatines (Clementi)"],
    demo: ["C4","G3","E4","G3","C4","G3","E4","G3","D4","G3","F4","G3","E4","G3","C4","G3"],
    demoLabel: "Alberti-bas patroon (klassiek LH)",
  },
  {
    id: "romantic",
    name: "Romantiek",
    period: "ca. 1820 – 1900",
    color: "#880e4f",
    composers: ["Frédéric Chopin", "Franz Liszt", "Robert Schumann", "Johannes Brahms", "Franz Schubert"],
    characteristics: [
      "Expressie boven vorm: emotie, verhaal, programma-muziek",
      "Rubato: vrij tempo voor expressie ('gestolen tijd')",
      "Brede dynamiekrange: pianissimo tot fortissimo",
      "Pedaalgebruik als compositie-element",
      "Virtuositeit: technisch veeleisende passages",
    ],
    pianoTips: [
      "Rubato: rek de melodienoot uit, haal de tijd terug in de begeleiding",
      "Pedaal na de bas aanslaan, loslaten bij akkoordwisseling",
      "Cantabile-aanslag: de melodievinger 'zingt' — dieper in de toets",
      "Voicing: de bovenste vinger in een akkoord klinkt harder dan de rest",
    ],
    pieces: ["Nocturnes (Chopin)", "Walsen (Chopin)", "Kinderscènes (Schumann)", "Liebestraum (Liszt)"],
    demo: ["C4","E4","G4","C5","E5","C5","G4","E4","C4","B3","D4","G4","B4","D5","B4","G4","D4","B3"],
    demoLabel: "Gebroken akkoorden (romantisch arpeggio)",
  },
  {
    id: "impressionism",
    name: "Impressionisme",
    period: "ca. 1890 – 1930",
    color: "#0277bd",
    composers: ["Claude Debussy", "Maurice Ravel", "Erik Satie", "Gabriel Fauré"],
    characteristics: [
      "Kleurharmonie: parallelle akkoorden, kwartakkoorden, hele-toonsschaal",
      "Textuur en sfeer boven melodie",
      "Pedaal als kleurenpalet",
      "Pentatoniek en modale toonsoorten",
      "Titels als schilderijen: 'La mer', 'Clair de Lune'",
    ],
    pianoTips: [
      "Leg het pedaal vóór de aanslag voor 'natte' klankkleuren",
      "Vlakke vingers voor een zacht, diep timbre",
      "Parallelle akkoorden: alle stemmen gelijktijdig, non-legato",
      "Luister naar de klankresonantie — houd toetsen vast na de aanslag",
    ],
    pieces: ["Clair de Lune (Debussy)", "Gymnopédie (Satie)", "Miroirs (Ravel)", "Arabesque (Debussy)"],
    // Hele-toonsschaal demo
    demo: ["C4","D4","E4","F#4","G#4","A#4","C5","A#4","G#4","F#4","E4","D4","C4"],
    demoLabel: "Hele-toonsschaal (impressionistisch kleurpalet)",
  },
  {
    id: "jazz",
    name: "Jazz & Blues",
    period: "ca. 1900 – heden",
    color: "#4a148c",
    composers: ["Scott Joplin", "Duke Ellington", "Thelonious Monk", "Bill Evans", "Oscar Peterson"],
    characteristics: [
      "Swing: achtsten niet gelijk maar lang-kort (tripletfeel)",
      "Blue notes: verlaagde 3e, 5e en 7e toon",
      "Syncopatie: accenten op de 'off-beats'",
      "Comping: akkoordspel achter een solist",
      "Improvisatie over een harmonisch schema",
    ],
    pianoTips: [
      "Swing achtsten: speel ze als de 1e en 3e noot van een triool",
      "Voeg 7e, 9e, 11e tonen toe aan akkoorden voor jazz-kleur",
      "LH: comping met sparse akkoorden op de 2 en 4",
      "Leer de blues-toonschaal: C-Eb-F-Gb-G-Bb-C",
    ],
    pieces: ["The Entertainer (Joplin)", "Round Midnight (Monk)", "Autumn Leaves", "All the Things You Are"],
    demo: ["C4","Eb4","F4","Gb4","G4","Bb4","C5","Bb4","G4","Gb4","F4","Eb4","C4"],
    demoLabel: "Blues-toonschaal in C",
  },
  {
    id: "pop",
    name: "Pop & Rock",
    period: "ca. 1950 – heden",
    color: "#e65100",
    composers: ["Elton John", "Billy Joel", "Bruce Hornsby", "Ben Folds", "Norah Jones"],
    characteristics: [
      "Vier-akkoorden-progressies: I–V–vi–IV",
      "Rock-beat: drums op 1-2-3-4, aangedreven ritme",
      "Akkoorden als blokken of gebroken patroon",
      "Hooklijn boven een herhalende progressie",
      "Mix van klassieke techniek en populaire harmonik",
    ],
    pianoTips: [
      "Rechtopstaande pedaaltechniek: kort en ritmisch voor pop-gevoel",
      "LH power-octaven: bas + octaaf tegelijk voor volle klank",
      "RH inversies voor smooth voice leading in progressies",
      "Leer de I–V–vi–IV in alle toonsoorten — het fundament van pop",
    ],
    pieces: ["Piano Man (Joel)", "Rocket Man (John)", "Don't Stop Believin'", "Clocks (Coldplay)"],
    demo: ["C4","E4","G4","C5","G4","E4","G4","B4","D5","B4","G4","A4","C5","E5","F4","A4","C5","F5"],
    demoLabel: "I–V–vi–IV progressie (pop-akkoorden)",
  },
];

export function findStyle(id) {
  return MUSIC_STYLES.find((s) => s.id === id) || MUSIC_STYLES[0];
}
