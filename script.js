// ═══════════════════════════════════════════════════════════════
//  LIFE IN WEEKS — script.js  (v2)
// ═══════════════════════════════════════════════════════════════

// ─── POPULATE SELECTS ────────────────────────────────────────────────────────

const daySelect   = document.getElementById("pick-day");
const monthSelect = document.getElementById("pick-month");
const yearSelect  = document.getElementById("pick-year");

for (let d = 1; d <= 31; d++) {
  const o = document.createElement("option");
  o.value = d;
  o.textContent = String(d).padStart(2, "0");
  daySelect.appendChild(o);
}

const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= 1920; y--) {
  const o = document.createElement("option");
  o.value = y;
  o.textContent = y;
  yearSelect.appendChild(o);
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PHASES = [
  { label: "Childhood",   start: 0,  end: 12,  shade: "#ffffff" },
  { label: "Adolescence", start: 12, end: 18,  shade: "#cccccc" },
  { label: "Young Adult", start: 18, end: 35,  shade: "#999999" },
  { label: "Midlife",     start: 35, end: 60,  shade: "#666666" },
  { label: "Senior",      start: 60, end: 200, shade: "#444444" },
];

const MILESTONES = {
  0:   "Birth",
  18:  "Adulthood",
  21:  "Age 21",
  25:  "Age 25",
  30:  "Age 30",
  40:  "Age 40",
  50:  "Half Century",
  60:  "Age 60",
  70:  "Age 70",
  80:  "Age 80",
};

const PHASE_MESSAGES = {
  "Childhood":   "These weeks shaped everything about who you are. The world felt infinite.",
  "Adolescence": "Turbulent, electric, defining. The years you were becoming yourself.",
  "Young Adult": "The open road. Possibility in every direction. The world was yours to map.",
  "Midlife":     "Depth over breadth. The years of craft, of consequence, of choosing.",
  "Senior":      "The long view. Wisdom earned. Time more precious than ever.",
};

const QUOTES = [
  "The trouble is, you think you have time. — Buddha",
  "In the end, it's not the years in your life that count. It's the life in your years. — Lincoln",
  "Do not go gentle into that good night. — Dylan Thomas",
  "We are here to laugh at the odds and live our lives so well that death will tremble to take us. — Bukowski",
  "It is not death that a man should fear, but he should fear never beginning to live. — Marcus Aurelius",
  "The fear of death follows from the fear of life. A man who lives fully is prepared to die at any time. — Twain",
  "Time is a created thing. To say 'I don't have time' is to say 'I don't want to.' — Lao Tzu",
];

// ─── STATE ────────────────────────────────────────────────────────────────────

let STATE = {
  dob: null,
  weeksLived: 0,
  totalWeeks: 90 * 52,
  lifespan: 90,
  countdownInterval: null,
  isMobile: false,
};

// ─── UTILS ───────────────────────────────────────────────────────────────────

function phaseForAge(age) {
  return PHASES.find(p => age >= p.start && age < p.end) || PHASES[PHASES.length - 1];
}

function formatDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function pad(n) { return String(Math.floor(n)).padStart(2, "0"); }

function isMobileDevice() {
  return window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window;
}

// ─── START BUTTON ────────────────────────────────────────────────────────────

document.getElementById("startBtn").addEventListener("click", () => {
  const d = daySelect.value;
  const m = monthSelect.value;
  const y = yearSelect.value;
  const errEl = document.getElementById("dob-error");

  if (!d || m === "" || !y) {
    errEl.textContent = "Please select your full date of birth.";
    errEl.classList.add("visible");
    return;
  }
  errEl.classList.remove("visible");

  const dob   = new Date(Number(y), Number(m), Number(d));
  const today = new Date();

  if (dob > today) {
    errEl.textContent = "Date of birth cannot be in the future.";
    errEl.classList.add("visible");
    return;
  }

  STATE.dob       = dob;
  STATE.isMobile  = isMobileDevice();
  const diffTime  = today - dob;
  STATE.weeksLived = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  STATE.totalWeeks = STATE.lifespan * 52;

  showGridScreen();
});

// ─── RESET ───────────────────────────────────────────────────────────────────

document.getElementById("resetBtn").addEventListener("click", () => {
  clearInterval(STATE.countdownInterval);
  document.getElementById("screen-grid").classList.add("hidden");
  document.getElementById("screen-landing").classList.remove("hidden");
  daySelect.value   = "";
  monthSelect.value = "";
  yearSelect.value  = "";
});

// ─── SNAP TO NOW ─────────────────────────────────────────────────────────────

document.getElementById("snapBtn").addEventListener("click", () => {
  const currentEl = document.querySelector(".week.current");
  if (!currentEl) return;
  currentEl.scrollIntoView({ behavior: "smooth", block: "center" });
  currentEl.classList.add("flash");
  setTimeout(() => currentEl.classList.remove("flash"), 1800);
});

// ─── LIFESPAN SLIDER ─────────────────────────────────────────────────────────

document.getElementById("lifespan-slider").addEventListener("input", function () {
  STATE.lifespan   = parseInt(this.value);
  STATE.totalWeeks = STATE.lifespan * 52;
  document.getElementById("slider-display").textContent = `${STATE.lifespan} years`;
  rebuildAfterSlider();
});

function rebuildAfterSlider() {
  const weeksLeft = STATE.totalWeeks - STATE.weeksLived;
  const pct = Math.min(100, (STATE.weeksLived / STATE.totalWeeks) * 100);

  document.getElementById("stat-weeks-left").textContent  = Math.max(0, weeksLeft).toLocaleString();
  document.getElementById("stat-pct").textContent         = pct.toFixed(1) + "%";
  document.getElementById("progress-fill").style.width    = pct + "%";

  buildGrid(STATE.weeksLived, STATE.totalWeeks);
  buildDecadeCol(STATE.lifespan);
  updateCountdown();
}

// ─── SHOW GRID SCREEN ────────────────────────────────────────────────────────

function showGridScreen() {
  document.getElementById("screen-landing").classList.add("hidden");
  document.getElementById("screen-grid").classList.remove("hidden");

  const { dob, weeksLived, totalWeeks } = STATE;
  const weeksLeft = totalWeeks - weeksLived;

  // Header
  document.getElementById("header-name").textContent =
    `Born ${dob.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

  // Animated stats
  animateCount("stat-weeks-lived", weeksLived);
  animateCount("stat-years-lived", (weeksLived / 52).toFixed(1), false);
  animateCount("stat-weeks-left",  Math.max(0, weeksLeft));
  animateCount("stat-days-lived",  Math.floor((new Date() - dob) / 86400000));
  document.getElementById("stat-pct").textContent = ((weeksLived / totalWeeks) * 100).toFixed(1) + "%";

  // Progress bar
  const pct = Math.min(100, (weeksLived / totalWeeks) * 100);
  setTimeout(() => {
    document.getElementById("progress-fill").style.width = pct + "%";
  }, 300);

  // Slider
  document.getElementById("slider-display").textContent = `${STATE.lifespan} years`;

  // Countdown
  startCountdown();

  // Build UI
  buildLegend();
  buildDecadeCol(STATE.lifespan);
  buildGrid(weeksLived, totalWeeks);

  // Quote
  document.getElementById("footer-quote").textContent =
    QUOTES[Math.floor(Math.random() * QUOTES.length)];

  // Next birthday
  setNextBirthday(dob);
}

// ─── COUNTDOWN CLOCK ─────────────────────────────────────────────────────────

function startCountdown() {
  updateCountdown();
  STATE.countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  if (!STATE.dob) return;
  const end = new Date(STATE.dob);
  end.setFullYear(end.getFullYear() + STATE.lifespan);
  const now  = new Date();
  let   diff = end - now;

  if (diff <= 0) {
    ["cd-years","cd-days","cd-hours","cd-mins","cd-secs"].forEach(id => {
      document.getElementById(id).textContent = "00";
    });
    return;
  }

  const yrs  = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  diff       -= yrs * 1000 * 60 * 60 * 24 * 365.25;
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff       -= days * 1000 * 60 * 60 * 24;
  const hrs   = Math.floor(diff / (1000 * 60 * 60));
  diff       -= hrs  * 1000 * 60 * 60;
  const mins  = Math.floor(diff / (1000 * 60));
  const secs  = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById("cd-years").textContent = pad(yrs);
  document.getElementById("cd-days").textContent  = pad(days);
  document.getElementById("cd-hours").textContent = pad(hrs);
  document.getElementById("cd-mins").textContent  = pad(mins);
  document.getElementById("cd-secs").textContent  = pad(secs);
}

// ─── NEXT BIRTHDAY ────────────────────────────────────────────────────────────

function setNextBirthday(dob) {
  const today = new Date();
  const next  = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (next <= today) next.setFullYear(next.getFullYear() + 1);
  const daysUntil = Math.ceil((next - today) / 86400000);
  document.getElementById("footer-next-bday").textContent =
    `${daysUntil} days until your next birthday — ${formatDate(next)}`;
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────

function animateCount(id, target, isInt = true) {
  const el  = document.getElementById(id);
  if (!el) return;
  const dur = 1200;
  const t0  = performance.now();
  const num = parseFloat(target);
  function step(now) {
    const t    = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = isInt
      ? Math.floor(num * ease).toLocaleString()
      : (num * ease).toFixed(1);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = isInt ? Math.floor(num).toLocaleString() : String(target);
  }
  requestAnimationFrame(step);
}

// ─── LEGEND ──────────────────────────────────────────────────────────────────

function buildLegend() {
  const el = document.getElementById("phase-legend");
  el.innerHTML = "";
  PHASES.forEach(p => {
    if (p.start >= 90) return; // don't show beyond default
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
      <span class="legend-dot" style="background:${p.shade}"></span>
      <span class="legend-text">${p.label} (${p.start}–${Math.min(p.end, 90)})</span>
    `;
    el.appendChild(item);
  });

  // Current marker
  const cur = document.createElement("div");
  cur.className = "legend-item";
  cur.innerHTML = `<span class="legend-dot legend-dot--current"></span><span class="legend-text">You Are Here</span>`;
  el.appendChild(cur);

  // Milestone
  const mil = document.createElement("div");
  mil.className = "legend-item";
  mil.innerHTML = `<span class="legend-dot legend-dot--milestone"></span><span class="legend-text">Milestone Year</span>`;
  el.appendChild(mil);
}

// ─── DECADE COLUMN ───────────────────────────────────────────────────────────

function buildDecadeCol(lifespan) {
  const col = document.getElementById("decade-col");
  col.innerHTML = "";
  for (let age = 0; age <= lifespan; age += 10) {
    const label = document.createElement("div");
    label.className = "decade-label";
    label.textContent = age === 0 ? "Birth" : `${age}`;
    col.appendChild(label);
  }
}

// ─── GRID ─────────────────────────────────────────────────────────────────────

function buildGrid(weeksLived, totalWeeks) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  const isMobile = isMobileDevice();

  for (let i = 0; i < totalWeeks; i++) {
    const div = document.createElement("div");
    div.classList.add("week");

    const age   = i / 52;
    const phase = phaseForAge(age);
    const ageYr = Math.floor(age);

    // Phase fill
    if (i < weeksLived) {
      div.classList.add("past");
      div.style.setProperty("--phase-color", phase.shade);
    } else if (i === weeksLived) {
      div.classList.add("current");
    }

    // Milestone marker — first week of milestone ages
    if (MILESTONES[ageYr] && Math.floor((i % 52)) === 0) {
      div.classList.add("milestone");
      div.dataset.milestone = MILESTONES[ageYr];
    }

    // Stagger animation
    div.style.animationDelay = `${Math.floor(i / 52) * 16}ms`;

    // ── Interaction: mobile = tap, desktop = hover ──
    if (isMobile) {
      div.addEventListener("click", () => openPanel(i, weeksLived));
    } else {
      div.addEventListener("mousemove", (e) => showTooltip(e, i, weeksLived));
      div.addEventListener("mouseleave", hideTooltip);
      div.addEventListener("click", () => openPanel(i, weeksLived));
    }

    grid.appendChild(div);
  }
}

// ─── TOOLTIP (desktop) ────────────────────────────────────────────────────────

const tooltip = document.getElementById("tooltip");

function showTooltip(e, i, weeksLived) {
  const age      = i / 52;
  const ageYears = Math.floor(age);
  const ageMo    = Math.floor((age - ageYears) * 12);
  const phase    = phaseForAge(age);
  const isPast   = i < weeksLived;
  const isCur    = i === weeksLived;

  // Compute actual calendar date of this week
  const weekStart = new Date(STATE.dob);
  weekStart.setDate(weekStart.getDate() + i * 7);

  // Clamp tooltip to viewport
  const x = Math.min(e.clientX + 14, window.innerWidth  - 160);
  const y = Math.min(e.clientY + 14, window.innerHeight - 120);

  tooltip.style.left    = x + "px";
  tooltip.style.top     = y + "px";
  tooltip.style.opacity = 1;
  tooltip.innerHTML = `
    <div class="tt-week">Week ${(i + 1).toLocaleString()}</div>
    <div class="tt-age">Age ${ageYears}y ${ageMo}m</div>
    <div class="tt-date">${formatDate(weekStart)}</div>
    <div class="tt-phase" style="color:${phase.shade === '#111' ? '#999' : phase.shade}">${phase.label}</div>
    <div class="tt-status">${isCur ? "← YOU ARE HERE" : isPast ? "Past" : "Future"}</div>
    <div class="tt-hint">click for details</div>
  `;
}

function hideTooltip() {
  tooltip.style.opacity = 0;
}

// ─── REFLECTION PANEL ────────────────────────────────────────────────────────

const panel        = document.getElementById("reflection-panel");
const panelOverlay = document.getElementById("panel-overlay");

function openPanel(i, weeksLived) {
  const age      = i / 52;
  const ageYears = Math.floor(age);
  const ageMo    = Math.floor((age - ageYears) * 12);
  const phase    = phaseForAge(age);
  const isPast   = i < weeksLived;
  const isCur    = i === weeksLived;

  const weekStart = new Date(STATE.dob);
  weekStart.setDate(weekStart.getDate() + i * 7);
  const weekEnd   = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const calYear = weekStart.getFullYear();

  const statusText = isCur ? "✦ You Are Here" : isPast ? "In The Past" : "Awaiting You";

  const message = isCur
    ? "This is the week you're living right now. Make it count."
    : isPast
    ? PHASE_MESSAGES[phase.label] || "A week that's been and gone."
    : "This week hasn't happened yet. You can still shape it.";

  document.getElementById("panel-eyebrow").textContent   = `WEEK ${(i + 1).toLocaleString()} OF ${STATE.totalWeeks.toLocaleString()}`;
  document.getElementById("panel-week-num").textContent  = formatDate(weekStart);
  document.getElementById("panel-date-range").textContent = `${formatDate(weekStart)} — ${formatDate(weekEnd)}`;
  document.getElementById("panel-age").textContent       = `${ageYears} years, ${ageMo} months`;
  document.getElementById("panel-phase").textContent     = phase.label;
  document.getElementById("panel-year").textContent      = calYear;
  document.getElementById("panel-status").textContent    = statusText;
  document.getElementById("panel-message").textContent   = message;

  panel.classList.add("open");
  panelOverlay.classList.add("open");
  hideTooltip();
}

document.getElementById("panel-close").addEventListener("click", closePanel);
panelOverlay.addEventListener("click", closePanel);

function closePanel() {
  panel.classList.remove("open");
  panelOverlay.classList.remove("open");
}

// ─── SHARE MODAL ─────────────────────────────────────────────────────────────

document.getElementById("shareBtn").addEventListener("click", () => {
  const { dob, weeksLived, totalWeeks, lifespan } = STATE;
  const pct     = ((weeksLived / totalWeeks) * 100).toFixed(1);
  const daysLvd = Math.floor((new Date() - dob) / 86400000).toLocaleString();
  const yrs     = (weeksLived / 52).toFixed(1);

  const text = `Life in Weeks\n━━━━━━━━━━━━━━━━━━━━\nBorn: ${formatDate(dob)}\n\n${weeksLived.toLocaleString()} weeks lived\n${daysLvd} days on Earth\n${yrs} years of experience\n\n${pct}% of ${lifespan}-year life used\n${(totalWeeks - weeksLived).toLocaleString()} weeks still ahead\n━━━━━━━━━━━━━━━━━━━━\nlifeinweeks.app`;

  document.getElementById("share-card").textContent = text;
  document.getElementById("share-overlay").classList.remove("hidden");
});

document.getElementById("share-close").addEventListener("click", () => {
  document.getElementById("share-overlay").classList.add("hidden");
});

document.getElementById("share-overlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("share-overlay"))
    document.getElementById("share-overlay").classList.add("hidden");
});

document.getElementById("copy-btn").addEventListener("click", () => {
  const text = document.getElementById("share-card").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const lbl = document.getElementById("copy-label");
    lbl.textContent = "COPIED ✓";
    setTimeout(() => lbl.textContent = "COPY TO CLIPBOARD", 2000);
  });
});