import { nameToMidi, midiToName, RANGES, whiteKeysInRange } from "./music.js";
import { PianoKeyboard } from "./keyboard.js";
import { Staff } from "./staff.js";
import { PitchDetector } from "./pitch.js";
import { SONGS, getSong } from "./songs.js";
import { UNITS, LESSONS, getProgress, markDone, buildUnitReview } from "./lessons.js";
import { SheetPlayer } from "./sheet.js";
import { synth } from "./synth.js";
import { Metronome } from "./metronome.js";
import { IntervalTrainer, ChordTrainer, INTERVALS, CHORD_QUALITIES } from "./ear.js";
import { ALL_TECHNIQUE, findTechnique } from "./scales.js";
import { KEYS, PROGRESSIONS, renderProgression, ROMAN_NUMERALS, scaleMidisInKey } from "./theory.js";
import { pickRandomQuestion } from "./quiz.js";
import { SIGHTREAD_LEVELS, findLevel, genPhrase } from "./sightread.js";
import { RHYTHM_PATTERNS, groupedPatterns, findPattern, analyzeTaps, patternToTimes } from "./rhythm.js";
import { DICTEE_LEVELS, findDicteeLevel, genDicteeFrase, playDicteeFrase } from "./dictee.js";
import { CHORD_TYPES, CHORD_LEVELS, findChordType, findChordLevel, groupedChordTypes, chordMidis, chordSymbol, randomChord, prettyRoot } from "./leadsheet.js";
import { TRANSPOSABLE_SONGS, TRANSPOSE_KEYS, transposeMidis, intervalBetweenKeys, intervalLabel, songNotesToMidis, drillSequence } from "./transposer.js";
import { CircleOfFifths } from "./circle.js";
import { MUSIC_STYLES, findStyle } from "./styles.js";
import { LH_PATTERNS, findLHPattern, DuetPlayer } from "./duet.js";
import { INVERSION_LEVELS, findInversionLevel, inversionMidis, inversionSymbol, inversionName, inversionBassDesc, inversionCount, randomInversionDrill, voiceLeadingDemo } from "./inversions.js";

// ---------- Tab navigatie (hidden nav — bestaande init-listeners blijven werken) ----------
const tabs = document.querySelectorAll("#tabs button");
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.toggle("active", t.id === "tab-" + btn.dataset.tab);
    });
  });
});

// ---------- Nieuwe navigatie-engine ----------
let _currentMain = "home"; // home | lessons | practice | tools
let _currentTool = null;   // null of tabId string

function switchToMain(name) {
  _currentMain = name;
  _currentTool = null;

  // Verberg alle tool-panelen
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));

  // Verberg/toon main-sections
  document.querySelectorAll(".main-section").forEach((s) => { s.hidden = true; });
  const mainEl = document.getElementById("main-" + name);
  if (mainEl) mainEl.hidden = false;

  // Verberg back-bar
  document.getElementById("tool-back-bar").hidden = true;

  // Update bottom-nav actief
  document.querySelectorAll("#bottom-nav .nav-item").forEach((b) => {
    b.classList.toggle("active", b.dataset.main === name);
  });

  // Speciale acties per sectie
  if (name === "lessons") {
    document.getElementById("tab-lessons").classList.add("active");
    // Reset sub-nav naar "Lessen"
    document.querySelectorAll(".lessons-sub-btn").forEach((b) => b.classList.toggle("active", b.dataset.sub === "lessons"));
  }
  if (name === "home") {
    renderDashboard();
  }
}

function openTool(toolId, fromMain, label) {
  _currentMain = fromMain;
  _currentTool = toolId;

  // Verberg alle main-sections
  document.querySelectorAll(".main-section").forEach((s) => { s.hidden = true; });

  // Toon back-bar
  const backBar = document.getElementById("tool-back-bar");
  backBar.hidden = false;
  document.getElementById("tool-back-title").textContent = label;
  document.getElementById("tool-back-btn").dataset.target = fromMain;

  // Activeer tool via het verborgen tab-knop (triggert init-listeners)
  const hiddenBtn = document.querySelector(`#tabs button[data-tab="${toolId}"]`);
  if (hiddenBtn) hiddenBtn.click();
}

function closeTool() {
  switchToMain(_currentMain || "home");
}

// Bottom-nav klik
document.querySelectorAll("#bottom-nav .nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    switchToMain(btn.dataset.main);
  });
});

// Tool-kaart klik (practice + tools grids)
document.querySelectorAll(".tool-card[data-tool]").forEach((card) => {
  const TOOL_LABELS = {
    learn: "Noot leren", technique: "Techniek", ear: "Gehoor",
    sightread: "Bladlezen", rhythm: "Ritme", dictee: "Dictee",
    chords: "Lead Sheet", duet: "Duet", metro: "Metronoom",
    theory: "Theorie", circle: "Kwintencirkel", inversions: "Omkeringen",
    transpose: "Transpositie", styles: "Stijlen", sheet: "Bladmuziek",
  };
  card.addEventListener("click", () => {
    openTool(card.dataset.tool, card.dataset.from, TOOL_LABELS[card.dataset.tool] || card.dataset.tool);
  });
});

// Terug-knop
document.getElementById("tool-back-btn").addEventListener("click", () => {
  closeTool();
});

// Lessen sub-nav (Lessen | Liedjes)
document.querySelectorAll(".lessons-sub-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".lessons-sub-btn").forEach((b) => b.classList.toggle("active", b === btn));
    document.querySelector('#tabs button[data-tab="' + btn.dataset.sub + '"]').click();
  });
});

// ---------- Gedeelde pitch-detector ----------
const micBtn = document.getElementById("mic-toggle");
const micStatus = document.getElementById("mic-status");
const detectedEl = document.getElementById("detected");

let pitch = null;
let currentListener = null; // functie die noot-events ontvangt

function setListener(fn) { currentListener = fn; }

async function toggleMic() {
  if (pitch && pitch.running) {
    pitch.stop();
    pitch = null;
    micBtn.textContent = "🎤 Microfoon starten";
    micStatus.textContent = "mic uit";
    detectedEl.textContent = "—";
    return;
  }
  try {
    pitch = new PitchDetector({
      onNote: (info) => {
        detectedEl.textContent = `${info.name} (${info.cents >= 0 ? "+" : ""}${info.cents.toFixed(0)} ct)`;
        if (currentListener) currentListener(info);
      },
    });
    await pitch.start();
    micBtn.textContent = "🎤 Stop microfoon";
    micStatus.textContent = "luisterend…";
  } catch (err) {
    micStatus.textContent = "mic geweigerd";
    alert("Geen toegang tot de microfoon: " + err.message);
  }
}
micBtn.addEventListener("click", toggleMic);

// ---------- Tab: Noot leren ----------
const learnStaff = new Staff(document.getElementById("staff"));
const learnKb = new PianoKeyboard(document.getElementById("keyboard"), RANGES.middle);
const rangeSel = document.getElementById("range");
const newNoteBtn = document.getElementById("new-note");
const scoreEl = document.getElementById("score");
let score = { correct: 0, total: 0 };
let targetMidi = null;

function pickNote() {
  const range = RANGES[rangeSel.value];
  learnKb.setRange(range.min, range.max);
  const whites = whiteKeysInRange(range); // beginner: start met witte toetsen
  targetMidi = whites[Math.floor(Math.random() * whites.length)];
  learnKb.clearHighlights();
  learnKb.highlight(targetMidi, "target");
  learnStaff.showNote(targetMidi);
}

function onLearnNote(info) {
  if (targetMidi == null) return;
  if (info.midi === targetMidi) {
    score.correct++;
    score.total++;
    scoreEl.textContent = `${score.correct} / ${score.total}`;
    learnKb.highlight(targetMidi, "correct");
    setTimeout(pickNote, 600);
  } else {
    // korte foutflash, geen telling bij vergissing (beginnervriendelijk)
    learnKb.highlight(info.midi, "wrong");
    setTimeout(() => learnKb.unhighlight(info.midi), 400);
  }
}

rangeSel.addEventListener("change", pickNote);
newNoteBtn.addEventListener("click", pickNote);

// Default actieve tab = learn → zorg dat targetMidi er is
pickNote();

// Wanneer op learn-tab actief, gebruik learn listener
function activateLearnListener() { setListener(onLearnNote); }
document.querySelector('#tabs button[data-tab="learn"]').addEventListener("click", activateLearnListener);
activateLearnListener();

// ---------- Tab: Liedjes ----------
const songListEl = document.getElementById("song-list");
const songPlayerEl = document.getElementById("song-player");
const songStaff = new Staff(document.getElementById("song-staff"), { width: 700 });
const songKb = new PianoKeyboard(document.getElementById("song-keyboard"), RANGES.middle);
const songTitleEl = document.getElementById("song-title");
const songProgressEl = document.getElementById("song-progress");
const songBackBtn = document.getElementById("song-back");
const songStartBtn = document.getElementById("song-start");

let currentSong = null;
let songIndex = 0;
let songActive = false;

function renderSongList() {
  songListEl.innerHTML = "";
  // Groepeer per moeilijkheidsgraad
  const byLevel = {};
  SONGS.forEach((s) => {
    if (!byLevel[s.difficulty]) byLevel[s.difficulty] = [];
    byLevel[s.difficulty].push(s);
  });
  const levelLabels = { 1: "Beginner", 2: "Makkelijk", 3: "Gemiddeld", 4: "Gevorderd", 5: "Moeilijk" };
  Object.keys(byLevel).sort().forEach((lvl) => {
    const group = document.createElement("li");
    group.style.listStyle = "none";
    group.style.padding = "0";
    group.innerHTML = `<div class="unit-section-label" style="padding:0 6px 7px;display:flex;justify-content:space-between"><span>${levelLabels[lvl] || "Niveau " + lvl}</span></div>`;
    const body = document.createElement("div");
    body.className = "song-group";
    byLevel[lvl].forEach((s) => {
      const row = document.createElement("li");
      row.innerHTML = `<span>${s.title}</span><span class="difficulty">♩ ${s.difficulty}</span>`;
      row.addEventListener("click", () => openSong(s.id));
      body.appendChild(row);
    });
    group.appendChild(body);
    songListEl.appendChild(group);
  });
}
renderSongList();

function openSong(id) {
  currentSong = getSong(id);
  songIndex = 0;
  songActive = false;
  songTitleEl.textContent = currentSong.title;
  songListEl.hidden = true;
  songPlayerEl.hidden = false;
  updateSongView();
}

function closeSong() {
  currentSong = null;
  songActive = false;
  songListEl.hidden = false;
  songPlayerEl.hidden = true;
}

function updateSongView() {
  if (!currentSong) return;
  const midis = currentSong.notes.map(nameToMidi);
  const min = Math.min(...midis) - 2;
  const max = Math.max(...midis) + 2;
  songKb.setRange(Math.max(21, min), Math.min(108, max));
  songKb.clearHighlights();
  if (songIndex < midis.length) songKb.highlight(midis[songIndex], "target");
  songStaff.showSequence(midis, songIndex);
  songProgressEl.textContent = `${songIndex} / ${midis.length}`;
}

function onSongNote(info) {
  if (!songActive || !currentSong) return;
  const expected = nameToMidi(currentSong.notes[songIndex]);
  if (info.midi === expected) {
    songIndex++;
    if (songIndex >= currentSong.notes.length) {
      songActive = false;
      songStartBtn.textContent = "Opnieuw";
      songProgressEl.textContent = `✓ Klaar! "${currentSong.title}" uitgespeeld.`;
      songIndex = 0;
    }
    updateSongView();
  }
}

songBackBtn.addEventListener("click", closeSong);
songStartBtn.addEventListener("click", () => {
  if (!currentSong) return;
  songIndex = 0;
  songActive = true;
  songStartBtn.textContent = "Bezig…";
  updateSongView();
});

document.querySelector('#tabs button[data-tab="songs"]').addEventListener("click", () => {
  setListener(onSongNote);
});

// ---------- Tab: Bladmuziek ----------
const sheetFileInput = document.getElementById("sheet-file");
const sheetPlayBtn = document.getElementById("sheet-play");
const sheetResetBtn = document.getElementById("sheet-reset");
const sheetProgressEl = document.getElementById("sheet-progress");
const sheetInfoEl = document.getElementById("sheet-info");
const sheetKbEl = document.getElementById("sheet-keyboard");
const sheetDisplayEl = document.getElementById("sheet-display");

const sheetKb = new PianoKeyboard(sheetKbEl, RANGES.middle);
const sheetPlayer = new SheetPlayer(sheetDisplayEl, {
  onProgress: (idx, total) => {
    sheetProgressEl.textContent = total ? `${idx} / ${total}` : "—";
    // Highlight huidige noot op het keyboard
    sheetKb.clearHighlights();
    const midi = sheetPlayer.currentMidi();
    if (midi != null) {
      // Dynamisch bereik rondom huidige noot als het score-bereik groot is
      sheetKb.highlight(midi, "target");
    }
  },
});

sheetFileInput.addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  sheetInfoEl.textContent = `Laden: ${file.name}…`;
  try {
    await sheetPlayer.loadFile(file);
    // Pas keyboard-range aan op basis van noten in de partituur
    if (sheetPlayer.pitchRange) {
      const min = Math.max(21, sheetPlayer.pitchRange.min - 2);
      const max = Math.min(108, sheetPlayer.pitchRange.max + 2);
      sheetKb.setRange(min, max);
    }
    sheetInfoEl.textContent = `${file.name} — ${sheetPlayer.total} noten. Druk op "Speel mee" om te beginnen.`;
  } catch (err) {
    console.error(err);
    sheetInfoEl.textContent = "Fout bij laden: " + err.message;
  }
});

sheetPlayBtn.addEventListener("click", () => {
  if (sheetPlayer.total === 0) {
    sheetInfoEl.textContent = "Laad eerst een MusicXML-bestand.";
    return;
  }
  sheetPlayer.start();
});

sheetResetBtn.addEventListener("click", () => sheetPlayer.reset());

document.querySelector('#tabs button[data-tab="sheet"]').addEventListener("click", () => {
  setListener((info) => sheetPlayer.onNote(info));
});

// ---------- Tab: Lessen ----------
const lessonListEl = document.getElementById("lesson-list");
function renderLessons() {
  const progress = getProgress();
  lessonListEl.innerHTML = "";

  const allLessons = UNITS.flatMap((u) => u.lessons);
  const nextLessonId = allLessons.find((l) => !progress[l.id])?.id;

  UNITS.forEach((unit) => {
    const doneInUnit = unit.lessons.filter((l) => progress[l.id]).length;
    const totalInUnit = unit.lessons.length;
    const unitAllDone = doneInUnit === totalInUnit;
    const pct = Math.round((doneInUnit / totalInUnit) * 100);

    // Unit section container
    const section = document.createElement("div");
    section.className = "unit-section";

    // iOS section label (small caps, above the group)
    const labelEl = document.createElement("div");
    labelEl.className = "unit-section-label";
    labelEl.innerHTML = `<span>${unit.title}</span><span class="unit-section-pct">${pct}%</span>`;
    section.appendChild(labelEl);

    // Grouped body card
    const body = document.createElement("div");
    body.className = "unit-section-body";

    // Alle lessen + optionele review
    const review = buildUnitReview(unit);
    const allRows = [...unit.lessons, ...(review ? [review] : [])];

    allRows.forEach((l) => {
      const isReview = l === review;
      const isDone = !!progress[l.id];
      const isNext = l.id === nextLessonId;
      const isLocked = isReview && !unitAllDone;

      const row = document.createElement("div");
      row.className = "lesson-item";
      if (isDone) row.classList.add("done");
      if (isNext) row.classList.add("next-lesson");
      if (isLocked) row.classList.add("locked");

      // Icon
      let iconHtml;
      if (isDone) {
        iconHtml = `<span class="lesson-check">✓</span>`;
      } else if (isReview) {
        iconHtml = `<span class="lesson-star">★</span>`;
      } else if (isNext) {
        iconHtml = `<span class="lesson-dot-next"></span>`;
      } else {
        iconHtml = `<span class="lesson-dot"></span>`;
      }

      row.innerHTML = `
        <div class="lesson-item-icon">${iconHtml}</div>
        <div class="lesson-item-text">
          <div class="lesson-item-title">${l.title}</div>
          <div class="lesson-item-goal">${l.goal}</div>
        </div>
        <span class="lesson-item-chevron">›</span>`;

      row.addEventListener("click", () => {
        if (isLocked) return;
        startLesson(l);
      });

      body.appendChild(row);
    });

    section.appendChild(body);
    lessonListEl.appendChild(section);
  });
}
renderLessons();

// ---------- Dashboard ----------
const UNIT_RECOMMENDATIONS = {
  u1: [{ tool: "learn",     from: "practice", label: "Noot herkennen",   icon: "🎹" },
       { tool: "rhythm",    from: "practice", label: "Ritme",             icon: "🥁" }],
  u2: [{ tool: "sightread", from: "practice", label: "Bladlezen",        icon: "📄" },
       { tool: "learn",     from: "practice", label: "Noten op de balk", icon: "🎹" }],
  u3: [{ tool: "learn",     from: "practice", label: "Bas-sleutel",      icon: "🎹" },
       { tool: "technique", from: "practice", label: "LH-akkoorden",     icon: "🏋️" }],
  u4: [{ tool: "learn",     from: "practice", label: "Zwarte toetsen",   icon: "🎹" },
       { tool: "circle",    from: "tools",    label: "Kwintencirkel",    icon: "⭕" }],
  u5: [{ tool: "technique", from: "practice", label: "Toonladders",      icon: "🏋️" },
       { tool: "transpose", from: "tools",    label: "Transpositie",     icon: "🎚️" }],
  u6: [{ tool: "ear",       from: "practice", label: "Gehoor",           icon: "👂" },
       { tool: "duet",      from: "practice", label: "Duet-modus",       icon: "🤝" }],
  u7: [{ tool: "ear",       from: "practice", label: "Intervallen",      icon: "👂" },
       { tool: "chords",    from: "practice", label: "Lead Sheet",       icon: "🎼" }],
  u8: [{ tool: "sightread", from: "practice", label: "Bladlezen",        icon: "📄" },
       { tool: "inversions",from: "tools",    label: "Omkeringen",       icon: "🔄" }],
  u9: [{ tool: "technique", from: "practice", label: "Chromatisch",      icon: "🏋️" },
       { tool: "theory",    from: "tools",    label: "Theorie",          icon: "📐" }],
};

function renderDashboard() {
  const progress = getProgress();
  const allLessons = UNITS.flatMap((u) => u.lessons);
  const doneCount = allLessons.filter((l) => progress[l.id]).length;
  const totalCount = allLessons.length;

  // Progress bar
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  document.getElementById("dash-bar-fill").style.width = pct + "%";
  document.getElementById("dash-count").textContent = `${doneCount} van de ${totalCount} lessen voltooid`;

  // Volgende les
  const nextLesson = allLessons.find((l) => !progress[l.id]);
  const dashNext = document.getElementById("dash-next");
  if (nextLesson) {
    dashNext.hidden = false;
    dashNext.innerHTML = `
      <div>
        <p class="dash-next-title">Volgende les</p>
        <p class="dash-next-lesson">${nextLesson.title}</p>
      </div>
      <span class="dash-next-arrow">›</span>`;
    dashNext.onclick = () => {
      switchToMain("lessons");
      startLesson(nextLesson);
    };
  } else {
    dashNext.hidden = true;
  }

  // Aanbevolen oefeningen op basis van huidige unit
  const currentUnit = UNITS.find((u) => u.lessons.some((l) => !progress[l.id])) || UNITS[UNITS.length - 1];
  const recs = UNIT_RECOMMENDATIONS[currentUnit.id] || UNIT_RECOMMENDATIONS.u1;
  const recsEl = document.getElementById("dash-recs");
  recsEl.innerHTML = recs.map((r) => `
    <div class="tool-card" data-tool="${r.tool}" data-from="${r.from}">
      <span class="tool-card-icon">${r.icon}</span>
      <span class="tool-card-name">${r.label}</span>
    </div>`).join("");
  recsEl.querySelectorAll(".tool-card").forEach((card) => {
    card.addEventListener("click", () => {
      const TOOL_LABELS = {
        learn: "Noot leren", technique: "Techniek", ear: "Gehoor",
        sightread: "Bladlezen", rhythm: "Ritme", dictee: "Dictee",
        chords: "Lead Sheet", duet: "Duet", metro: "Metronoom",
        theory: "Theorie", circle: "Kwintencirkel", inversions: "Omkeringen",
        transpose: "Transpositie", styles: "Stijlen", sheet: "Bladmuziek",
      };
      openTool(card.dataset.tool, card.dataset.from, TOOL_LABELS[card.dataset.tool] || card.dataset.tool);
    });
  });
}

// Initieel dashboard renderen
renderDashboard();

function startLesson(lesson) {
  if (lesson.drill.type === "song") {
    // Schakel naar songs-tab en open het betreffende liedje
    switchToMain("lessons");
    document.querySelectorAll(".lessons-sub-btn").forEach((b) => b.classList.toggle("active", b.dataset.sub === "songs"));
    document.querySelector('#tabs button[data-tab="songs"]').click();
    openSong(lesson.drill.songId);
    // Automatisch markeren als gedaan zodra liedje wordt uitgespeeld — simpel: markeer bij start.
    markDone(lesson.id);
  } else {
    // Noten-oefening: gebruik de learn-tab met een gefixeerde set
    openTool("learn", "lessons", "Noot leren");
    const midis = lesson.drill.notes.map(nameToMidi);
    const min = Math.max(21, Math.min(...midis) - 2);
    const max = Math.min(108, Math.max(...midis) + 2);
    learnKb.setRange(min, max);
    // sequence → exacte volgorde; notes → willekeurige volgorde
    let idx = 0;
    const order = lesson.drill.type === "sequence"
      ? [...midis]
      : [...midis].sort(() => Math.random() - 0.5);
    const runNext = () => {
      if (idx >= order.length) {
        markDone(lesson.id);
        renderLessons();
        showLessonComplete(lesson);
        // terug naar standaard learn-modus
        setListener(onLearnNote);
        pickNote();
        return;
      }
      targetMidi = order[idx];
      learnKb.clearHighlights();
      learnKb.highlight(targetMidi, "target");
      learnStaff.showNote(targetMidi);
    };
    setListener((info) => {
      if (info.midi === order[idx]) {
        learnKb.highlight(order[idx], "correct");
        idx++;
        setTimeout(runNext, 500);
      } else {
        learnKb.highlight(info.midi, "wrong");
        setTimeout(() => learnKb.unhighlight(info.midi), 400);
      }
    });
    runNext();
  }
}

// ---------- Les voltooid overlay ----------
function showLessonComplete(lesson) {
  const progress = getProgress();
  const currentUnit = UNITS.find((u) => u.lessons.some((l) => l.id === lesson.id));
  const recs = (currentUnit && UNIT_RECOMMENDATIONS[currentUnit.id]) || UNIT_RECOMMENDATIONS.u1;

  document.getElementById("lc-title").textContent = lesson.title;
  document.getElementById("lc-goal").textContent = lesson.goal;

  const recsEl = document.getElementById("lc-recs");
  recsEl.innerHTML = recs.map((r) => `
    <div class="tool-card lc-tool-card" data-tool="${r.tool}" data-from="${r.from}">
      <span class="tool-card-icon">${r.icon}</span>
      <span class="tool-card-name">${r.label}</span>
    </div>`).join("");

  const overlay = document.getElementById("lesson-overlay");
  overlay.hidden = false;

  recsEl.querySelectorAll(".lc-tool-card").forEach((card) => {
    card.addEventListener("click", () => {
      overlay.hidden = true;
      const TOOL_LABELS = {
        learn: "Noot leren", technique: "Techniek", ear: "Gehoor",
        sightread: "Bladlezen", rhythm: "Ritme", dictee: "Dictee",
        chords: "Lead Sheet", duet: "Duet", metro: "Metronoom",
        theory: "Theorie", circle: "Kwintencirkel", inversions: "Omkeringen",
        transpose: "Transpositie", styles: "Stijlen", sheet: "Bladmuziek",
      };
      openTool(card.dataset.tool, card.dataset.from, TOOL_LABELS[card.dataset.tool] || card.dataset.tool);
    });
  });

  document.getElementById("lc-back").onclick = () => {
    overlay.hidden = true;
    switchToMain("lessons");
  };
}

// ===========================================================================
// Tab: Techniek (toonladders, arpeggio's, Hanon)
// ===========================================================================
const techSelect = document.getElementById("tech-select");
const techHandSel = document.getElementById("tech-hand");
const techName = document.getElementById("tech-name");
const techDesc = document.getElementById("tech-desc");
const techStaffEl = document.getElementById("tech-staff");
const techKbEl = document.getElementById("tech-keyboard");
const techStartBtn = document.getElementById("tech-start");
const techDemoBtn = document.getElementById("tech-play-demo");
const techMetroBtn = document.getElementById("tech-metro-toggle");
const techBpmSlider = document.getElementById("tech-bpm");
const techBpmVal = document.getElementById("tech-bpm-val");
const techProgressEl = document.getElementById("tech-progress");

const techStaff = new Staff(techStaffEl, { width: 600 });
const techKb = new PianoKeyboard(techKbEl, { min: nameToMidi("C3"), max: nameToMidi("C6") });
const techMetro = new Metronome();

let currentTechnique = null;
let techActive = false;
let techIdx = 0;
let techSequence = [];
let techFingers = [];

// Vul dropdown met alle technique-items gegroepeerd
function populateTechSelect() {
  techSelect.innerHTML = "";
  ALL_TECHNIQUE.forEach((group) => {
    const optGroup = document.createElement("optgroup");
    optGroup.label = group.category;
    group.items.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.name;
      optGroup.appendChild(opt);
    });
    techSelect.appendChild(optGroup);
  });
}
populateTechSelect();

function loadTechnique(id) {
  const item = findTechnique(id);
  if (!item) return;
  currentTechnique = item;
  techActive = false;
  techIdx = 0;
  techName.textContent = item.name;
  techDesc.textContent = item.description || "";

  const midis = item.notes.map(nameToMidi);
  const hand = techHandSel.value;

  // "both" → eerst LH dan RH achter elkaar
  if (hand === "both") {
    techSequence = [...midis, ...midis];
    techFingers = [...item.lhFingers, ...item.rhFingers];
  } else if (hand === "lh") {
    techSequence = midis;
    techFingers = item.lhFingers;
  } else {
    techSequence = midis;
    techFingers = item.rhFingers;
  }

  // Bereik aanpassen
  const min = Math.max(21, Math.min(...midis) - 2);
  const max = Math.min(108, Math.max(...midis) + 2);
  techKb.setRange(min, max);

  showTechniqueAt(0);
  techProgressEl.textContent = `0 / ${techSequence.length}`;
}

function showTechniqueAt(idx) {
  // Hele sequence op de balk, huidige noot rood
  techStaff.showSequence(techSequence, idx);
  // Alleen de huidige noot op het keyboard highlighten
  techKb.clearHighlights();
  techKb.clearFingerings();
  if (idx < techSequence.length) {
    const midi = techSequence[idx];
    techKb.highlight(midi, "target");
    techKb.setFingerings({ [midi]: techFingers[idx] });
  }
}

techSelect.addEventListener("change", () => loadTechnique(techSelect.value));
techHandSel.addEventListener("change", () => currentTechnique && loadTechnique(currentTechnique.id));

techDemoBtn.addEventListener("click", () => {
  if (!currentTechnique) return;
  // Speel de hele sequence af via synth als voorbeeld
  synth.playMelodic(techSequence, { gap: 60 / techMetro.bpm, duration: 0.5 });
});

techStartBtn.addEventListener("click", () => {
  if (!currentTechnique) return;
  techActive = true;
  techIdx = 0;
  showTechniqueAt(0);
  techProgressEl.textContent = `0 / ${techSequence.length}`;
  openTool("technique", "practice", "Techniek");
});

function onTechniqueNote(info) {
  if (!techActive) return;
  const expected = techSequence[techIdx];
  if (info.midi === expected) {
    techKb.highlight(expected, "correct");
    techIdx++;
    setTimeout(() => {
      if (techIdx >= techSequence.length) {
        techActive = false;
        techProgressEl.textContent = `✓ voltooid!`;
      } else {
        showTechniqueAt(techIdx);
        techProgressEl.textContent = `${techIdx} / ${techSequence.length}`;
      }
    }, 250);
  }
}

techMetroBtn.addEventListener("click", () => {
  techMetro.toggle();
  techMetroBtn.textContent = techMetro.running ? "⏸ Stop metronoom" : "🥁 Metronoom";
});

techBpmSlider.addEventListener("input", () => {
  const bpm = parseInt(techBpmSlider.value, 10);
  techBpmVal.textContent = bpm;
  techMetro.setBpm(bpm);
});

document.querySelector('#tabs button[data-tab="technique"]').addEventListener("click", () => {
  setListener(onTechniqueNote);
  if (!currentTechnique) loadTechnique(ALL_TECHNIQUE[0].items[0].id);
});

// Laad standaard eerste toonladder zodat de tab niet leeg is
loadTechnique(ALL_TECHNIQUE[0].items[0].id);

// ===========================================================================
// Tab: Gehoor (ear training)
// ===========================================================================
const intervalTrainer = new IntervalTrainer();
const chordTrainer = new ChordTrainer();

// Mode switch
document.querySelectorAll(".ear-mode-switch button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".ear-mode-switch button").forEach((b) => b.classList.toggle("active", b === btn));
    const mode = btn.dataset.earMode;
    document.getElementById("ear-interval").hidden = mode !== "interval";
    document.getElementById("ear-chord").hidden = mode !== "chord";
  });
});

// --- Intervallen ---
const earPlayBtn = document.getElementById("ear-play");
const earNextBtn = document.getElementById("ear-next");
const earOptionsEl = document.getElementById("ear-options");
const earFeedbackEl = document.getElementById("ear-feedback");
const earScoreEl = document.getElementById("ear-score");
const earLevelSel = document.getElementById("ear-level");
const earPlayModeSel = document.getElementById("ear-play-mode");

function renderIntervalOptions() {
  earOptionsEl.innerHTML = "";
  intervalTrainer.optionsForLevel().forEach((iv) => {
    const btn = document.createElement("button");
    btn.className = "ear-option";
    btn.textContent = iv.name;
    btn.addEventListener("click", () => {
      const result = intervalTrainer.answer(iv.semitones);
      if (!result) return;
      earScoreEl.textContent = `${intervalTrainer.score.correct} / ${intervalTrainer.score.total}`;
      if (result.correct) {
        earFeedbackEl.textContent = `✓ Correct! ${result.expected.name}`;
        earFeedbackEl.className = "ear-feedback correct";
        setTimeout(() => nextInterval(), 1200);
      } else {
        earFeedbackEl.textContent = `✗ Fout — het was een ${result.expected.name}. Luister nog eens.`;
        earFeedbackEl.className = "ear-feedback wrong";
      }
    });
    earOptionsEl.appendChild(btn);
  });
}

function nextInterval() {
  intervalTrainer.nextQuestion();
  earFeedbackEl.textContent = "Luister en kies het interval.";
  earFeedbackEl.className = "ear-feedback";
  renderIntervalOptions();
  intervalTrainer.play();
}

earPlayBtn.addEventListener("click", () => {
  if (!intervalTrainer.current) nextInterval();
  else intervalTrainer.play();
});
earNextBtn.addEventListener("click", nextInterval);
earLevelSel.addEventListener("change", () => {
  intervalTrainer.setLevel(earLevelSel.value);
  nextInterval();
});
earPlayModeSel.addEventListener("change", () => {
  intervalTrainer.setMode(earPlayModeSel.value);
});
renderIntervalOptions();

// --- Akkoord-kwaliteit ---
const earChordPlayBtn = document.getElementById("ear-chord-play");
const earChordNextBtn = document.getElementById("ear-chord-next");
const earChordOptionsEl = document.getElementById("ear-chord-options");
const earChordFeedbackEl = document.getElementById("ear-chord-feedback");
const earChordScoreEl = document.getElementById("ear-chord-score");
const earChordLevelSel = document.getElementById("ear-chord-level");

function renderChordOptions() {
  earChordOptionsEl.innerHTML = "";
  chordTrainer.optionsForLevel().forEach((q) => {
    const btn = document.createElement("button");
    btn.className = "ear-option";
    btn.textContent = q.name;
    btn.addEventListener("click", () => {
      const result = chordTrainer.answer(q.short);
      if (!result) return;
      earChordScoreEl.textContent = `${chordTrainer.score.correct} / ${chordTrainer.score.total}`;
      if (result.correct) {
        earChordFeedbackEl.textContent = `✓ Correct! ${result.expected.name}`;
        earChordFeedbackEl.className = "ear-feedback correct";
        setTimeout(() => nextChord(), 1200);
      } else {
        earChordFeedbackEl.textContent = `✗ Fout — het was ${result.expected.name}.`;
        earChordFeedbackEl.className = "ear-feedback wrong";
      }
    });
    earChordOptionsEl.appendChild(btn);
  });
}

function nextChord() {
  chordTrainer.nextQuestion();
  earChordFeedbackEl.textContent = "Luister en kies de kwaliteit.";
  earChordFeedbackEl.className = "ear-feedback";
  renderChordOptions();
  chordTrainer.play();
}

earChordPlayBtn.addEventListener("click", () => {
  if (!chordTrainer.current) nextChord();
  else chordTrainer.play();
});
earChordNextBtn.addEventListener("click", nextChord);
earChordLevelSel.addEventListener("change", () => {
  chordTrainer.setLevel(earChordLevelSel.value);
  nextChord();
});
renderChordOptions();

// ===========================================================================
// Tab: Metronoom
// ===========================================================================
const metroBeatsEl = document.getElementById("metro-beats");
const metroBpmBig = document.getElementById("metro-bpm-big");
const metroBpmSlider = document.getElementById("metro-bpm");
const metroBpmVal = document.getElementById("metro-bpm-val");
const metroToggleBtn = document.getElementById("metro-toggle");
const metroMeterSel = document.getElementById("metro-meter");
const metroPresetSel = document.getElementById("metro-preset");

const mainMetro = new Metronome({
  onBeat: (beat, accent) => {
    const dots = metroBeatsEl.querySelectorAll(".beat-dot");
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === beat);
      d.classList.toggle("accent", i === beat && accent);
    });
  },
});

function renderMetroBeats() {
  metroBeatsEl.innerHTML = "";
  for (let i = 0; i < mainMetro.beatsPerMeasure; i++) {
    const dot = document.createElement("div");
    dot.className = "beat-dot";
    if (i === 0) dot.classList.add("first");
    metroBeatsEl.appendChild(dot);
  }
}
renderMetroBeats();

metroToggleBtn.addEventListener("click", () => {
  mainMetro.toggle();
  metroToggleBtn.textContent = mainMetro.running ? "⏸ Stop" : "▶ Start";
});

metroBpmSlider.addEventListener("input", () => {
  const bpm = parseInt(metroBpmSlider.value, 10);
  metroBpmVal.textContent = bpm;
  metroBpmBig.textContent = bpm;
  mainMetro.setBpm(bpm);
});

metroMeterSel.addEventListener("change", () => {
  mainMetro.setMeter(parseInt(metroMeterSel.value, 10));
  renderMetroBeats();
});

metroPresetSel.addEventListener("change", () => {
  const bpm = parseInt(metroPresetSel.value, 10);
  metroBpmSlider.value = bpm;
  metroBpmVal.textContent = bpm;
  metroBpmBig.textContent = bpm;
  mainMetro.setBpm(bpm);
});

// ===========================================================================
// Tab: Theorie (akkoord-progressies + quiz)
// ===========================================================================
const theoryProgSelect = document.getElementById("theory-prog-select");
const theoryKeySelect = document.getElementById("theory-key-select");
const theoryProgPlayBtn = document.getElementById("theory-prog-play");
const theoryProgNameEl = document.getElementById("theory-prog-name");
const theoryProgDescEl = document.getElementById("theory-prog-desc");
const theoryProgChordsEl = document.getElementById("theory-prog-chords");
const theoryKbEl = document.getElementById("theory-keyboard");
const theoryKb = new PianoKeyboard(theoryKbEl, { min: nameToMidi("C3"), max: nameToMidi("C6") });

// Vul dropdowns
PROGRESSIONS.forEach((p) => {
  const opt = document.createElement("option");
  opt.value = p.id;
  opt.textContent = p.name;
  theoryProgSelect.appendChild(opt);
});
KEYS.forEach((k) => {
  const opt = document.createElement("option");
  opt.value = k.name;
  opt.textContent = k.name + " majeur";
  theoryKeySelect.appendChild(opt);
});

let currentProgression = PROGRESSIONS[0];
let currentProgKey = "C";
let currentProgChords = [];

function renderProgressionView() {
  const rendered = renderProgression(currentProgKey, currentProgression);
  currentProgChords = rendered;
  theoryProgNameEl.textContent = `${currentProgression.label} — ${currentProgKey} majeur`;
  theoryProgDescEl.textContent = currentProgression.description;

  theoryProgChordsEl.innerHTML = "";
  rendered.forEach((chord, idx) => {
    const chip = document.createElement("button");
    chip.className = "chord-chip";
    chip.dataset.idx = idx;
    chip.innerHTML = `<strong>${chord.roman}</strong>`;
    chip.addEventListener("click", () => {
      highlightChord(idx);
      synth.playChord(chord.midis, { duration: 1.0 });
    });
    theoryProgChordsEl.appendChild(chip);
  });

  theoryKb.clearHighlights();
}

function highlightChord(idx) {
  theoryKb.clearHighlights();
  const chord = currentProgChords[idx];
  if (!chord) return;
  chord.midis.forEach((m) => theoryKb.highlight(m, "target"));
  // markeer actieve chip
  theoryProgChordsEl.querySelectorAll(".chord-chip").forEach((c) => {
    c.classList.toggle("active", parseInt(c.dataset.idx, 10) === idx);
  });
}

async function playProgression() {
  if (!currentProgChords.length) return;
  const beatMs = 650;
  for (let i = 0; i < currentProgChords.length; i++) {
    highlightChord(i);
    synth.playChord(currentProgChords[i].midis, { duration: beatMs / 1000 });
    await new Promise((r) => setTimeout(r, beatMs));
  }
  setTimeout(() => {
    theoryKb.clearHighlights();
    theoryProgChordsEl.querySelectorAll(".chord-chip").forEach((c) => c.classList.remove("active"));
  }, 400);
}

theoryProgSelect.addEventListener("change", () => {
  currentProgression = PROGRESSIONS.find((p) => p.id === theoryProgSelect.value) || PROGRESSIONS[0];
  renderProgressionView();
});
theoryKeySelect.addEventListener("change", () => {
  currentProgKey = theoryKeySelect.value;
  renderProgressionView();
});
theoryProgPlayBtn.addEventListener("click", playProgression);

renderProgressionView();

// --- Theorie-modus switch ---
document.querySelectorAll("#tab-theory [data-theory-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#tab-theory [data-theory-mode]").forEach((b) =>
      b.classList.toggle("active", b === btn),
    );
    const mode = btn.dataset.theoryMode;
    document.getElementById("theory-progressions").hidden = mode !== "progressions";
    document.getElementById("theory-quiz").hidden = mode !== "quiz";
  });
});

// --- Quiz ---
const quizQuestionEl = document.getElementById("quiz-question");
const quizOptionsEl = document.getElementById("quiz-options");
const quizFeedbackEl = document.getElementById("quiz-feedback");
const quizNextBtn = document.getElementById("quiz-next");
const quizScoreEl = document.getElementById("quiz-score");

let currentQuiz = null;
let quizScore = { correct: 0, total: 0 };
let quizAnswered = false;

function nextQuizQuestion() {
  currentQuiz = pickRandomQuestion();
  quizAnswered = false;
  quizQuestionEl.textContent = currentQuiz.question;
  quizFeedbackEl.textContent = "—";
  quizFeedbackEl.className = "ear-feedback";
  quizOptionsEl.innerHTML = "";
  currentQuiz.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "ear-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => onQuizAnswer(opt, btn));
    quizOptionsEl.appendChild(btn);
  });
}

function onQuizAnswer(opt, btn) {
  if (quizAnswered) return;
  quizAnswered = true;
  quizScore.total++;
  const correct = opt === currentQuiz.answer;
  if (correct) {
    quizScore.correct++;
    btn.classList.add("correct");
    quizFeedbackEl.textContent = `✓ Correct! ${currentQuiz.explanation}`;
    quizFeedbackEl.className = "ear-feedback correct";
  } else {
    btn.classList.add("wrong");
    quizFeedbackEl.textContent = `✗ Fout — het juiste antwoord is ${currentQuiz.answer}. ${currentQuiz.explanation}`;
    quizFeedbackEl.className = "ear-feedback wrong";
    // markeer het juiste antwoord
    quizOptionsEl.querySelectorAll("button").forEach((b) => {
      if (b.textContent === currentQuiz.answer) b.classList.add("correct");
    });
  }
  quizScoreEl.textContent = `${quizScore.correct} / ${quizScore.total}`;
}

quizNextBtn.addEventListener("click", nextQuizQuestion);
nextQuizQuestion();

// ===========================================================================
// Tab: Bladlezen (sight-reading)
// ===========================================================================
const srKeySel = document.getElementById("sr-key");
const srLevelSel = document.getElementById("sr-level");
const srBpmSlider = document.getElementById("sr-bpm");
const srBpmVal = document.getElementById("sr-bpm-val");
const srStaffEl = document.getElementById("sr-staff");
const srKbEl = document.getElementById("sr-keyboard");
const srNewBtn = document.getElementById("sr-new");
const srStartBtn = document.getElementById("sr-start");
const srDemoBtn = document.getElementById("sr-demo");
const srProgressEl = document.getElementById("sr-progress");

const srStaff = new Staff(srStaffEl, { width: 700 });
const srKb = new PianoKeyboard(srKbEl, { min: nameToMidi("C3"), max: nameToMidi("C6") });
const srMetro = new Metronome();

// Vul dropdowns
KEYS.forEach((k) => {
  const opt = document.createElement("option");
  opt.value = k.name;
  opt.textContent = k.name + " majeur";
  srKeySel.appendChild(opt);
});
SIGHTREAD_LEVELS.forEach((l) => {
  const opt = document.createElement("option");
  opt.value = l.id;
  opt.textContent = l.name;
  srLevelSel.appendChild(opt);
});

let srPhrase = [];
let srIdx = 0;
let srActive = false;
let srStartedAt = 0;
let srErrors = 0;

function srRenderPhrase() {
  srPhrase = genPhrase(srKeySel.value, srLevelSel.value);
  srIdx = 0;
  srActive = false;
  srErrors = 0;
  const min = Math.max(21, Math.min(...srPhrase) - 2);
  const max = Math.min(108, Math.max(...srPhrase) + 2);
  srKb.setRange(min, max);
  srKb.clearHighlights();
  srStaff.showSequence(srPhrase, -1); // -1 = geen highlight, toont hele frase
  srProgressEl.textContent = `0 / ${srPhrase.length}`;
  srStartBtn.textContent = "▶ Start (met klik)";
}

function srShowCurrent() {
  srKb.clearHighlights();
  srStaff.showSequence(srPhrase, srIdx);
  if (srIdx < srPhrase.length) srKb.highlight(srPhrase[srIdx], "target");
}

function srStart() {
  if (!srPhrase.length) return;
  srActive = true;
  srIdx = 0;
  srErrors = 0;
  srStartedAt = performance.now();
  srMetro.setBpm(parseInt(srBpmSlider.value, 10));
  srShowCurrent();
  srProgressEl.textContent = `0 / ${srPhrase.length}`;
  srStartBtn.textContent = "⏸ Bezig…";
  // Kleine telaf: 1 maat klik
  srMetro.start();
}

function srStop() {
  srActive = false;
  srMetro.stop();
  srStartBtn.textContent = "▶ Start (met klik)";
}

function onSightreadNote(info) {
  if (!srActive) return;
  const expected = srPhrase[srIdx];
  if (info.midi === expected) {
    srKb.highlight(expected, "correct");
    srIdx++;
    if (srIdx >= srPhrase.length) {
      srStop();
      const secs = ((performance.now() - srStartedAt) / 1000).toFixed(1);
      srProgressEl.textContent = `✓ ${srPhrase.length} / ${srPhrase.length} in ${secs}s (${srErrors} fout)`;
      return;
    }
    setTimeout(srShowCurrent, 150);
    srProgressEl.textContent = `${srIdx} / ${srPhrase.length}`;
  } else {
    srErrors++;
    srKb.highlight(info.midi, "wrong");
    setTimeout(() => srKb.unhighlight(info.midi), 350);
  }
}

srNewBtn.addEventListener("click", srRenderPhrase);
srStartBtn.addEventListener("click", () => {
  if (srActive) srStop();
  else srStart();
});
srDemoBtn.addEventListener("click", () => {
  if (!srPhrase.length) return;
  const bpm = parseInt(srBpmSlider.value, 10);
  synth.playMelodic(srPhrase, { gap: 60 / bpm, duration: 0.5 });
});
srKeySel.addEventListener("change", srRenderPhrase);
srLevelSel.addEventListener("change", srRenderPhrase);
srBpmSlider.addEventListener("input", () => {
  const bpm = parseInt(srBpmSlider.value, 10);
  srBpmVal.textContent = bpm;
  srMetro.setBpm(bpm);
});

document.querySelector('#tabs button[data-tab="sightread"]').addEventListener("click", () => {
  setListener(onSightreadNote);
  if (!srPhrase.length) srRenderPhrase();
});

srRenderPhrase();

// ===========================================================================
// Tab: Ritme-trainer
// ===========================================================================
const rhySelect     = document.getElementById("rhy-select");
const rhyBpmSlider  = document.getElementById("rhy-bpm");
const rhyBpmVal     = document.getElementById("rhy-bpm-val");
const rhyMeasuresSel= document.getElementById("rhy-measures");
const rhyDescEl     = document.getElementById("rhy-desc");
const rhyGridEl     = document.getElementById("rhy-grid");
const rhyTapBtn     = document.getElementById("rhy-tap");
const rhyStartBtn   = document.getElementById("rhy-start");
const rhyStopBtn    = document.getElementById("rhy-stop");
const rhyDemoBtn    = document.getElementById("rhy-demo");
const rhyScoreEl    = document.getElementById("rhy-score");
const rhyFeedbackEl = document.getElementById("rhy-feedback");

const grouped = groupedPatterns();
Object.entries(grouped).forEach(([cat, items]) => {
  const og = document.createElement("optgroup");
  og.label = cat;
  items.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    og.appendChild(opt);
  });
  rhySelect.appendChild(og);
});

const rhyMetro = new Metronome();
let rhyPattern = findPattern("quarters");
let rhyRunning = false;
let rhyTaps = [];
let rhyExpected = [];
let rhyTotalMeasures = 4;

function rhyLoadPattern() {
  rhyPattern = findPattern(rhySelect.value);
  rhyDescEl.textContent = rhyPattern.description;
  rhyRenderGrid();
  rhyScoreEl.textContent = "—";
  rhyFeedbackEl.innerHTML = "";
}

function rhyRenderGrid(highlights = []) {
  rhyGridEl.innerHTML = "";
  const units = rhyPattern.unitsPerMeasure || 16;
  for (let m = 0; m < rhyTotalMeasures; m++) {
    const row = document.createElement("div");
    row.className = "rhythm-row";
    for (let u = 0; u < units; u++) {
      const cell = document.createElement("div");
      const beatIdxInMeasure = rhyPattern.beats.indexOf(u);
      const isBeat = beatIdxInMeasure >= 0;
      cell.className = "rhythm-cell" + (isBeat ? " beat" : "");
      if (isBeat) {
        const absIdx = m * rhyPattern.beats.length + beatIdxInMeasure;
        const h = highlights[absIdx];
        if (h === "ok") cell.classList.add("ok");
        else if (h === "miss") cell.classList.add("miss");
      }
      row.appendChild(cell);
    }
    rhyGridEl.appendChild(row);
  }
}

function rhyStart() {
  rhyTaps = [];
  rhyFeedbackEl.innerHTML = "";
  rhyScoreEl.textContent = "Tikken…";
  rhyRunning = true;
  const bpm = parseInt(rhyBpmSlider.value, 10);
  rhyMetro.setBpm(bpm);
  rhyMetro.setMeter(rhyPattern.meter);
  rhyExpected = patternToTimes(rhyPattern, bpm, 200, rhyTotalMeasures);
  const totalMs = rhyExpected[rhyExpected.length - 1] + 600;
  rhyMetro.start();
  rhyStartBtn.disabled = true;
  rhyStopBtn.disabled = false;
  setTimeout(() => rhyFinish(), totalMs);
}

function rhyStop() {
  rhyRunning = false;
  rhyMetro.stop();
  rhyStartBtn.disabled = false;
  rhyStopBtn.disabled = true;
}

function rhyFinish() {
  rhyStop();
  const results = analyzeTaps(rhyExpected, rhyTaps);
  const correct = results.filter((r) => r.ok).length;
  const total = results.length;
  rhyScoreEl.textContent = `${correct} / ${total} op tijd`;
  const highlights = results.map((r) => (r.ok ? "ok" : "miss"));
  rhyRenderGrid(highlights);
  const diffs = results.filter((r) => r.diffMs != null).map((r) => Math.abs(r.diffMs));
  if (diffs.length) {
    const avg = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
    const pct = Math.round((correct / total) * 100);
    let msg = `Gemiddelde afwijking: <strong>${avg} ms</strong> — ${pct}% op tijd.`;
    if (pct === 100) msg += " 🎯 Perfect!";
    else if (pct >= 80) msg += " Goed bezig!";
    else if (pct >= 60) msg += " Oefenen maar — probeer de metronoom innerlijk te voelen.";
    else msg += " Langzamer beginnen helpt. Zet het BPM lager.";
    rhyFeedbackEl.innerHTML = msg;
  } else {
    rhyFeedbackEl.textContent = "Geen taps geregistreerd — tik op TIK of gebruik spatiebalk.";
  }
}

function rhyTap() {
  if (!rhyRunning) return;
  rhyTaps.push(performance.now());
  rhyTapBtn.classList.add("tapped");
  setTimeout(() => rhyTapBtn.classList.remove("tapped"), 80);
}

rhyTapBtn.addEventListener("click", rhyTap);
rhySelect.addEventListener("change", rhyLoadPattern);
rhyBpmSlider.addEventListener("input", () => {
  rhyBpmVal.textContent = rhyBpmSlider.value;
  rhyMetro.setBpm(parseInt(rhyBpmSlider.value, 10));
});
rhyMeasuresSel.addEventListener("change", () => {
  rhyTotalMeasures = parseInt(rhyMeasuresSel.value, 10);
  rhyRenderGrid();
});
rhyStartBtn.addEventListener("click", rhyStart);
rhyStopBtn.addEventListener("click", rhyStop);
rhyDemoBtn.addEventListener("click", () => {
  const bpm = parseInt(rhyBpmSlider.value, 10);
  const times = patternToTimes(rhyPattern, bpm, 0, 1);
  times.forEach((t) => setTimeout(() => synth.click(0.4), t));
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && document.querySelector("#tab-rhythm.active")) {
    e.preventDefault();
    rhyTap();
  }
});

document.querySelector('#tabs button[data-tab="rhythm"]').addEventListener("click", rhyLoadPattern);
rhyLoadPattern();
rhyStopBtn.disabled = true;

// ===========================================================================
// Tab: Melodie-dictee
// ===========================================================================
const dicKeySel     = document.getElementById("dic-key");
const dicLevelSel   = document.getElementById("dic-level");
const dicBpmSlider  = document.getElementById("dic-bpm");
const dicBpmVal     = document.getElementById("dic-bpm-val");
const dicKbEl       = document.getElementById("dic-keyboard");
const dicPlayBtn    = document.getElementById("dic-play");
const dicHintEl     = document.getElementById("dic-hint");
const dicFeedbackEl = document.getElementById("dic-feedback");
const dicNewBtn     = document.getElementById("dic-new");
const dicRevealBtn  = document.getElementById("dic-reveal");
const dicScoreEl    = document.getElementById("dic-score");
const dicRevealEl   = document.getElementById("dic-notes-reveal");

const dicKb = new PianoKeyboard(dicKbEl, { min: nameToMidi("C3"), max: nameToMidi("C6") });

KEYS.forEach((k) => {
  const opt = document.createElement("option");
  opt.value = k.name;
  opt.textContent = k.name + " majeur";
  dicKeySel.appendChild(opt);
});
DICTEE_LEVELS.forEach((l) => {
  const opt = document.createElement("option");
  opt.value = l.id;
  opt.textContent = l.name;
  dicLevelSel.appendChild(opt);
});
dicLevelSel.value = "easy";

let dicFrase = [];
let dicIdx = 0;
let dicActive = false;
let dicPlaysLeft = 0;
let dicScore = { correct: 0, total: 0 };

function dicNewFrase() {
  dicFrase = genDicteeFrase(dicKeySel.value, dicLevelSel.value);
  dicIdx = 0;
  dicActive = false;
  const level = findDicteeLevel(dicLevelSel.value);
  dicPlaysLeft = level.playCount;
  dicRevealEl.hidden = true;
  dicRevealEl.textContent = "";
  dicFeedbackEl.textContent = "—";
  dicFeedbackEl.className = "ear-feedback";
  dicPlayBtn.disabled = false;
  dicHintEl.textContent = `Luister goed — je mag de frase ${dicPlaysLeft}× afspelen. Speel hem daarna na op de piano.`;
  const min = Math.max(21, Math.min(...dicFrase) - 2);
  const max = Math.min(108, Math.max(...dicFrase) + 2);
  dicKb.setRange(min, max);
  dicKb.clearHighlights();
}

async function dicPlay() {
  if (!dicFrase.length || dicPlaysLeft <= 0) return;
  dicPlaysLeft--;
  dicPlayBtn.disabled = true;
  dicHintEl.textContent = dicPlaysLeft > 0
    ? `Nog ${dicPlaysLeft}× opnieuw te beluisteren. Speel nu na!`
    : "Laatste keer gehoord — speel nu na op de piano!";
  const bpm = parseInt(dicBpmSlider.value, 10);
  await playDicteeFrase(dicFrase, bpm);
  dicActive = true;
  dicPlayBtn.disabled = dicPlaysLeft <= 0;
}

function onDicteeNote(info) {
  if (!dicActive || !dicFrase.length) return;
  const expected = dicFrase[dicIdx];
  if (info.midi === expected) {
    dicKb.highlight(expected, "correct");
    dicIdx++;
    if (dicIdx >= dicFrase.length) {
      dicActive = false;
      dicScore.correct++;
      dicScore.total++;
      dicScoreEl.textContent = `${dicScore.correct} / ${dicScore.total}`;
      dicFeedbackEl.textContent = "✓ Perfect nagespeeld!";
      dicFeedbackEl.className = "ear-feedback correct";
      setTimeout(() => dicKb.clearHighlights(), 800);
    }
  } else if (Math.abs(info.midi - dicFrase[dicIdx]) > 1) {
    dicKb.highlight(info.midi, "wrong");
    dicScore.total++;
    dicActive = false;
    dicFeedbackEl.textContent = `✗ Fout op noot ${dicIdx + 1}. Luister opnieuw of onthul de noten.`;
    dicFeedbackEl.className = "ear-feedback wrong";
    dicScoreEl.textContent = `${dicScore.correct} / ${dicScore.total}`;
    if (dicPlaysLeft > 0) dicPlayBtn.disabled = false;
    setTimeout(() => dicKb.unhighlight(info.midi), 500);
  }
}

dicPlayBtn.addEventListener("click", dicPlay);
dicNewBtn.addEventListener("click", dicNewFrase);
dicRevealBtn.addEventListener("click", () => {
  dicRevealEl.hidden = false;
  dicRevealEl.textContent = "Noten: " + dicFrase.map((m) => midiToName(m).replace(/-?\d+$/, "")).join(" – ");
});
dicBpmSlider.addEventListener("input", () => { dicBpmVal.textContent = dicBpmSlider.value; });
dicKeySel.addEventListener("change", dicNewFrase);
dicLevelSel.addEventListener("change", dicNewFrase);

document.querySelector('#tabs button[data-tab="dictee"]').addEventListener("click", () => {
  setListener(onDicteeNote);
  if (!dicFrase.length) dicNewFrase();
});

dicNewFrase();

// ===========================================================================
// Tab: Lead Sheet (akkoord-symbolen leren & drills)
// ===========================================================================
const chRootSel        = document.getElementById("ch-root");
const chTypeSel        = document.getElementById("ch-type");
const chDemoBtn        = document.getElementById("ch-demo");
const chArpBtn         = document.getElementById("ch-arp");
const chSymbolEl       = document.getElementById("ch-symbol");
const chNameEl         = document.getElementById("ch-name");
const chIntervalsEl    = document.getElementById("ch-intervals");
const chKbEl           = document.getElementById("ch-keyboard");

const chLevelSel       = document.getElementById("ch-level");
const chNewBtn         = document.getElementById("ch-new");
const chScoreEl        = document.getElementById("ch-score");
const chDrillSymbolEl  = document.getElementById("ch-drill-symbol");
const chDrillHintEl    = document.getElementById("ch-drill-hint");
const chDrillKbEl      = document.getElementById("ch-drill-keyboard");
const chDrillDemoBtn   = document.getElementById("ch-drill-demo");
const chDrillRevealBtn = document.getElementById("ch-drill-reveal");
const chDrillProgressEl= document.getElementById("ch-drill-progress");
const chDrillFeedbackEl= document.getElementById("ch-drill-feedback");

const chKb      = new PianoKeyboard(chKbEl,      { min: nameToMidi("C3"), max: nameToMidi("C6") });
const chDrillKb = new PianoKeyboard(chDrillKbEl, { min: nameToMidi("C3"), max: nameToMidi("C6") });

// Vul root-dropdown
const ROOTS_DISPLAY = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
ROOTS_DISPLAY.forEach((r) => {
  const opt = document.createElement("option");
  opt.value = r;
  opt.textContent = r;
  chRootSel.appendChild(opt);
});

// Vul type-dropdown gegroepeerd
const chGrouped = groupedChordTypes();
Object.entries(chGrouped).forEach(([cat, items]) => {
  const og = document.createElement("optgroup");
  og.label = cat;
  items.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name + (t.symbol ? ` (${t.symbol})` : " (geen suffix)");
    og.appendChild(opt);
  });
  chTypeSel.appendChild(og);
});

// Vul niveau-dropdown
CHORD_LEVELS.forEach((l) => {
  const opt = document.createElement("option");
  opt.value = l.id;
  opt.textContent = l.name;
  chLevelSel.appendChild(opt);
});

// --- Leer-modus ---
function chUpdateLearn() {
  const root = chRootSel.value;
  const typeId = chTypeSel.value;
  const type = findChordType(typeId);
  const midis = chordMidis(root, typeId);
  const sym = chordSymbol(root, typeId);

  chSymbolEl.textContent = sym;
  chNameEl.textContent = type.name;

  const INTERVAL_NAMES = ["1","b2","2","b3","3","4","b5","5","b6","6","b7","7","8","b9","9"];
  chIntervalsEl.textContent = type.intervals.map((i) => INTERVAL_NAMES[i] || i).join(" – ");

  const min = Math.max(21, Math.min(...midis) - 2);
  const max = Math.min(108, Math.max(...midis) + 2);
  chKb.setRange(min, max);
  chKb.clearHighlights();
  midis.forEach((m) => chKb.highlight(m, "target"));
}

chRootSel.addEventListener("change", chUpdateLearn);
chTypeSel.addEventListener("change", chUpdateLearn);
chDemoBtn.addEventListener("click", () => {
  const midis = chordMidis(chRootSel.value, chTypeSel.value);
  synth.playChord(midis, { duration: 1.5 });
});
chArpBtn.addEventListener("click", () => {
  const midis = chordMidis(chRootSel.value, chTypeSel.value);
  synth.playMelodic(midis, { gap: 0.18, duration: 0.4 });
});

chUpdateLearn();

// --- Drill-modus ---
let chDrillChord = null;
let chDrillMidis = [];
let chDrillIdx = 0;
let chDrillActive = false;
let chDrillScore = { correct: 0, total: 0 };
let chDrillRevealed = false;

function chNewDrill() {
  chDrillChord = randomChord(chLevelSel.value);
  chDrillMidis = chordMidis(chDrillChord.root, chDrillChord.typeId);
  chDrillIdx = 0;
  chDrillActive = true;
  chDrillRevealed = false;

  const sym = chordSymbol(chDrillChord.root, chDrillChord.typeId);
  chDrillSymbolEl.textContent = sym;
  chDrillHintEl.textContent = "Speel het akkoord als arpeggio (noot voor noot omhoog).";
  chDrillFeedbackEl.textContent = "—";
  chDrillFeedbackEl.className = "ear-feedback";
  chDrillProgressEl.textContent = `0 / ${chDrillMidis.length}`;

  const min = Math.max(21, Math.min(...chDrillMidis) - 2);
  const max = Math.min(108, Math.max(...chDrillMidis) + 2);
  chDrillKb.setRange(min, max);
  chDrillKb.clearHighlights();
  chDrillKb.highlight(chDrillMidis[0], "target");
}

function onChordsNote(info) {
  if (!chDrillActive || !chDrillMidis.length) return;
  const expected = chDrillMidis[chDrillIdx];
  if (info.midi === expected) {
    chDrillKb.highlight(expected, "correct");
    chDrillIdx++;
    chDrillProgressEl.textContent = `${chDrillIdx} / ${chDrillMidis.length}`;
    if (chDrillIdx >= chDrillMidis.length) {
      chDrillActive = false;
      chDrillScore.correct++;
      chDrillScore.total++;
      chScoreEl.textContent = `${chDrillScore.correct} / ${chDrillScore.total}`;
      const sym = chordSymbol(chDrillChord.root, chDrillChord.typeId);
      chDrillFeedbackEl.textContent = `✓ ${sym} — perfect!`;
      chDrillFeedbackEl.className = "ear-feedback correct";
      setTimeout(chNewDrill, 1400);
    } else {
      setTimeout(() => {
        if (!chDrillRevealed) {
          chDrillKb.clearHighlights();
          for (let i = 0; i < chDrillIdx; i++) chDrillKb.highlight(chDrillMidis[i], "correct");
          chDrillKb.highlight(chDrillMidis[chDrillIdx], "target");
        }
      }, 150);
    }
  } else if (!chDrillRevealed && Math.abs(info.midi - expected) > 1) {
    chDrillKb.highlight(info.midi, "wrong");
    setTimeout(() => chDrillKb.unhighlight(info.midi), 400);
  }
}

chNewBtn.addEventListener("click", chNewDrill);
chLevelSel.addEventListener("change", chNewDrill);
chDrillDemoBtn.addEventListener("click", () => {
  if (!chDrillMidis.length) return;
  synth.playMelodic(chDrillMidis, { gap: 0.22, duration: 0.5 });
});
chDrillRevealBtn.addEventListener("click", () => {
  if (!chDrillMidis.length) return;
  chDrillRevealed = true;
  chDrillKb.clearHighlights();
  chDrillMidis.forEach((m) => chDrillKb.highlight(m, "target"));
  chDrillHintEl.textContent = "Noten zichtbaar — speel ze na om te oefenen.";
});

// Mode-switch
document.querySelectorAll("#tab-chords [data-chord-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#tab-chords [data-chord-mode]").forEach((b) =>
      b.classList.toggle("active", b === btn),
    );
    const mode = btn.dataset.chordMode;
    document.getElementById("chords-learn").hidden = mode !== "learn";
    document.getElementById("chords-drill").hidden = mode !== "drill";
    if (mode === "drill") setListener(onChordsNote);
    else setListener(null);
  });
});

document.querySelector('#tabs button[data-tab="chords"]').addEventListener("click", () => {
  const drillVisible = !document.getElementById("chords-drill").hidden;
  if (drillVisible) setListener(onChordsNote);
});

// ===========================================================================
// Tab: Transpositie
// ===========================================================================
const tpSongSel      = document.getElementById("tp-song");
const tpFromSel      = document.getElementById("tp-from");
const tpToSel        = document.getElementById("tp-to");
const tpDemoBtn      = document.getElementById("tp-demo");
const tpDemoTargetBtn= document.getElementById("tp-demo-target");
const tpIntervalEl   = document.getElementById("tp-interval-label");
const tpStaffEl      = document.getElementById("tp-staff");
const tpKbEl         = document.getElementById("tp-keyboard");
const tpStartBtn     = document.getElementById("tp-start");
const tpDrillBtn     = document.getElementById("tp-drill");
const tpProgressEl   = document.getElementById("tp-progress");

const tpStaff = new Staff(tpStaffEl, { width: 700 });
const tpKb    = new PianoKeyboard(tpKbEl, { min: nameToMidi("C3"), max: nameToMidi("C6") });

// Vul dropdowns
TRANSPOSABLE_SONGS.forEach((s) => {
  const opt = document.createElement("option");
  opt.value = s.id;
  opt.textContent = s.title;
  tpSongSel.appendChild(opt);
});
TRANSPOSE_KEYS.forEach((k) => {
  const makeOpt = (sel) => {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = k + " majeur";
    sel.appendChild(opt);
  };
  makeOpt(tpFromSel);
  makeOpt(tpToSel);
});
tpToSel.value = "G"; // standaard: van C naar G

let tpOrigMidis  = [];   // melodie in "from"-toonsoort
let tpTargetMidis = [];  // melodie in "to"-toonsoort
let tpIdx        = 0;
let tpActive     = false;

function tpLoad() {
  const songMeta = TRANSPOSABLE_SONGS.find((s) => s.id === tpSongSel.value);
  if (!songMeta) return;

  const song = getSong(tpSongSel.value);
  const baseMidis = songNotesToMidis(song.notes);

  // Verschuif van original key → from key
  const fromShift = intervalBetweenKeys(songMeta.originalKey, tpFromSel.value);
  tpOrigMidis = transposeMidis(baseMidis, fromShift);

  const shift = intervalBetweenKeys(tpFromSel.value, tpToSel.value);
  tpTargetMidis = transposeMidis(tpOrigMidis, shift);

  tpActive = false;
  tpIdx = 0;
  tpProgressEl.textContent = `0 / ${tpTargetMidis.length}`;
  tpStartBtn.textContent = "▶ Speel mee (getransponeerd)";

  // Toon originele melodie op balk
  tpStaff.showSequence(tpOrigMidis, -1);

  // Keyboard range op target melodie
  const allMidis = [...tpOrigMidis, ...tpTargetMidis];
  const min = Math.max(21, Math.min(...allMidis) - 2);
  const max = Math.min(108, Math.max(...allMidis) + 2);
  tpKb.setRange(min, max);
  tpKb.clearHighlights();

  // Interval-label
  const semitones = intervalBetweenKeys(tpFromSel.value, tpToSel.value);
  if (semitones === 0) {
    tpIntervalEl.textContent = "Zelfde toonsoort — kies een andere doeltoonsoort.";
  } else {
    tpIntervalEl.textContent = `Verschuif ${intervalLabel(semitones)} (${semitones > 0 ? "+" : ""}${semitones} halve tonen) → speel in ${tpToSel.value} majeur`;
  }
}

function tpShowCurrent() {
  tpKb.clearHighlights();
  tpStaff.showSequence(tpOrigMidis, tpIdx); // balk volgt origineel mee als leesreferentie
  if (tpIdx < tpTargetMidis.length) {
    tpKb.highlight(tpTargetMidis[tpIdx], "target");
  }
}

function onTransposeNote(info) {
  if (!tpActive || !tpTargetMidis.length) return;
  const expected = tpTargetMidis[tpIdx];
  if (info.midi === expected) {
    tpKb.highlight(expected, "correct");
    tpIdx++;
    tpProgressEl.textContent = `${tpIdx} / ${tpTargetMidis.length}`;
    if (tpIdx >= tpTargetMidis.length) {
      tpActive = false;
      tpStartBtn.textContent = "▶ Opnieuw";
      tpProgressEl.textContent = `✓ ${tpTargetMidis.length} noten in ${tpToSel.value}!`;
      tpKb.clearHighlights();
    } else {
      setTimeout(tpShowCurrent, 150);
    }
  } else {
    tpKb.highlight(info.midi, "wrong");
    setTimeout(() => tpKb.unhighlight(info.midi), 400);
  }
}

tpSongSel.addEventListener("change", tpLoad);
tpFromSel.addEventListener("change", tpLoad);
tpToSel.addEventListener("change", tpLoad);

tpDemoBtn.addEventListener("click", () => {
  if (!tpOrigMidis.length) return;
  synth.playMelodic(tpOrigMidis, { gap: 0.22, duration: 0.4 });
});
tpDemoTargetBtn.addEventListener("click", () => {
  if (!tpTargetMidis.length) return;
  synth.playMelodic(tpTargetMidis, { gap: 0.22, duration: 0.4 });
});

tpStartBtn.addEventListener("click", () => {
  if (!tpTargetMidis.length) return;
  tpActive = true;
  tpIdx = 0;
  tpShowCurrent();
  tpProgressEl.textContent = `0 / ${tpTargetMidis.length}`;
  tpStartBtn.textContent = "⏸ Bezig…";
});

tpDrillBtn.addEventListener("click", () => {
  // Kies een willekeurige doeltoonsoort die verschilt van de huidige
  const current = tpToSel.value;
  const seq = drillSequence(tpFromSel.value).filter((k) => k !== current);
  const next = seq[Math.floor(Math.random() * seq.length)];
  if (next) {
    tpToSel.value = next;
    tpLoad();
  }
});

document.querySelector('#tabs button[data-tab="transpose"]').addEventListener("click", () => {
  setListener(onTransposeNote);
  if (!tpOrigMidis.length) tpLoad();
});

tpLoad();

// ===========================================================================
// Tab: Kwintencirkel
// ===========================================================================
const circleContainer  = document.getElementById("circle-container");
const circlePlayScale  = document.getElementById("circle-play-scale");
const circlePlayProg   = document.getElementById("circle-play-prog");
const circlePlayRel    = document.getElementById("circle-play-rel");
const circleKbEl       = document.getElementById("circle-keyboard");
const circleHintEl     = document.getElementById("circle-hint");

const circleKb = new PianoKeyboard(circleKbEl, { min: nameToMidi("C3"), max: nameToMidi("C6") });
let circleSelectedKey  = "C";
let cof = null;

function circleSelectKey(keyName) {
  circleSelectedKey = keyName;
  const midis = scaleMidisInKey(keyName, 4).slice(0, 8);
  const min = Math.max(21, Math.min(...midis) - 1);
  const max = Math.min(108, Math.max(...midis) + 1);
  circleKb.setRange(min, max);
  circleKb.clearHighlights();
  midis.forEach((m) => circleKb.highlight(m, "target"));
  circleHintEl.textContent = `${keyName} majeur geselecteerd. Gebruik de knoppen hieronder om het te horen.`;
}

circlePlayScale.addEventListener("click", () => {
  const up   = scaleMidisInKey(circleSelectedKey, 4).slice(0, 8);
  const down = [...up].reverse().slice(1);
  synth.playMelodic([...up, ...down], { gap: 0.18, duration: 0.35 });
});

circlePlayProg.addEventListener("click", () => {
  const prog = renderProgression(circleSelectedKey,
    PROGRESSIONS.find((p) => p.id === "I-IV-V-I"), 4);
  let t = 0;
  prog.forEach((chord) => {
    setTimeout(() => synth.playChord(chord.midis, { duration: 0.9 }), t);
    t += 900;
  });
});

circlePlayRel.addEventListener("click", () => {
  const scale    = scaleMidisInKey(circleSelectedKey, 4);
  const relStart = scale[5]; // 6e trap
  const relMidis = [0, 2, 3, 5, 7, 8, 10, 12].map((i) => relStart + i);
  synth.playMelodic(relMidis, { gap: 0.18, duration: 0.35 });
});

document.querySelector('#tabs button[data-tab="circle"]').addEventListener("click", () => {
  setListener(null);
  if (!cof) {
    cof = new CircleOfFifths(circleContainer, {
      onSelect: circleSelectKey,
    });
    circleSelectKey("C");
  }
});

// Resize handler voor de cirkel
window.addEventListener("resize", () => {
  if (cof && document.querySelector("#tab-circle.active")) {
    cof.resize();
  }
});

// ===========================================================================
// Tab: Muziekstijlen
// ===========================================================================
const stylesNavEl     = document.getElementById("styles-nav");
const stylesContentEl = document.getElementById("styles-content");
let currentStyleId    = MUSIC_STYLES[0].id;

function renderStyleNav() {
  stylesNavEl.innerHTML = "";
  MUSIC_STYLES.forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "style-nav-btn" + (s.id === currentStyleId ? " active" : "");
    btn.textContent = s.name;
    btn.style.setProperty("--style-color", s.color);
    btn.addEventListener("click", () => {
      currentStyleId = s.id;
      renderStyleNav();
      renderStyleContent();
    });
    stylesNavEl.appendChild(btn);
  });
}

function renderStyleContent() {
  const s = findStyle(currentStyleId);
  stylesContentEl.innerHTML = `
    <div class="style-card">
      <div class="style-header" style="border-color:${s.color}">
        <h2 style="color:${s.color};margin:0 0 0.2rem">${s.name}</h2>
        <span class="style-period">${s.period}</span>
      </div>

      <div class="style-section">
        <h3>Componisten</h3>
        <ul>${s.composers.map((c) => `<li>${c}</li>`).join("")}</ul>
      </div>

      <div class="style-section">
        <h3>Kenmerken</h3>
        <ul>${s.characteristics.map((c) => `<li>${c}</li>`).join("")}</ul>
      </div>

      <div class="style-section">
        <h3>Piano-techniek tips</h3>
        <ul class="style-tips">${s.pianoTips.map((t) => `<li>${t}</li>`).join("")}</ul>
      </div>

      <div class="style-section">
        <h3>Bekende werken</h3>
        <p class="hint">${s.pieces.join(" · ")}</p>
      </div>

      <div class="style-demo">
        <button class="ghost" id="style-demo-btn">🔊 ${s.demoLabel}</button>
      </div>
    </div>
  `;
  document.getElementById("style-demo-btn").addEventListener("click", () => {
    const midis = s.demo.map((n) => nameToMidi(n));
    synth.playMelodic(midis, { gap: 0.2, duration: 0.35 });
  });
}

document.querySelector('#tabs button[data-tab="styles"]').addEventListener("click", () => {
  setListener(null);
  if (!stylesNavEl.children.length) {
    renderStyleNav();
    renderStyleContent();
  }
});

// ===========================================================================
// Tab: Duet (app speelt LH, jij speelt RH)
// ===========================================================================
const duetProgSel     = document.getElementById("duet-prog");
const duetKeySel      = document.getElementById("duet-key");
const duetPatternSel  = document.getElementById("duet-pattern");
const duetBpmSlider   = document.getElementById("duet-bpm");
const duetBpmVal      = document.getElementById("duet-bpm-val");
const duetPatternDesc = document.getElementById("duet-pattern-desc");
const duetKbEl        = document.getElementById("duet-keyboard");
const duetToggleBtn   = document.getElementById("duet-toggle");
const duetStatusEl    = document.getElementById("duet-status");

const duetKb     = new PianoKeyboard(duetKbEl, { min: nameToMidi("C2"), max: nameToMidi("C5") });
const duetPlayer = new DuetPlayer();

PROGRESSIONS.forEach((p) => {
  const opt = document.createElement("option");
  opt.value = p.id; opt.textContent = p.name;
  duetProgSel.appendChild(opt);
});
KEYS.forEach((k) => {
  const opt = document.createElement("option");
  opt.value = k.name; opt.textContent = k.name + " majeur";
  duetKeySel.appendChild(opt);
});
LH_PATTERNS.forEach((p) => {
  const opt = document.createElement("option");
  opt.value = p.id; opt.textContent = p.name;
  duetPatternSel.appendChild(opt);
});

function duetUpdateDesc() {
  const pat = findLHPattern(duetPatternSel.value);
  duetPatternDesc.textContent = pat.description;
}

function duetUpdateKeyboard() {
  // Toon de akkoorden van de gekozen progressie op het keyboard
  const prog = PROGRESSIONS.find((p) => p.id === duetProgSel.value);
  if (!prog) return;
  const chords = renderProgression(duetKeySel.value, prog, 3);
  duetKb.clearHighlights();
  // Highlight alle unieke noten in de progressie
  const allMidis = new Set(chords.flatMap((c) => c.midis));
  allMidis.forEach((m) => duetKb.highlight(m, "target"));
}

function duetRestart() {
  if (duetPlayer.running) {
    duetPlayer.start(
      duetKeySel.value,
      duetProgSel.value,
      duetPatternSel.value,
      parseInt(duetBpmSlider.value, 10),
    );
  }
  duetUpdateKeyboard();
}

duetToggleBtn.addEventListener("click", () => {
  const bpm = parseInt(duetBpmSlider.value, 10);
  duetPlayer.toggle(duetKeySel.value, duetProgSel.value, duetPatternSel.value, bpm);
  duetToggleBtn.textContent = duetPlayer.running ? "⏸ Stop linkerhand" : "▶ Start linkerhand";
  duetStatusEl.textContent  = duetPlayer.running ? "speelt…" : "gestopt";
  if (duetPlayer.running) duetUpdateKeyboard();
});

duetBpmSlider.addEventListener("input", () => {
  duetBpmVal.textContent = duetBpmSlider.value;
  duetRestart();
});
duetProgSel.addEventListener("change", () => { duetRestart(); duetUpdateKeyboard(); });
duetKeySel.addEventListener("change",  () => { duetRestart(); duetUpdateKeyboard(); });
duetPatternSel.addEventListener("change", () => { duetUpdateDesc(); duetRestart(); });

document.querySelector('#tabs button[data-tab="duet"]').addEventListener("click", () => {
  setListener(null); // RH vrij — geen mic-correctie in duet
  duetUpdateDesc();
  duetUpdateKeyboard();
});

duetUpdateDesc();

// ===========================================================================
// Tab: Omkeringen (chord inversions)
// ===========================================================================
const invRootSel        = document.getElementById("inv-root");
const invTypeSel        = document.getElementById("inv-type");
const invNumSel         = document.getElementById("inv-num");
const invDemoBtn        = document.getElementById("inv-demo");
const invArpBtn         = document.getElementById("inv-arp");
const invSymbolEl       = document.getElementById("inv-symbol");
const invNameEl         = document.getElementById("inv-name");
const invBassDescEl     = document.getElementById("inv-bass-desc");
const invKbEl           = document.getElementById("inv-keyboard");

const invLevelSel       = document.getElementById("inv-level");
const invNewBtn         = document.getElementById("inv-new");
const invScoreEl        = document.getElementById("inv-score");
const invDrillSymbolEl  = document.getElementById("inv-drill-symbol");
const invDrillNameEl    = document.getElementById("inv-drill-name");
const invDrillHintEl    = document.getElementById("inv-drill-hint");
const invDrillKbEl      = document.getElementById("inv-drill-keyboard");
const invDrillDemoBtn   = document.getElementById("inv-drill-demo");
const invDrillRevealBtn = document.getElementById("inv-drill-reveal");
const invDrillProgressEl= document.getElementById("inv-drill-progress");
const invDrillFeedbackEl= document.getElementById("inv-drill-feedback");

const invVlProgSel      = document.getElementById("inv-vl-prog");
const invVlKeySel       = document.getElementById("inv-vl-key");
const invVlPlayBtn      = document.getElementById("inv-vl-play");
const invVlPlayRootBtn  = document.getElementById("inv-vl-play-root");
const invVlChordsEl     = document.getElementById("inv-vl-chords");
const invVlKbEl         = document.getElementById("inv-vl-keyboard");

const invKb      = new PianoKeyboard(invKbEl,      { min: nameToMidi("C3"), max: nameToMidi("C6") });
const invDrillKb = new PianoKeyboard(invDrillKbEl, { min: nameToMidi("C3"), max: nameToMidi("C6") });
const invVlKb    = new PianoKeyboard(invVlKbEl,    { min: nameToMidi("C3"), max: nameToMidi("C6") });

// Vul leer-dropdowns
const INV_ROOTS = ["C","D","E","F","G","A","B","Bb","Eb","Ab","F#","Db"];
INV_ROOTS.forEach((r) => {
  const opt = document.createElement("option");
  opt.value = r; opt.textContent = r;
  invRootSel.appendChild(opt);
});
// Alleen de meest gangbare akkoordtypen voor omkeringen
["maj","min","dom7","maj7","min7","dim","halfdim"].forEach((id) => {
  const { CHORD_TYPES: ct } = { CHORD_TYPES };
  const type = findChordType(id);
  const opt = document.createElement("option");
  opt.value = id;
  opt.textContent = type.name + (type.symbol ? ` (${type.symbol})` : "");
  invTypeSel.appendChild(opt);
});
INVERSION_LEVELS.forEach((l) => {
  const opt = document.createElement("option");
  opt.value = l.id; opt.textContent = l.name;
  invLevelSel.appendChild(opt);
});
PROGRESSIONS.forEach((p) => {
  const opt = document.createElement("option");
  opt.value = p.id; opt.textContent = p.name;
  invVlProgSel.appendChild(opt);
});
KEYS.forEach((k) => {
  const opt = document.createElement("option");
  opt.value = k.name; opt.textContent = k.name + " majeur";
  invVlKeySel.appendChild(opt);
});

// --- Leer-modus ---
function invUpdateLearn() {
  const root = invRootSel.value;
  const typeId = invTypeSel.value;
  const inv = parseInt(invNumSel.value, 10);
  const maxInv = inversionCount(typeId) - 1;

  // Verberg ongeldige liggingen
  Array.from(invNumSel.options).forEach((opt, i) => {
    opt.hidden = i > maxInv;
  });
  const safeInv = Math.min(inv, maxInv);
  invNumSel.value = safeInv;

  const midis = inversionMidis(root, typeId, safeInv);
  const sym   = inversionSymbol(root, typeId, safeInv);

  invSymbolEl.textContent  = sym;
  invNameEl.textContent    = inversionName(safeInv);
  invBassDescEl.textContent = inversionBassDesc(typeId, safeInv);

  const min = Math.max(21, Math.min(...midis) - 2);
  const max = Math.min(108, Math.max(...midis) + 2);
  invKb.setRange(min, max);
  invKb.clearHighlights();
  midis.forEach((m) => invKb.highlight(m, "target"));
}

invRootSel.addEventListener("change", invUpdateLearn);
invTypeSel.addEventListener("change", invUpdateLearn);
invNumSel.addEventListener("change", invUpdateLearn);
invDemoBtn.addEventListener("click", () => {
  const midis = inversionMidis(invRootSel.value, invTypeSel.value, parseInt(invNumSel.value, 10));
  synth.playChord(midis, { duration: 1.5 });
});
invArpBtn.addEventListener("click", () => {
  const midis = inversionMidis(invRootSel.value, invTypeSel.value, parseInt(invNumSel.value, 10));
  synth.playMelodic(midis, { gap: 0.18, duration: 0.4 });
});

invUpdateLearn();

// --- Drill-modus ---
let invDrillCurrent = null;
let invDrillMidis   = [];
let invDrillIdx     = 0;
let invDrillActive  = false;
let invDrillScore   = { correct: 0, total: 0 };
let invDrillRevealed = false;

function invNewDrill() {
  invDrillCurrent  = randomInversionDrill(invLevelSel.value);
  invDrillMidis    = inversionMidis(invDrillCurrent.root, invDrillCurrent.typeId, invDrillCurrent.inversionNum);
  invDrillIdx      = 0;
  invDrillActive   = true;
  invDrillRevealed = false;

  invDrillSymbolEl.textContent = inversionSymbol(invDrillCurrent.root, invDrillCurrent.typeId, invDrillCurrent.inversionNum);
  invDrillNameEl.textContent   = inversionName(invDrillCurrent.inversionNum);
  invDrillHintEl.textContent   = "Speel van laag naar hoog (arpeggio).";
  invDrillFeedbackEl.textContent = "—";
  invDrillFeedbackEl.className   = "ear-feedback";
  invDrillProgressEl.textContent = `0 / ${invDrillMidis.length}`;

  const min = Math.max(21, Math.min(...invDrillMidis) - 2);
  const max = Math.min(108, Math.max(...invDrillMidis) + 2);
  invDrillKb.setRange(min, max);
  invDrillKb.clearHighlights();
  invDrillKb.highlight(invDrillMidis[0], "target");
}

function onInversionsNote(info) {
  if (!invDrillActive || !invDrillMidis.length) return;
  const expected = invDrillMidis[invDrillIdx];
  if (info.midi === expected) {
    invDrillKb.highlight(expected, "correct");
    invDrillIdx++;
    invDrillProgressEl.textContent = `${invDrillIdx} / ${invDrillMidis.length}`;
    if (invDrillIdx >= invDrillMidis.length) {
      invDrillActive = false;
      invDrillScore.correct++;
      invDrillScore.total++;
      invScoreEl.textContent = `${invDrillScore.correct} / ${invDrillScore.total}`;
      invDrillFeedbackEl.textContent = `✓ ${invDrillSymbolEl.textContent} — perfect!`;
      invDrillFeedbackEl.className   = "ear-feedback correct";
      setTimeout(invNewDrill, 1400);
    } else {
      setTimeout(() => {
        if (!invDrillRevealed) {
          invDrillKb.clearHighlights();
          for (let i = 0; i < invDrillIdx; i++) invDrillKb.highlight(invDrillMidis[i], "correct");
          invDrillKb.highlight(invDrillMidis[invDrillIdx], "target");
        }
      }, 150);
    }
  } else if (!invDrillRevealed && Math.abs(info.midi - expected) > 1) {
    invDrillKb.highlight(info.midi, "wrong");
    setTimeout(() => invDrillKb.unhighlight(info.midi), 400);
  }
}

invNewBtn.addEventListener("click", invNewDrill);
invLevelSel.addEventListener("change", invNewDrill);
invDrillDemoBtn.addEventListener("click", () => {
  if (!invDrillMidis.length) return;
  synth.playMelodic(invDrillMidis, { gap: 0.22, duration: 0.5 });
});
invDrillRevealBtn.addEventListener("click", () => {
  if (!invDrillMidis.length) return;
  invDrillRevealed = true;
  invDrillKb.clearHighlights();
  invDrillMidis.forEach((m) => invDrillKb.highlight(m, "target"));
  invDrillHintEl.textContent = "Noten zichtbaar — speel ze na.";
});

// --- Voice Leading ---
function invUpdateVoiceLeading() {
  const prog = PROGRESSIONS.find((p) => p.id === invVlProgSel.value);
  const key  = invVlKeySel.value;
  if (!prog) return;

  const voiced = voiceLeadingDemo(key, prog);
  invVlChordsEl.innerHTML = "";

  voiced.forEach((chord, idx) => {
    const chip = document.createElement("button");
    chip.className = "chord-chip";
    chip.innerHTML = `<strong>${inversionSymbol(chord.root, chord.typeId, chord.inversionNum)}</strong>
      <small style="display:block;font-size:0.7rem;font-weight:normal">${inversionName(chord.inversionNum)}</small>`;
    chip.addEventListener("click", () => {
      invVlKb.clearHighlights();
      chord.midis.forEach((m) => invVlKb.highlight(m, "target"));
      invVlChordsEl.querySelectorAll(".chord-chip").forEach((c, i) =>
        c.classList.toggle("active", i === idx));
      synth.playChord(chord.midis, { duration: 1.0 });
    });
    invVlChordsEl.appendChild(chip);
  });

  const allMidis = voiced.flatMap((c) => c.midis);
  const min = Math.max(21, Math.min(...allMidis) - 2);
  const max = Math.min(108, Math.max(...allMidis) + 2);
  invVlKb.setRange(min, max);
  invVlKb.clearHighlights();

  // Bewaar voiced voor afspelen
  invVlKb._voiced = voiced;
}

invVlPlayBtn.addEventListener("click", async () => {
  const voiced = invVlKb._voiced;
  if (!voiced) return;
  for (let i = 0; i < voiced.length; i++) {
    invVlChordsEl.querySelectorAll(".chord-chip").forEach((c, j) =>
      c.classList.toggle("active", j === i));
    invVlKb.clearHighlights();
    voiced[i].midis.forEach((m) => invVlKb.highlight(m, "target"));
    synth.playChord(voiced[i].midis, { duration: 0.85 });
    await new Promise((r) => setTimeout(r, 900));
  }
  invVlChordsEl.querySelectorAll(".chord-chip").forEach((c) => c.classList.remove("active"));
});

invVlPlayRootBtn.addEventListener("click", async () => {
  const prog = PROGRESSIONS.find((p) => p.id === invVlProgSel.value);
  const key  = invVlKeySel.value;
  if (!prog) return;
  const rendered = renderProgression(key, prog);
  for (const chord of rendered) {
    synth.playChord(chord.midis, { duration: 0.85 });
    await new Promise((r) => setTimeout(r, 900));
  }
});

invVlProgSel.addEventListener("change", invUpdateVoiceLeading);
invVlKeySel.addEventListener("change", invUpdateVoiceLeading);

// Mode-switch
document.querySelectorAll("#tab-inversions [data-inv-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#tab-inversions [data-inv-mode]").forEach((b) =>
      b.classList.toggle("active", b === btn));
    const mode = btn.dataset.invMode;
    document.getElementById("inv-learn").hidden       = mode !== "learn";
    document.getElementById("inv-drill").hidden       = mode !== "drill";
    document.getElementById("inv-voiceleading").hidden = mode !== "voiceleading";
    if (mode === "drill") setListener(onInversionsNote);
    else setListener(null);
    if (mode === "voiceleading" && !invVlKb._voiced) invUpdateVoiceLeading();
  });
});

document.querySelector('#tabs button[data-tab="inversions"]').addEventListener("click", () => {
  const drillActive = !document.getElementById("inv-drill").hidden;
  if (drillActive) setListener(onInversionsNote);
});
