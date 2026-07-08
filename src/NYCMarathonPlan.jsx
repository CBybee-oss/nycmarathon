import { useState, useEffect, useRef } from "react";

// ───────────────────────────────────────────────────────────────
// NYC MARATHON 2026 — SUB-4:20 BUILD — CAMERON
// Race day: Sunday, Nov 1, 2026 (first Sunday of November)
// Block: 16 weeks, Mon Jul 13 → Sun Nov 1, 2026
// ───────────────────────────────────────────────────────────────

const RACE_DATE = new Date(2026, 10, 1); // Nov 1, 2026

const PHASES = {
  ramp:    { label: "RAMP",    color: "#2dd4bf", range: "JUN 8–JUL 12" },
  base:    { label: "BASE",    color: "#4ade80", range: "WK 1–4" },
  quality: { label: "QUALITY", color: "#fb923c", range: "WK 5–10" },
  peak:    { label: "PEAK",    color: "#f43f5e", range: "WK 11–13" },
  taper:   { label: "TAPER",   color: "#a78bfa", range: "WK 14–16" },
};

const TYPES = {
  easy:    { color: "#4ade80", label: "EASY" },
  mlr:     { color: "#38bdf8", label: "MED-LONG" },
  quality: { color: "#fb923c", label: "QUALITY" },
  long:    { color: "#fb7185", label: "LONG" },
  race:    { color: "#fde047", label: "RACE" },
  rest:    { color: "#3f3f46", label: "REST" },
};

const ZONES = [
  { name: "RACE GOAL",         mi: "4:20:00",        km: "26.2 MI",       color: "#fde047", use: "Sub-4:20 finish. 9:55/mi average, even effort." },
  { name: "MARATHON PACE",     mi: "9:55/MI",        km: "6:09/KM",       color: "#fb923c", use: "Race pace intervals, long run finishes. Should feel 'comfortably honest' in training." },
  { name: "TEMPO / LT",        mi: "9:05–9:15/MI",   km: "5:39–5:45/KM",  color: "#f43f5e", use: "Tempo runs, threshold work. Controlled discomfort — one word answers only." },
  { name: "MEDIUM-LONG EFFORT",mi: "~10:30/MI",      km: "~6:31/KM",      color: "#38bdf8", use: "Middle miles of midweek medium-long runs. Steady, not strained." },
  { name: "EASY / ZONE 2",     mi: "11:00–11:45/MI", km: "6:50–7:18/KM",  color: "#4ade80", use: "All easy runs. HR 130–145bpm. Conversational — this is where the engine is built." },
  { name: "LONG RUN EASY",     mi: "11:15–12:00/MI", km: "6:59–7:27/KM",  color: "#a78bfa", use: "Long run base pace. Start the slow end, drift faster only if it stays easy." },
  { name: "STRIDES",           mi: "~7:30–8:00/MI",  km: "~4:40–5:00/KM", color: "#e4e4e7", use: "20-sec controlled surges. Smooth and tall — fast, never frantic. Full recovery between." },
];

const SPLITS = [
  { cp: "5K",     t: "0:30:49" },
  { cp: "10K",    t: "1:01:37" },
  { cp: "15K",    t: "1:32:26" },
  { cp: "HALF",   t: "2:10:00" },
  { cp: "25K",    t: "2:34:03" },
  { cp: "30K",    t: "3:04:52" },
  { cp: "35K",    t: "3:35:40" },
  { cp: "FINISH", t: "4:20:00" },
];

const PRINCIPLES = [
  { title: "DOWN WEEKS", body: "Weeks 4, 8, and 13 cut volume on purpose. Adaptation happens in recovery, not in work. Run them honestly easy — do not backfill miles." },
  { title: "80/20 RULE", body: "Roughly 80% of weekly miles stay at 11:00–11:45/mi or slower. The quality 20% only works if the easy 80% is genuinely easy. Pace ego is the enemy." },
  { title: "NYC HILLS", body: "This course is bridges: Verrazzano (mi 1–2), Pulaski (mi 13), Queensboro (mi 15–16), Willis Ave (mi 20). Hill work from week 3 simulates them. Run hills by effort, not pace." },
  { title: "FUELING", body: "5:20 → 4:20 is won at the aid stations. Gel every 40 min from mile 5, 60–75g carbs/hr at ~93kg, sodium 300–500mg/hr. Every long run is a rehearsal." },
  { title: "TAPER MADNESS", body: "Weeks 14–16 you will feel sluggish, then invincible, then convinced you're injured. All normal. Trust the cut: volume drops, fitness doesn't." },
  { title: "STRIDES", body: "6×20sec at ~7:30–8:00/mi after easy runs keeps the legs elastic during heavy aerobic volume. Smooth acceleration, tall posture, walk-back recovery." },
];

// Common note strings
const REHAB = "Hamstring protocol: Nordic curls 3×8, single-leg RDL 3×10/side, single-leg bridge 3×12, hip flexor stretch 2×45s/side, foam roll posterior chain.";
const HEAT = "Summer NYC: add 30–45 sec/mi when it's above 70°F + humid. Run by effort and HR, not pace — August pace targets are suggestions, not contracts.";

const WEEKS = [
  // ── WEEK 1 ─────────────────────────────────────────────
  { n: 1, ph: "base", mi: 40, lr: 14, dates: "JUL 13–19", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest. First day of the block — start the habits that carry you to November.",
      n: [["REHAB", "Establish the routine now, while the hamstring is quiet: " + REHAB], ["WHOOP", "Note your baseline HRV and resting HR this week — you'll want the reference when load climbs."]] },
    { d: "TUE", t: "easy", l: "Easy", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi (6:50–7:18/km). Fully conversational. If you can't speak in sentences, slow down.",
      n: [["GARMIN", "Zone 2: HR 130–145bpm. Set an HR alert at 150 and obey it."], ["WEATHER", HEAT], ["SHOE", "Glycerin 22 — all easy mileage lives in this shoe."]] },
    { d: "WED", t: "easy", l: "Easy", m: 8, p: "11:00–11:45/MI",
      x: "8mi easy at 11:00–11:45/mi. Longest midweek run of the week — keep it boring and smooth.",
      n: [["HAMSTRING", "Right side check-in mid-run: tightness that warms up is fine; pain that builds is a stop signal."]] },
    { d: "THU", t: "easy", l: "Easy", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi. Soft surface (Prospect Park loop interior paths) if the legs feel the week.",
      n: [] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest, or 30min easy walk/spin. Nothing that counts as training.",
      n: [["REHAB", "Second rehab session of the week: " + REHAB]] },
    { d: "SAT", t: "easy", l: "Easy", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi. Pre-long-run day: keep effort genuinely low and hydrate ahead of tomorrow's heat.",
      n: [["WEATHER", "Pre-hydrate today: July long runs are won the day before."]] },
    { d: "SUN", t: "long", l: "Long Run", m: 14, p: "11:15–12:00/MI",
      x: "14mi at 11:15–12:00/mi (6:59–7:27/km). All easy — the goal is time on feet, not pace. Start at the slow end.",
      n: [["FUEL", "Rehearse from week 1: gel at minutes 40, 80, 120 (~60g carbs/hr; at 93kg target 60–75g/hr). 300–500mg sodium/hr in fluids. Train the gut like a muscle."], ["GARMIN", "Cap HR at ~150. Expect WHOOP strain 14–16 — protect sleep tonight."], ["HAMSTRING", "Longest run in weeks. If the right hamstring tightens late, shorten stride and finish slow rather than pushing through."]], ham: true },
  ]},
  // ── WEEK 2 ─────────────────────────────────────────────
  { n: 2, ph: "base", mi: 42, lr: 15, dates: "JUL 20–26", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest after the first 14-miler.",
      n: [["REHAB", "Day after long run: " + REHAB]] },
    { d: "TUE", t: "easy", l: "Easy + Strides", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi, then 6×20sec strides at ~7:30–8:00/mi with full walk-back recovery. First strides of the block — controlled, not sprinted.",
      n: [["HAMSTRING", "Strides load the hamstring at speed. Build into each one over 5 sec; abort the set at any sharp sensation."], ["GARMIN", "Strides won't register cleanly — judge them by feel, not the watch."]], ham: true },
    { d: "WED", t: "easy", l: "Easy", m: 9, p: "11:00–11:45/MI",
      x: "9mi easy at 11:00–11:45/mi. Volume creeps up — same effort, more minutes.",
      n: [["WEATHER", HEAT]] },
    { d: "THU", t: "easy", l: "Easy", m: 7, p: "11:00–11:45/MI",
      x: "7mi easy at 11:00–11:45/mi.",
      n: [] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest or 30min easy spin.",
      n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi. Short and soft before tomorrow.",
      n: [] },
    { d: "SUN", t: "long", l: "Long Run", m: 15, p: "11:15–12:00/MI",
      x: "15mi at 11:15–12:00/mi. Pick a route with a couple of honest climbs — start meeting hills early.",
      n: [["FUEL", "Gels at min 40, 80, 120 (60–75g carbs/hr at 93kg). Practice your exact race-day brand and flavor."], ["WHOOP", "Check HRV trend this morning — if it's tanked two days running, cut to 12mi without guilt."]], ham: true },
  ]},
  // ── WEEK 3 ─────────────────────────────────────────────
  { n: 3, ph: "base", mi: 45, lr: 16, dates: "JUL 27–AUG 2", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest.",
      n: [["REHAB", "Day after long run: " + REHAB]] },
    { d: "TUE", t: "easy", l: "Easy + Strides", m: 7, p: "11:00–11:45/MI",
      x: "7mi easy at 11:00–11:45/mi + 6×20sec strides at ~7:30–8:00/mi, full recovery.",
      n: [["WEATHER", HEAT]] },
    { d: "WED", t: "mlr", l: "Medium-Long", m: 9, p: "~10:30/MI MID",
      x: "9mi medium-long: 2.5mi easy at 11:00–11:45/mi → middle 4mi comfortably hard at ~10:30/mi (6:31/km) → 2.5mi easy. First structured effort of the block. 'Comfortably hard' means you could hold it for 90 min, not that you want to.",
      n: [["GARMIN", "Middle miles: HR ~148–158. If HR runs hot in the humidity, hold effort and let pace drift."], ["HAMSTRING", "First sustained effort — warm up the right side properly: leg swings + 3×30m build-ups before the middle block."]], ham: true },
    { d: "THU", t: "quality", l: "Hills", m: 6, p: "EFFORT-BASED",
      x: "6mi with hills: 2mi easy warm-up, then 6×45sec uphill at strong effort (roughly 5K effort, pace irrelevant), jog down recovery, 2mi easy cool-down. This is Queensboro Bridge rehearsal — NYC is a bridge race.",
      n: [["COURSE", "Run the climbs tall with short quick steps; run the descents relaxed. That's exactly the Verrazzano and Queensboro skill."], ["HAMSTRING", "Uphill running is hamstring-friendly; downhill is not. Float the downhills, don't brake hard."]], ham: true },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", "Day after hills: " + REHAB]] },
    { d: "SAT", t: "easy", l: "Easy", m: 7, p: "11:00–11:45/MI",
      x: "7mi easy at 11:00–11:45/mi.",
      n: [] },
    { d: "SUN", t: "long", l: "Long Run", m: 16, p: "11:15–12:00/MI",
      x: "16mi at 11:15–12:00/mi. Biggest run of the base phase. All easy, finish feeling like you had 3 more in you.",
      n: [["FUEL", "Gels at min 40, 80, 120, 160 (60–75g/hr). Carry or plan fluid stops — August heat makes this a hydration rehearsal too."], ["GARMIN", "HR cap ~150. WHOOP strain will hit 16–18; plan a quiet evening and 8h+ sleep."], ["HAMSTRING", "16mi at base mileage warrants attention — any right-side soreness that lasts into Monday means we hold long run distance next build week."]], ham: true },
  ]},
  // ── WEEK 4 — DOWN ──────────────────────────────────────
  { n: 4, ph: "base", mi: 35, lr: 12, dates: "AUG 3–9", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest. Down week begins — this is where weeks 1–3 become fitness.",
      n: [["REHAB", REHAB]] },
    { d: "TUE", t: "easy", l: "Easy + Strides", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi + 6×20sec strides at ~7:30–8:00/mi.",
      n: [] },
    { d: "WED", t: "mlr", l: "Medium-Long", m: 7, p: "~10:30/MI MID",
      x: "7mi medium-long: 2mi easy → middle 3mi at ~10:30/mi → 2mi easy. Reduced version — keep the rhythm, cut the dose.",
      n: [["GARMIN", "Middle miles HR ~148–158."]] },
    { d: "THU", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.",
      n: [] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB], ["WHOOP", "Down week = recovery audit. HRV should climb back above baseline by Sunday. If it doesn't, the next block starts conservative."]] },
    { d: "SAT", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.",
      n: [] },
    { d: "SUN", t: "long", l: "Long Run", m: 12, p: "11:15–12:00/MI",
      x: "12mi at 11:15–12:00/mi. Should feel almost insultingly comfortable. That's the point.",
      n: [["FUEL", "Still fuel it: gels at min 40, 80. Down weeks don't pause gut training."]] },
  ]},
  // ── WEEK 5 — QUALITY BEGINS ────────────────────────────
  { n: 5, ph: "quality", mi: 46, lr: 18, dates: "AUG 10–16", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest before the first true quality session of the block.",
      n: [["REHAB", REHAB]] },
    { d: "TUE", t: "quality", l: "Tempo 5mi", m: 7, p: "9:05–9:15/MI",
      x: "7mi total: 1mi easy warm-up → 5mi tempo at 9:05–9:15/mi (5:39–5:45/km) → 1mi easy cool-down. Tempo is controlled discomfort: you could answer a question in one word, not a sentence. Do not race it.",
      n: [["GARMIN", "Tempo HR ~155–165. In August heat, prioritize the HR band over the pace band — 9:20–9:30/mi at correct effort still counts."], ["HAMSTRING", "First sustained fast running of the block. Extended warm-up: leg swings, A-skips, 4×20sec build-ups before the tempo. Any pulling sensation → convert to easy miles, we lose nothing."], ["WHOOP", "Check recovery score this morning. Red recovery → swap this session with Thursday's MLR."]], ham: true },
    { d: "WED", t: "easy", l: "Easy", m: 6, p: "11:00–11:45/MI",
      x: "6mi recovery-easy at 11:00–11:45/mi. Slower is smarter today.",
      n: [["REHAB", "Day after quality: " + REHAB]] },
    { d: "THU", t: "mlr", l: "Medium-Long", m: 9, p: "~10:30/MI MID",
      x: "9mi medium-long: 2.5mi easy → 4mi at ~10:30/mi → 2.5mi easy.",
      n: [["GARMIN", "Middle miles HR ~148–158."]] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy + Strides", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi + 6×20sec strides at ~7:30–8:00/mi.",
      n: [] },
    { d: "SUN", t: "long", l: "Long Run", m: 18, p: "11:15–12:00/MI",
      x: "18mi at 11:15–12:00/mi, all easy. New distance high for the block — patience for 18 miles is the workout.",
      n: [["FUEL", "Full race rehearsal: gel every 40min from min 40 (4–5 gels, 60–75g carbs/hr at 93kg), 300–500mg sodium/hr. Eat your planned race breakfast 2.5h before."], ["GARMIN", "HR cap ~150. Expect WHOOP strain 17–19."], ["HAMSTRING", "Highest-volume week yet ending in the longest run yet. Amber day: warm up walking 5min, start at 12:00/mi, and bail to 15mi if the right side talks."]], ham: true },
  ]},
  // ── WEEK 6 ─────────────────────────────────────────────
  { n: 6, ph: "quality", mi: 48, lr: 18, dates: "AUG 17–23", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest.",
      n: [["REHAB", "Day after long run: " + REHAB]] },
    { d: "TUE", t: "quality", l: "3×3mi @ MP", m: 11, p: "9:55/MI",
      x: "11mi total: 1mi easy warm-up → 3×3mi at marathon pace 9:55/mi (6:09/km) with 0.5mi easy float between → 0.5mi cool-down. First MP session — learn the feel of 9:55 until you can hit it blindfolded.",
      n: [["GARMIN", "MP HR ~150–160. Set a 9:55 pace alert; the skill is metronomic, not fast."], ["HAMSTRING", "Long quality day. Full warm-up routine, and keep the floats genuinely easy — that's where the hamstring recovers."], ["WEATHER", HEAT]], ham: true },
    { d: "WED", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi recovery-easy at 11:00–11:45/mi.",
      n: [["REHAB", "Day after quality: " + REHAB]] },
    { d: "THU", t: "mlr", l: "Medium-Long", m: 9, p: "~10:30/MI MID",
      x: "9mi medium-long: 2.5mi easy → 4mi at ~10:30/mi → 2.5mi easy.",
      n: [] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.",
      n: [] },
    { d: "SUN", t: "long", l: "Long Run, Last 4 @ MP", m: 18, p: "11:15–12:00 → 9:55/MI",
      x: "18mi: first 14 at 11:15–12:00/mi, last 4mi at marathon pace 9:55/mi. First MP finish — running race pace on tired legs is the single most race-specific thing in this plan.",
      n: [["FUEL", "Gel every 40min from min 40 (60–75g/hr at 93kg). Take the last gel BEFORE the MP block — fueling the finish is the race-day skill."], ["COURSE", "Visualize First Avenue here: tired legs, crowd energy, hold 9:55 and not a second faster."], ["HAMSTRING", "MP on fatigued legs is the highest hamstring demand yet. If form breaks (sitting, overstriding), end the MP block early."], ["GARMIN", "MP segment HR ~155–165 on tired legs is normal — don't panic at the drift."]], ham: true },
  ]},
  // ── WEEK 7 ─────────────────────────────────────────────
  { n: 7, ph: "quality", mi: 50, lr: 19, dates: "AUG 24–30", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest. First 50-mile week begins.",
      n: [["REHAB", "Day after MP long run: " + REHAB], ["WHOOP", "Watch HRV closely this week — first time at 50mi. Two consecutive deeply-red mornings = convert a run to rest."]] },
    { d: "TUE", t: "quality", l: "Tempo 6mi", m: 8, p: "9:05–9:15/MI",
      x: "8mi total: 1mi easy warm-up → 6mi tempo at 9:05–9:15/mi → 1mi easy cool-down. Tempo grows from 5 to 6 miles. Same controlled discomfort, longer hold.",
      n: [["GARMIN", "HR ~155–165. Effort over pace in the heat."], ["HAMSTRING", "Full pre-quality warm-up, no exceptions at this volume."]], ham: true },
    { d: "WED", t: "easy", l: "Easy", m: 7, p: "11:00–11:45/MI",
      x: "7mi recovery-easy at 11:00–11:45/mi.",
      n: [["REHAB", "Day after quality: " + REHAB]] },
    { d: "THU", t: "mlr", l: "Medium-Long", m: 10, p: "~10:30/MI MID",
      x: "10mi medium-long: 2.5mi easy → 5mi at ~10:30/mi → 2.5mi easy. The MLR is your quiet superpower — aerobic strength without recovery cost.",
      n: [["HAMSTRING", "10mi midweek is real load. Amber check: any asymmetry in stride late in the run is the early warning."]], ham: true },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy + Strides", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi + 6×20sec strides at ~7:30–8:00/mi.",
      n: [] },
    { d: "SUN", t: "long", l: "Long Run", m: 19, p: "11:15–12:00/MI",
      x: "19mi at 11:15–12:00/mi, all easy. Pure time on feet to cap the 50-mile week.",
      n: [["FUEL", "Gel every 40min (5 gels, 60–75g/hr). Test your race-day carry system — belt, vest, or pockets — exactly as you'll run NYC."], ["GARMIN", "HR cap ~150. WHOOP strain 18+; this is your biggest training day so far. Sleep is the workout tonight."]], ham: true },
  ]},
  // ── WEEK 8 — DOWN ──────────────────────────────────────
  { n: 8, ph: "quality", mi: 38, lr: 14, dates: "AUG 31–SEP 6", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest. Down week — absorb the 50-mile block.",
      n: [["REHAB", REHAB]] },
    { d: "TUE", t: "quality", l: "4×2mi @ MP", m: 10, p: "9:55/MI",
      x: "10mi total: 1mi easy warm-up → 4×2mi at marathon pace 9:55/mi with 0.25mi easy float between → ~0.25mi cool-down. Shorter reps, same pace discipline. Every rep within 5 sec of 9:55.",
      n: [["GARMIN", "MP HR ~150–160. September air arrives — pace targets get honest again."], ["HAMSTRING", "Quality stays during down weeks, but with margin. Full warm-up."]], ham: true },
    { d: "WED", t: "easy", l: "Easy", m: 4, p: "11:00–11:45/MI",
      x: "4mi recovery-easy at 11:00–11:45/mi.",
      n: [["REHAB", "Day after quality: " + REHAB]] },
    { d: "THU", t: "mlr", l: "Medium-Long", m: 7, p: "~10:30/MI MID",
      x: "7mi medium-long: 2mi easy → 3mi at ~10:30/mi → 2mi easy.",
      n: [] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB], ["WHOOP", "Recovery audit: HRV should rebound above baseline before week 9's 20-miler."]] },
    { d: "SAT", t: "easy", l: "Easy", m: 3, p: "11:00–11:45/MI",
      x: "3mi very easy at 11:00–11:45/mi.",
      n: [] },
    { d: "SUN", t: "long", l: "Long Run, Last 3 @ MP", m: 14, p: "11:15–12:00 → 9:55/MI",
      x: "14mi: first 11 at 11:15–12:00/mi, last 3mi at marathon pace 9:55/mi. Reduced long run, but keep the MP touch.",
      n: [["FUEL", "Gels at min 40, 80, 120. Fuel before the MP finish."], ["HAMSTRING", "If anything has lingered through the down week, this MP finish is the first thing to drop — easy 14 is a fine outcome."]], ham: true },
  ]},
  // ── WEEK 9 ─────────────────────────────────────────────
  { n: 9, ph: "quality", mi: 52, lr: 20, dates: "SEP 7–13", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest. Big build week — the first 20-miler waits at the end of it.",
      n: [["REHAB", REHAB]] },
    { d: "TUE", t: "quality", l: "Tempo 6mi", m: 8, p: "9:05–9:15/MI",
      x: "8mi total: 1mi easy warm-up → 6mi tempo at 9:05–9:15/mi (5:39–5:45/km) → 1mi easy cool-down. Fall air starts to arrive — tempo should feel noticeably smoother than August.",
      n: [["GARMIN", "HR ~155–165. If pace comes easier at the same HR than 4 weeks ago, that's the fitness showing up on schedule."], ["HAMSTRING", "Full warm-up routine before the tempo."]], ham: true },
    { d: "WED", t: "easy", l: "Easy", m: 7, p: "11:00–11:45/MI",
      x: "7mi recovery-easy at 11:00–11:45/mi.",
      n: [["REHAB", "Day after quality: " + REHAB]] },
    { d: "THU", t: "mlr", l: "Medium-Long", m: 10, p: "~10:30/MI MID",
      x: "10mi medium-long: 2.5mi easy → 5mi at ~10:30/mi (6:31/km) → 2.5mi easy.",
      n: [["HAMSTRING", "High-volume week. Watch for late-run stride asymmetry."]], ham: true },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy + Strides", m: 7, p: "11:00–11:45/MI",
      x: "7mi easy at 11:00–11:45/mi + 6×20sec strides at ~7:30–8:00/mi.",
      n: [["FUEL", "Carb-load lite tomorrow morning: treat the 20-miler breakfast as a full race rehearsal, eaten 2.5h out."]] },
    { d: "SUN", t: "long", l: "FIRST 20-MILER", m: 20, p: "11:15–12:00/MI",
      x: "20mi at 11:15–12:00/mi, ALL easy. The milestone run. No pace goals, no MP finish — just cover the distance with patience and a working fueling plan. Finishing this changes what you believe about November.",
      n: [["FUEL", "Full dress rehearsal: gel every 40min from min 40 (5–6 gels, 60–75g carbs/hr at 93kg), 300–500mg sodium/hr, race breakfast, race kit."], ["GARMIN", "HR cap ~150. This is likely a 3:50–4:00 effort — longer than any training run you've done. WHOOP strain will max out; plan nothing for tonight."], ["HAMSTRING", "Peak-distance amber day. Start at 12:00/mi for 3 miles minimum. Walk breaks at aid-station rhythm (every 40min, 30sec) are legal and smart."], ["COURSE", "Last 5 miles, practice the mile-21+ mindset: shorten the run to the next landmark, not the finish."]], ham: true },
  ]},
  // ── WEEK 10 ────────────────────────────────────────────
  { n: 10, ph: "quality", mi: 52, lr: 19, dates: "SEP 14–20", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest after the 20-miler. Expect heavy legs — that's adaptation knocking.",
      n: [["REHAB", "Non-negotiable today: " + REHAB], ["WHOOP", "HRV may stay suppressed 48h after the 20-miler. Normal. Three+ days = flag."]] },
    { d: "TUE", t: "quality", l: "4×2mi @ MP", m: 10, p: "9:55/MI",
      x: "10mi total: 1mi easy warm-up → 4×2mi at marathon pace 9:55/mi (6:09/km) with 0.25mi floats → ~0.25mi cool-down. Run these on still-tired legs deliberately — race-specific fatigue resistance.",
      n: [["GARMIN", "MP HR ~150–160. Reps should be boringly identical: 9:50–10:00 window, no heroes."], ["HAMSTRING", "Quality 2 days after a 20-miler is the riskiest pairing in the plan. Extended warm-up; first rep starts at 10:10 and works down."]], ham: true },
    { d: "WED", t: "easy", l: "Easy", m: 6, p: "11:00–11:45/MI",
      x: "6mi recovery-easy at 11:00–11:45/mi.",
      n: [["REHAB", "Day after quality: " + REHAB]] },
    { d: "THU", t: "mlr", l: "Medium-Long", m: 10, p: "~10:30/MI MID",
      x: "10mi medium-long: 2.5mi easy → 5mi at ~10:30/mi → 2.5mi easy.",
      n: [], ham: true },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy", m: 7, p: "11:00–11:45/MI",
      x: "7mi easy at 11:00–11:45/mi. Genuinely easy — tomorrow is the hardest long run of the cycle.",
      n: [["FUEL", "Pre-load: extra carbs at dinner, hydrate through the day."]] },
    { d: "SUN", t: "long", l: "Long Run, Last 6 @ MP", m: 19, p: "11:15–12:00 → 9:55/MI",
      x: "19mi: first 13 at 11:15–12:00/mi, last 6mi at marathon pace 9:55/mi. Peak quality long run of the Quality phase. Six miles at 9:55 on 13 miles of fatigue is the closest rehearsal of miles 20–26 you'll get before Peak phase.",
      n: [["FUEL", "Gel every 40min; take one ~10min before the MP block starts. This is the exact race skill: fueling INTO the hard part."], ["COURSE", "Mentally place the MP block on First Ave → Willis Ave → Fifth Ave. Hold 9:55 when it feels good (First Ave trap) and when it doesn't (the Bronx)."], ["HAMSTRING", "Highest-demand long run yet. Form check every MP mile: tall hips, quick cadence. Sitting into the stride = end the block."], ["GARMIN", "MP-on-fatigue HR 158–168 is acceptable here. WHOOP strain ~19+."]], ham: true },
  ]},
  // ── WEEK 11 — PEAK ─────────────────────────────────────
  { n: 11, ph: "peak", mi: 55, lr: 20, dates: "SEP 21–27", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest. Peak phase: three weeks of the highest, most specific work in the plan.",
      n: [["REHAB", "Peak phase rule: rehab happens every Mon + Fri without exception. " + REHAB]] },
    { d: "TUE", t: "quality", l: "8mi Continuous @ MP", m: 10, p: "9:55/MI",
      x: "10mi total: 1mi easy warm-up → 8mi CONTINUOUS at marathon pace 9:55/mi (6:09/km) → 1mi easy cool-down. The capstone MP session. No floats, no breaks — 8 unbroken miles at race rhythm. If you finish this controlled, sub-4:20 is no longer a hope, it's a plan.",
      n: [["GARMIN", "Lock 9:55 alerts. HR should sit ~150–160 and drift to ~165 late — that drift profile is exactly race day."], ["HAMSTRING", "Longest continuous fast running of the block. Extended warm-up, and treat any sharp signal as a full stop — we're 6 weeks out, protect the asset."], ["WHOOP", "Only attempt on a yellow/green recovery. Red morning → push to Thursday, swap the MLR here."]], ham: true },
    { d: "WED", t: "easy", l: "Easy", m: 7, p: "11:00–11:45/MI",
      x: "7mi recovery-easy at 11:00–11:45/mi. Slowest pace of the week, on purpose.",
      n: [["REHAB", "Day after the 8-miler: " + REHAB]] },
    { d: "THU", t: "mlr", l: "Medium-Long", m: 10, p: "~10:30/MI MID",
      x: "10mi medium-long: 2.5mi easy → 5mi at ~10:30/mi → 2.5mi easy.",
      n: [["HAMSTRING", "Peak-volume amber: third hard-ish day this week. Downgrade middle miles to easy if the right side is loud."]], ham: true },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy + Strides", m: 8, p: "11:00–11:45/MI",
      x: "8mi easy at 11:00–11:45/mi + 6×20sec strides at ~7:30–8:00/mi.",
      n: [] },
    { d: "SUN", t: "long", l: "Long Run, Last 4 @ MP", m: 20, p: "11:15–12:00 → 9:55/MI",
      x: "20mi: first 16 at 11:15–12:00/mi, last 4mi at marathon pace 9:55/mi. Second 20-miler — this time with a race-pace finish.",
      n: [["FUEL", "Locked-in protocol now: gel every 40min from min 40, 60–75g/hr, sodium 300–500mg/hr. Zero experiments from here to race day."], ["GARMIN", "WHOOP strain ceiling week: ~19–20 today. Next week's 21-miler depends on how you recover from this one."], ["HAMSTRING", "Biggest week of the year. Any Monday soreness that isn't gone by Wednesday → week 12 long run drops to 18."], ["COURSE", "Practice the Queensboro discipline in miles 14–16 of this run: ease the effort on any climb, make the time back on flat, never surge."]], ham: true },
  ]},
  // ── WEEK 12 ────────────────────────────────────────────
  { n: 12, ph: "peak", mi: 55, lr: 21, dates: "SEP 28–OCT 4", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest.",
      n: [["REHAB", REHAB]] },
    { d: "TUE", t: "quality", l: "Tempo 7mi", m: 9, p: "9:05–9:15/MI",
      x: "9mi total: 1mi easy warm-up → 7mi tempo at 9:05–9:15/mi (5:39–5:45/km) → 1mi easy cool-down. Longest tempo of the cycle. October air, peak fitness — this should feel strong, not desperate.",
      n: [["GARMIN", "HR ~155–165. Seven miles 50 sec/mi faster than goal pace builds the buffer that makes 9:55 feel sustainable."], ["HAMSTRING", "Full warm-up. Peak phase = zero tolerance for pushing through sharp signals."]], ham: true },
    { d: "WED", t: "easy", l: "Easy", m: 7, p: "11:00–11:45/MI",
      x: "7mi recovery-easy at 11:00–11:45/mi.",
      n: [["REHAB", "Day after quality: " + REHAB]] },
    { d: "THU", t: "mlr", l: "Medium-Long", m: 10, p: "~10:30/MI MID",
      x: "10mi medium-long: 2.5mi easy → 5mi at ~10:30/mi → 2.5mi easy. Last full-size MLR of the cycle.",
      n: [], ham: true },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB], ["FUEL", "Begin tomorrow's pre-load: extra carbs Fri dinner + Sat all day ahead of the 21-miler."]] },
    { d: "SAT", t: "easy", l: "Easy", m: 8, p: "11:00–11:45/MI",
      x: "8mi easy at 11:00–11:45/mi. Conserve — tomorrow is the longest run of the entire cycle.",
      n: [] },
    { d: "SUN", t: "long", l: "21-MILER, Last 6 @ MP", m: 21, p: "11:15–12:00 → 9:55/MI",
      x: "21mi: first 15 at 11:15–12:00/mi, last 6mi at marathon pace 9:55/mi. THE run of the cycle — longest distance, biggest MP finish, five weeks out. Execute it like race day in every detail: kit, breakfast, gels, pacing discipline.",
      n: [["FUEL", "6 gels: minutes 40/80/120/160/200 + one 10min before the MP block. 60–75g carbs/hr at 93kg. This is the fueling dress rehearsal — what works today is the race plan, full stop."], ["COURSE", "Run the MP block as miles 20.2–26.2 in your head: Willis Ave, the quiet Bronx miles, Fifth Ave's false flat, the rollers in Central Park. The 5:20 marathon broke on fueling and pacing — today proves both are fixed."], ["HAMSTRING", "Single biggest demand of the block. Pre-run: full warm-up + 5min walk. If the hamstring protests in the first 5 miles, today becomes an easy 16 and that's a successful day."], ["GARMIN", "WHOOP strain will peak for the year. Take Monday AND treat next week's down-shift as sacred."]], ham: true },
  ]},
  // ── WEEK 13 — DOWN / SHARPEN ───────────────────────────
  { n: 13, ph: "peak", mi: 45, lr: 17, dates: "OCT 5–11", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest after the 21-miler. Volume steps down; sharpness stays.",
      n: [["REHAB", REHAB], ["WHOOP", "Expect 2–3 days of suppressed HRV after the 21-miler. Sleep 8h+, easy on alcohol, let it rebound."]] },
    { d: "TUE", t: "easy", l: "Easy", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi. Quality moves to Wednesday this week to add recovery after the 21-miler.",
      n: [] },
    { d: "WED", t: "quality", l: "3×2mi @ MP", m: 8, p: "9:55/MI",
      x: "8mi total: 1mi easy warm-up → 3×2mi at marathon pace 9:55/mi with 0.25mi floats → ~0.5mi cool-down. Maintenance dose — keep the 9:55 rhythm grooved without digging a hole.",
      n: [["GARMIN", "MP HR ~150–160. These should feel almost easy now. If they don't, flag it — we taper harder, not train harder."], ["HAMSTRING", "Post-21-miler week: warm up long, keep floats slow."]], ham: true },
    { d: "THU", t: "mlr", l: "Medium-Long", m: 8, p: "~10:30/MI MID",
      x: "8mi medium-long: 2mi easy → 4mi at ~10:30/mi → 2mi easy.",
      n: [["REHAB", "Day after quality: " + REHAB]] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy + Strides", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi + 6×20sec strides at ~7:30–8:00/mi.",
      n: [] },
    { d: "SUN", t: "long", l: "Long Run", m: 17, p: "11:15–12:00/MI",
      x: "17mi at 11:15–12:00/mi, all easy. Last big-volume long run. Enjoy it — the hardest work of the cycle is now behind you.",
      n: [["FUEL", "Standard protocol: gel every 40min, 60–75g/hr. Routine by now — that's the point."], ["GARMIN", "HR cap ~150. Notice how much easier 17 feels than week 3's 16. That delta is your race."]], ham: true },
  ]},
  // ── WEEK 14 — TAPER ────────────────────────────────────
  { n: 14, ph: "taper", mi: 38, lr: 14, dates: "OCT 12–18", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest. Taper begins. The work is done; from here we shed fatigue while keeping the engine warm.",
      n: [["REHAB", "Rehab continues through taper — fresh muscles still need the protocol. " + REHAB]] },
    { d: "TUE", t: "quality", l: "2×2mi @ MP", m: 7, p: "9:55/MI",
      x: "7mi total: 1.5mi easy warm-up → 2×2mi at marathon pace 9:55/mi with 0.25mi float → ~1.25mi cool-down. Reduced dose, full crispness.",
      n: [["GARMIN", "MP HR ~150–158 on fresher legs. 9:55 should feel suspiciously comfortable. Good."], ["SHOE", "Still in the Glycerin 22 today — the SC Elite v5 debuts Sunday."]], ham: true },
    { d: "WED", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.",
      n: [["REHAB", "Day after quality: " + REHAB]] },
    { d: "THU", t: "easy", l: "Easy", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi. No more MLRs — taper trades volume for freshness.",
      n: [] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy + Strides", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi + 6×20sec strides at ~7:30–8:00/mi.",
      n: [] },
    { d: "SUN", t: "long", l: "Last MP Long Run — SC ELITE v5 DEBUT", m: 14, p: "11:15–12:00 → 9:55/MI",
      x: "14mi: first 10 at 11:15–12:00/mi, last 4mi at marathon pace 9:55/mi. Final long run with an MP finish — and the first run in the New Balance SC Elite v5 2E. Carbon plate introduction step 1 of 3.",
      n: [["SHOE", "SC Elite v5 debut. Expect the plate to change your stride: more forefoot, more calf/Achilles load, MP will feel cheaper. Lace them exactly as you will on race day. Any hotspot or rub = sort it NOW, not Nov 1."], ["HAMSTRING", "New shoe + MP finish = altered mechanics. Amber day: ease into the MP block over the first half mile and monitor the right side closely."], ["FUEL", "Standard protocol, race brand only. Gels at min 40, 80, 120 + pre-MP."], ["GARMIN", "Note the pace-vs-HR delta in the v5 — most runners see 5–10 sec/mi 'free' at the same HR. That's your race-day margin."]], ham: true },
  ]},
  // ── WEEK 15 ────────────────────────────────────────────
  { n: 15, ph: "taper", mi: 28, lr: 7, dates: "OCT 19–25", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest. Two weeks out. Feeling flat or weirdly tired is normal taper physiology — ignore it.",
      n: [["REHAB", REHAB]] },
    { d: "TUE", t: "quality", l: "4mi @ MP — SC Elite v5", m: 6, p: "9:55/MI",
      x: "6mi total: 1mi easy warm-up → 4mi continuous at marathon pace 9:55/mi → 1mi easy cool-down. LAST quality session of the cycle, run in the SC Elite v5. Carbon plate introduction step 2 of 3.",
      n: [["SHOE", "Second run in the v5, first sustained MP block in them. Confirm fit, lacing, and sock choice — this is the final shoe rehearsal at race pace."], ["GARMIN", "MP HR ~148–158 on tapered legs. If 9:55 feels easy and HR sits low, do NOT bank a faster session. Park it for Nov 1."], ["HAMSTRING", "Last hard day. Get through it clean and the hamstring has made it."]], ham: true },
    { d: "WED", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.",
      n: [["REHAB", "Day after quality: " + REHAB]] },
    { d: "THU", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.",
      n: [] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest.",
      n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy + Strides", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi + 6×20sec strides at ~7:30–8:00/mi. Back in the Glycerin 22 — save the v5 for race week.",
      n: [["SHOE", "Glycerin 22 for all remaining easy runs. The v5 comes back out for the Saturday shakeout and the race."]] },
    { d: "SUN", t: "long", l: "Short Long Run", m: 7, p: "11:15–12:00/MI",
      x: "7mi at 11:15–12:00/mi. One week out. Easy rhythm, nothing to prove.",
      n: [["FUEL", "Start sketching race-week nutrition: normal eating through Wednesday, carb emphasis Thu–Sat (target ~8g/kg ≈ 700–750g on peak day Saturday — you've run a successful 800–900g load before; race-day morning: 100–150g, 2.5–3h out)."], ["WHOOP", "HRV should be trending at or above season baseline now. If it is, you're peaking on schedule."]] },
  ]},
  // ── WEEK 16 — RACE WEEK ────────────────────────────────
  { n: 16, ph: "taper", mi: 14, lr: 26.2, dates: "OCT 26–NOV 1", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Full rest. Race week. Logistics mode: confirm expo plan, ferry/bus to Staten Island, kit checklist, gel count (carry 6–7).",
      n: [["REHAB", "Light version only this week: hip flexor stretch, easy foam roll. No Nordics past Tuesday — nothing that creates soreness."], ["COURSE", "Study the course map once more: Verrazzano (mi 1–2), Pulaski (mi 13), Queensboro (mi 15–16), First Ave (mi 16–18), Willis Ave (mi 20), Fifth Ave grind (mi 22–23), Central Park rollers to the finish."]] },
    { d: "TUE", t: "easy", l: "Easy + Strides", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi + 4×20sec strides at ~7:30–8:00/mi. Last strides — keep the legs awake.",
      n: [["GARMIN", "Resting HR and HRV should look like the best numbers of the season. Screenshot them; that's the proof the taper worked."]] },
    { d: "WED", t: "easy", l: "Easy", m: 4, p: "11:00–11:45/MI",
      x: "4mi easy at 11:00–11:45/mi.",
      n: [["FUEL", "Carb emphasis begins Thursday. Hydrate normally; reduce fiber from Friday."]] },
    { d: "THU", t: "easy", l: "Easy", m: 3, p: "11:00–11:45/MI",
      x: "3mi very easy at 11:00–11:45/mi.",
      n: [["FUEL", "Carb-load day 1 of 3: bias every meal toward carbs. Peak load Saturday (~700–750g at 93kg). Familiar foods only — bagels, rice, pasta. You know this drill from the half."]] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest. Expo pickup if not done. Lay out full race kit tonight: bib, v5s, gels, throwaway warm layer for the Fort Wadsworth start village.",
      n: [["FUEL", "Carb-load day 2. Big lunch, normal dinner, low fiber, salt your food."]] },
    { d: "SAT", t: "easy", l: "Shakeout — SC Elite v5", m: 2, p: "EASY + 2×20S",
      x: "2mi shakeout at easy effort in the SC Elite v5 + 2×20sec light pickups. Carbon plate introduction step 3 of 3 — final systems check. Then get off your feet for the rest of the day.",
      n: [["SHOE", "v5s on, exact race socks and lacing. After this run they don't come off the shelf until the start corral."], ["FUEL", "Peak carb day: ~700–750g spread across the day, dinner by 7pm, nothing new. Alarm set, gear staged, early night — the race is won tonight as much as tomorrow."]] },
    { d: "SUN", t: "race", l: "NYC MARATHON", m: 26.2, p: "SUB-4:20",
      x: "RACE DAY — Nov 1, 2026. The plan: miles 1–10 at 10:05–10:10/mi (controlled, bank energy — NOT time), miles 11–20 settle into 9:55/mi, miles 21–26.2 whatever you have. The fitness decides the last 10K; your job is to arrive there with the fitness intact. Gel every 40min from mile 5. 5:20 was pacing and fueling. 4:19:xx is discipline.",
      n: [["COURSE", "Verrazzano mi 1–2: the bridge eats people — uphill mile 1, do not surge the downhill mile 2. Queensboro mi 15–16: silent, steep, stay controlled, the crowd wall on the other side is your reward. First Ave mi 16–18: the surge trap — 200,000 people will try to make you run 9:20. Don't. Willis Ave mi 20: short, sharp, then the quiet Bronx mile — this is where the race begins."], ["FUEL", "Breakfast 100–150g carbs, 2.5–3h before your wave. Gels at miles 5, 9, 13, 17, 21, 24 (≈ every 40min at goal pace). Sip at every aid station from mile 3; alternate water/Gatorade."], ["GARMIN", "First 10 miles: HR ≤ 155 no matter what the pace says. GPS lies in Manhattan canyons — run the tangents and trust effort over instant pace from mile 16 on."], ["SHOE", "SC Elite v5, broken in across exactly 3 runs. Trust the plate late — it's worth the most at mile 22."]] },
  ]},
];

// ───────────────────────────────────────────────────────────────
// RAMP WEEKS — return-to-running build, Jun 8 → Jul 12
// Bridges from this weekend's kickoff to the 40mi block start.
// ───────────────────────────────────────────────────────────────

const RAMP_REST = (extra) => ({ d: "", t: "rest", l: "Rest", m: 0, p: "—", x: extra || "Rest.", n: [] });

const RAMP_WEEKS = [
  // ── RAMP 1 — KICKOFF WEEKEND ──
  { id: "R1", n: 0, ph: "ramp", mi: 9, lr: 5, dates: "JUN 8–14", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Prep week — running starts Saturday. Use the downtime to set up: charge the Forerunner, check the Glycerin 22 mileage (replace if past ~400mi), and stock gels for the block.",
      n: [["REHAB", "Start the protocol before the running does: " + REHAB]] },
    { d: "TUE", t: "rest", l: "Rest", m: 0, p: "—", x: "Rest. Optional 20–30min walk.", n: [] },
    { d: "WED", t: "rest", l: "Rest", m: 0, p: "—", x: "Rest.", n: [["REHAB", REHAB]] },
    { d: "THU", t: "rest", l: "Rest", m: 0, p: "—", x: "Rest. Optional 20–30min walk or easy spin.", n: [] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest. Lay out kit for tomorrow — the first run of a marathon build deserves a little ceremony.",
      n: [["WHOOP", "Note this week's resting HR and HRV — this is your true season baseline, measured fresh."]] },
    { d: "SAT", t: "easy", l: "First Run", m: 4, p: "11:00–11:45/MI",
      x: "4mi easy at 11:00–11:45/mi (6:50–7:18/km). The first run back. Slower than feels necessary — the goal today is to finish wanting more, not to test anything.",
      n: [["HAMSTRING", "First run after time off is when old issues reintroduce themselves. 5min brisk walk before, and if the right hamstring says anything beyond 'hello', stop at 3."], ["GARMIN", "Zone 2: HR 130–145bpm. Expect pace to be slow for the HR after time off — that gap closes fast, don't chase it."]], ham: true },
    { d: "SUN", t: "long", l: "Long-ish Run", m: 5, p: "11:15–12:00/MI",
      x: "5mi at 11:15–12:00/mi. Back-to-back days right away, gently — the weekend double is the rhythm of the whole build.",
      n: [["WEATHER", "June heat is already real: morning runs, " + HEAT.charAt(0).toLowerCase() + HEAT.slice(1)]] },
  ]},
  // ── RAMP 2 ──
  { id: "R2", n: 0, ph: "ramp", mi: 25, lr: 8, dates: "JUN 15–21", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—", x: "Rest. First full week begins tomorrow — 25 miles, all easy.",
      n: [["REHAB", REHAB]] },
    { d: "TUE", t: "easy", l: "Easy", m: 4, p: "11:00–11:45/MI",
      x: "4mi easy at 11:00–11:45/mi. Fully conversational.",
      n: [["GARMIN", "Zone 2: HR 130–145bpm."]] },
    { d: "WED", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.",
      n: [["HAMSTRING", "Week one of real volume — any right-side stiffness should warm up and disappear by mile 1. Track it."]], ham: true },
    { d: "THU", t: "easy", l: "Easy", m: 4, p: "11:00–11:45/MI",
      x: "4mi easy at 11:00–11:45/mi. Soft surface if available.",
      n: [] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—", x: "Rest.", n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy", m: 4, p: "11:00–11:45/MI",
      x: "4mi easy at 11:00–11:45/mi.",
      n: [] },
    { d: "SUN", t: "long", l: "Long Run", m: 8, p: "11:15–12:00/MI",
      x: "8mi at 11:15–12:00/mi. First long run of the season. Easy rhythm, no agenda.",
      n: [["FUEL", "Start the gut training immediately: one gel at min 40 even though you don't need it yet. By July it's automatic."], ["WEATHER", HEAT]] },
  ]},
  // ── RAMP 3 ──
  { id: "R3", n: 0, ph: "ramp", mi: 28, lr: 9, dates: "JUN 22–28", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—", x: "Rest.", n: [["REHAB", REHAB]] },
    { d: "TUE", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.", n: [] },
    { d: "WED", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.", n: [] },
    { d: "THU", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.",
      n: [["WHOOP", "Two weeks in — HRV should be stabilizing at the new load. A steady downtrend means the easy pace isn't easy enough."]] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—", x: "Rest.", n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy", m: 4, p: "11:00–11:45/MI",
      x: "4mi easy at 11:00–11:45/mi.", n: [] },
    { d: "SUN", t: "long", l: "Long Run", m: 9, p: "11:15–12:00/MI",
      x: "9mi at 11:15–12:00/mi. Long run creeps up a mile a week through the ramp.",
      n: [["FUEL", "Gels at min 40 and 80. Practice the carry."], ["HAMSTRING", "Long run growing — keep the pre-run walk and the post-run protocol consistent."]], ham: true },
  ]},
  // ── RAMP 4 ──
  { id: "R4", n: 0, ph: "ramp", mi: 31, lr: 10, dates: "JUN 29–JUL 5", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—", x: "Rest.", n: [["REHAB", REHAB]] },
    { d: "TUE", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.", n: [] },
    { d: "WED", t: "easy", l: "Easy", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi.", n: [] },
    { d: "THU", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi. July 4th week — holiday routes get crowded, go early.",
      n: [["WEATHER", HEAT]] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—", x: "Rest.", n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.", n: [] },
    { d: "SUN", t: "long", l: "Long Run", m: 10, p: "11:15–12:00/MI",
      x: "10mi at 11:15–12:00/mi. Double digits — the ramp is working.",
      n: [["FUEL", "Gels at min 40 and 80 (60–75g carbs/hr at 93kg from here on)."]], ham: true },
  ]},
  // ── RAMP 5 ──
  { id: "R5", n: 0, ph: "ramp", mi: 35, lr: 12, dates: "JUL 6–12", days: [
    { d: "MON", t: "rest", l: "Rest", m: 0, p: "—",
      x: "Rest. Final ramp week — the 16-week block proper starts next Monday at 40mi.",
      n: [["REHAB", REHAB]] },
    { d: "TUE", t: "easy", l: "Easy", m: 6, p: "11:00–11:45/MI",
      x: "6mi easy at 11:00–11:45/mi.", n: [] },
    { d: "WED", t: "easy", l: "Easy", m: 7, p: "11:00–11:45/MI",
      x: "7mi easy at 11:00–11:45/mi. Longest midweek run since the spring.",
      n: [["HAMSTRING", "Volume check before the block: if the right hamstring has been silent for two weeks, you're cleared for week 1 as written. If not, we start the block at 35 and re-ramp — use the week editor."]], ham: true },
    { d: "THU", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.", n: [] },
    { d: "FRI", t: "rest", l: "Rest", m: 0, p: "—", x: "Rest.", n: [["REHAB", REHAB]] },
    { d: "SAT", t: "easy", l: "Easy", m: 5, p: "11:00–11:45/MI",
      x: "5mi easy at 11:00–11:45/mi.", n: [] },
    { d: "SUN", t: "long", l: "Long Run", m: 12, p: "11:15–12:00/MI",
      x: "12mi at 11:15–12:00/mi. Ramp graduation run. Next Sunday: 14, inside the block.",
      n: [["FUEL", "Gels at min 40, 80, 120. The full protocol is now habit — that was the ramp's quiet second job."], ["WHOOP", "Baseline check: HRV and resting HR vs the R1 reading. Stable or better = the ramp dose was right."]], ham: true },
  ]},
];

// ───────────────────────────────────────────────────────────────
// FULL PLAN ASSEMBLY — 21 weeks (5 ramp + 16 block), Mondays from Jun 8
// ───────────────────────────────────────────────────────────────

const PLAN = [...RAMP_WEEKS, ...WEEKS];
const PLAN_START = new Date(2026, 5, 8); // Mon Jun 8, 2026 — week 0, day 0
const dateOfCell = (weekIdx, dayIdx) => {
  const d = new Date(PLAN_START);
  d.setDate(d.getDate() + weekIdx * 7 + dayIdx);
  return d;
};
const ymd = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const fmtDate = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();

PLAN.forEach((w, i) => {
  w.idx = i;
  if (!w.id) w.id = "W" + w.n;
  w.title = w.id.startsWith("R") ? "RAMP " + w.id.slice(1) : "WEEK " + String(w.n).padStart(2, "0");
  w.tick = w.id.startsWith("R") ? w.id : String(w.n);
  w.mon = dateOfCell(i, 0);
  const sun = dateOfCell(i, 6);
  w.months = [...new Set([w.mon.getMonth(), sun.getMonth()])];
});

// flat lookup: "y-m-d" -> { weekIdx, dayIdx }
const DATE_MAP = {};
PLAN.forEach((w, wi) => { for (let di = 0; di < 7; di++) DATE_MAP[ymd(dateOfCell(wi, di))] = { weekIdx: wi, dayIdx: di }; });

const MONTHS = [
  { k: "ALL", m: null }, { k: "JUN", m: 5 }, { k: "JUL", m: 6 }, { k: "AUG", m: 7 },
  { k: "SEP", m: 8 }, { k: "OCT", m: 9 }, { k: "NOV", m: 10 },
];

// ───────────────────────────────────────────────────────────────
// WEEK ADJUSTMENT ENGINE
// Rebuilds a week from overrides { mi, days } (keyed by week id)
// while keeping structure: long run + quality protected, easy flexes.
// ───────────────────────────────────────────────────────────────

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const ADDED_DAY = (name) => ({
  d: name, t: "easy", l: "Easy (added)", m: 5, baseM: 0, p: "11:00–11:45/MI",
  x: "Easy at 11:00–11:45/mi (6:50–7:18/km). This run was added by your week adjustment — it exists to spread load, not add stress. Fully conversational.",
  n: [["GARMIN", "Zone 2: HR 130–145bpm."]],
});

function buildWeek(i, ovr) {
  const base = PLAN[i];
  const o = ovr[base.id] || {};
  let days = base.days.map((d) => ({ ...d, baseM: d.m, n: d.n }));

  const isRun = (d) => d.t !== "rest" && d.t !== "race";

  // ── deleted days: user explicitly skipped a scheduled run (distinct from
  // pinning miles to a low number) — converts the day to rest, freeing it
  // from week-total redistribution entirely. Reversible via RESTORE. ──
  const deleted = o.deleted || {};
  days.forEach((d, di) => {
    if (isRun(d) && deleted[di]) {
      days[di] = { d: d.d, t: "rest", l: "Rest", m: 0, baseM: d.baseM, p: "—",
        x: "Rest. This run was deleted.", n: [] };
    }
  });

  const baseRunCount = days.filter(isRun).length;
  const targetDays = o.days != null ? clamp(o.days, 2, 6) : baseRunCount;

  // ── adjust run-day count ──
  let runCount = baseRunCount;
  while (runCount > targetDays) {
    const removable = days
      .filter((d) => isRun(d) && (d.t === "easy" || d.t === "mlr") && !d.l.includes("Shakeout"))
      .sort((a, b) => (a.t === b.t ? a.m - b.m : a.t === "easy" ? -1 : 1));
    if (!removable.length) break;
    const vi = days.indexOf(removable[0]);
    days[vi] = { d: days[vi].d, t: "rest", l: "Rest", m: 0, baseM: days[vi].baseM, p: "—",
      x: "Rest. This day was converted from a run by your week adjustment — its mileage has been folded into the remaining days.",
      n: [["REHAB", REHAB]] };
    runCount--;
  }
  while (runCount < targetDays) {
    const fri = days.findIndex((d) => d.t === "rest" && d.d === "FRI");
    const slot = fri >= 0 ? fri : days.findIndex((d) => d.t === "rest");
    if (slot < 0) break;
    days[slot] = ADDED_DAY(days[slot].d);
    runCount++;
  }

  // ── per-day mile pins + week-total scaling ──
  // o.miles = { origIdx: exactMiles } pins individual days.
  // o.mi (week total) redistributes only the UN-pinned runs.
  const pins = o.miles || {};
  days.forEach((d, di) => { if (isRun(d) && pins[di] != null) d.m = clamp(pins[di], 1, 30); });
  const runs = days.filter(isRun);

  if (o.mi != null) {
    const targetMi = clamp(o.mi, 6, 70);
    const pinnedRuns = runs.filter((d, di) => pins[days.indexOf(d)] != null);
    const freeRuns = runs.filter((d) => pins[days.indexOf(d)] == null);
    const pinnedSum = pinnedRuns.reduce((a, d) => a + d.m, 0);
    const freeTarget = Math.max(0, targetMi - pinnedSum);
    const freeCur = freeRuns.reduce((a, d) => a + d.m, 0) || 1;
    if (freeRuns.length) {
      freeRuns.forEach((d) => { d.m = Math.max(2, Math.round((d.m * freeTarget) / freeCur)); });
      let diff = freeTarget - freeRuns.reduce((a, d) => a + d.m, 0);
      if (diff !== 0) {
        const sink = freeRuns.find((d) => d.t === "long") || [...freeRuns].sort((a, b) => b.m - a.m)[0];
        sink.m = Math.max(2, sink.m + diff);
      }
    }
  }
  days.forEach((d) => { d.adj = isRun(d) ? d.m !== d.baseM : d.baseM > 0; });

  const longDay = days.find((d) => d.t === "long" || d.t === "race");
  return {
    ...base, days,
    mi: runs.reduce((a, d) => a + d.m, 0),
    lr: longDay ? longDay.m : 0,
    edited: !!ovr[base.id],
  };
}

// ───────────────────────────────────────────────────────────────
// REHAB / STRENGTH EXERCISE LIBRARY — with diagrams
// Solid figure = working position · dashed = start position
// Amber = where you should feel it
// ───────────────────────────────────────────────────────────────

const FIG = { stroke: "#e4e4e7", strokeWidth: 3, strokeLinecap: "round", fill: "none" };
const GHOST = { stroke: "#52525b", strokeWidth: 3, strokeLinecap: "round", strokeDasharray: "4 4", fill: "none" };
const HOT = { stroke: "#f59e0b", strokeWidth: 4.5, strokeLinecap: "round", fill: "none" };
const ARROW = { stroke: "#71717a", strokeWidth: 2, fill: "none" };
const GROUND = <line x1="14" y1="112" x2="206" y2="112" stroke="#27272a" strokeWidth="2" />;

const EXERCISES = [
  {
    name: "NORDIC CURL", dose: "3×8", target: "HAMSTRING — ECCENTRIC STRENGTH",
    desc: "Kneel with ankles anchored (under a couch, a barbell, or held by a partner). Keeping a straight line from knees to head, lower your torso toward the floor as SLOWLY as the hamstrings allow. Catch yourself with your hands, then push back up with arm assist.",
    cues: ["The 3–5 second lowering IS the exercise — the way up is just a reset", "Hips stay extended the whole way: no folding at the waist", "Right side fatigues first — set the rep count by it, not the left", "Too hard at first is normal: shorten the range, lower only to 45°"],
    svg: (
      <svg viewBox="0 0 220 130" width="100%" height="120" style={{ maxWidth: 280, display: "block", margin: "0 auto" }}>
        {GROUND}
        <rect x="172" y="98" width="24" height="14" fill="#1a1a1a" stroke="#3f3f46" strokeWidth="2" />
        <line x1="150" y1="108" x2="184" y2="108" {...FIG} />
        <g {...GHOST}><line x1="150" y1="108" x2="150" y2="52" /><circle cx="150" cy="41" r="8" /></g>
        <line x1="150" y1="108" x2="106" y2="64" {...FIG} />
        <circle cx="98" cy="56" r="8" {...FIG} />
        <line x1="120" y1="78" x2="102" y2="98" {...FIG} />
        <line x1="150" y1="108" x2="129" y2="87" {...HOT} />
        <path d="M 144 46 A 50 50 0 0 0 113 55" {...ARROW} />
        <polygon points="111,57 121,52 118,62" fill="#71717a" />
      </svg>
    ),
  },
  {
    name: "SINGLE-LEG RDL", dose: "3×10 / SIDE", target: "HAMSTRING + GLUTE + BALANCE",
    desc: "Stand on one leg with a soft knee. Hinge at the hip — push it straight back — letting torso and rear leg tilt toward horizontal like a seesaw. Stand back up by driving the hip forward. Bodyweight first; add a dumbbell only when 3×10 is clean.",
    cues: ["Hinge, don't squat: the standing shin stays vertical", "Hips square to the floor — don't let the top hip open up", "You should feel a stretch-tension in the standing-leg hamstring", "Slow and balanced beats deep and wobbly"],
    svg: (
      <svg viewBox="0 0 220 130" width="100%" height="120" style={{ maxWidth: 280, display: "block", margin: "0 auto" }}>
        {GROUND}
        <line x1="112" y1="110" x2="110" y2="62" {...FIG} />
        <g {...GHOST}><line x1="110" y1="62" x2="112" y2="28" /><circle cx="112" cy="17" r="8" /></g>
        <line x1="110" y1="62" x2="64" y2="50" {...FIG} />
        <circle cx="55" cy="48" r="8" {...FIG} />
        <line x1="110" y1="62" x2="146" y2="56" {...FIG} />
        <line x1="146" y1="56" x2="176" y2="50" {...FIG} />
        <line x1="80" y1="54" x2="76" y2="84" {...FIG} />
        <line x1="110" y1="62" x2="111" y2="90" {...HOT} />
        <path d="M 106 21 A 44 44 0 0 0 68 39" {...ARROW} />
        <polygon points="66,41 76,37 73,47" fill="#71717a" />
      </svg>
    ),
  },
  {
    name: "SINGLE-LEG GLUTE BRIDGE", dose: "3×12 / SIDE", target: "GLUTES + HIP STABILITY",
    desc: "Lie on your back, one foot planted close to your glutes, the other leg extended. Drive through the planted heel and lift the hips until shoulder–hip–knee make one straight line. Pause one second at the top, lower with control.",
    cues: ["Squeeze the glute hard at the top — that's the rep", "Hips stay LEVEL: no tilting toward the free-leg side", "Drive through the heel, not the toes", "If the hamstring cramps, walk the foot slightly further out"],
    svg: (
      <svg viewBox="0 0 220 130" width="100%" height="120" style={{ maxWidth: 280, display: "block", margin: "0 auto" }}>
        {GROUND}
        <circle cx="42" cy="100" r="8" {...FIG} />
        <g {...GHOST}><line x1="54" y1="106" x2="108" y2="104" /></g>
        <line x1="54" y1="106" x2="106" y2="78" {...FIG} />
        <line x1="106" y1="78" x2="130" y2="72" {...FIG} />
        <line x1="130" y1="72" x2="140" y2="110" {...FIG} />
        <line x1="106" y1="78" x2="164" y2="62" {...FIG} />
        <line x1="96" y1="83" x2="106" y2="78" {...HOT} />
        <line x1="106" y1="58" x2="106" y2="42" {...ARROW} />
        <polygon points="106,38 101,48 111,48" fill="#71717a" />
      </svg>
    ),
  },
  {
    name: "SIDE PLANK", dose: "3×30S / SIDE", target: "OBLIQUES + HIP ABDUCTORS",
    desc: "On your forearm and the side of your bottom foot, lift the hips until your body is one straight line from head to heels. Hold. Hip abductor strength is stride-stability insurance at marathon mileage.",
    cues: ["Elbow stacked directly under the shoulder", "Hips HIGH — a sagging side plank trains nothing", "Breathe normally through the hold", "Progress: lift and hold the top leg"],
    svg: (
      <svg viewBox="0 0 220 130" width="100%" height="120" style={{ maxWidth: 280, display: "block", margin: "0 auto" }}>
        {GROUND}
        <line x1="52" y1="110" x2="84" y2="110" {...FIG} />
        <line x1="52" y1="110" x2="56" y2="86" {...FIG} />
        <line x1="56" y1="86" x2="114" y2="93" {...FIG} />
        <line x1="114" y1="93" x2="170" y2="101" {...FIG} />
        <circle cx="47" cy="75" r="8" {...FIG} />
        <line x1="58" y1="84" x2="62" y2="58" {...FIG} />
        <line x1="102" y1="91" x2="126" y2="94" {...HOT} />
        <line x1="114" y1="80" x2="114" y2="66" {...ARROW} />
        <polygon points="114,62 109,72 119,72" fill="#71717a" />
      </svg>
    ),
  },
  {
    name: "CALF RAISE", dose: "3×15 STRAIGHT + 3×12 BENT-KNEE", target: "CALF + ACHILLES — CARBON-PLATE PREP",
    desc: "Standing tall, fingertips on a wall for balance, rise onto the balls of your feet, pause, then lower over 3 seconds. The SC Elite v5's plate shifts load to the calf–Achilles chain — this is the prep that makes the taper shoe switch safe. Do bent-knee sets to hit the soleus.",
    cues: ["3-second lowering, every rep", "Full range: all the way up, slow all the way down", "Off a step edge for extra range once 3×15 is easy", "Bent-knee version targets the soleus — don't skip it"],
    svg: (
      <svg viewBox="0 0 220 130" width="100%" height="120" style={{ maxWidth: 280, display: "block", margin: "0 auto" }}>
        {GROUND}
        <line x1="76" y1="28" x2="76" y2="112" stroke="#27272a" strokeWidth="3" />
        <circle cx="124" cy="22" r="8" {...FIG} />
        <line x1="124" y1="34" x2="124" y2="70" {...FIG} />
        <line x1="124" y1="70" x2="125" y2="92" {...FIG} />
        <line x1="125" y1="92" x2="126" y2="103" {...FIG} />
        <line x1="116" y1="109" x2="136" y2="99" {...FIG} />
        <g {...GHOST}><line x1="114" y1="110" x2="138" y2="110" /></g>
        <line x1="124" y1="44" x2="78" y2="48" {...FIG} />
        <line x1="129" y1="76" x2="130" y2="100" {...HOT} />
        <line x1="150" y1="104" x2="150" y2="90" {...ARROW} />
        <polygon points="150,86 145,96 155,96" fill="#71717a" />
      </svg>
    ),
  },
  {
    name: "HIP FLEXOR STRETCH", dose: "2×45S / SIDE", target: "HIP FLEXORS — STRIDE OPENER",
    desc: "Half-kneeling lunge, rear knee on a pad. First tuck the pelvis (think 'tail under'), THEN shift the hips a few centimeters forward until you feel a stretch down the front of the rear-leg hip. Hold and breathe.",
    cues: ["Pelvis tuck FIRST — without it you just arch the back and feel nothing", "It's a small move: 2–5cm of forward shift is plenty", "Squeeze the rear-side glute to deepen it", "Reach the rear-side arm overhead for the full-chain version"],
    svg: (
      <svg viewBox="0 0 220 130" width="100%" height="120" style={{ maxWidth: 280, display: "block", margin: "0 auto" }}>
        {GROUND}
        <line x1="146" y1="108" x2="178" y2="108" {...FIG} />
        <line x1="146" y1="108" x2="126" y2="72" {...FIG} />
        <line x1="126" y1="72" x2="122" y2="38" {...FIG} />
        <circle cx="121" cy="27" r="8" {...FIG} />
        <line x1="126" y1="72" x2="92" y2="82" {...FIG} />
        <line x1="92" y1="82" x2="90" y2="110" {...FIG} />
        <line x1="126" y1="72" x2="137" y2="92" {...HOT} />
        <line x1="116" y1="64" x2="98" y2="64" {...ARROW} />
        <polygon points="94,64 104,59 104,69" fill="#71717a" />
      </svg>
    ),
  },
  {
    name: "FOAM ROLL POSTERIOR CHAIN", dose: "2–3 MIN", target: "HAMSTRINGS + CALVES + GLUTES",
    desc: "Slow passes — about an inch per second — along the hamstring, calf, and glute. When you find a tender spot (you know the right hamstring's usual one), pause on it 20–30 seconds and breathe until it dulls.",
    cues: ["Slow beats hard: speed-rolling does nothing", "Pause on tender spots, don't saw across them", "Max 5/10 discomfort — pain means back off", "Best within an hour after running"],
    svg: (
      <svg viewBox="0 0 220 130" width="100%" height="120" style={{ maxWidth: 280, display: "block", margin: "0 auto" }}>
        {GROUND}
        <circle cx="122" cy="101" r="10" fill="#141414" stroke="#3f3f46" strokeWidth="2" />
        <circle cx="122" cy="101" r="2" fill="#3f3f46" />
        <line x1="94" y1="88" x2="140" y2="84" {...FIG} />
        <line x1="140" y1="84" x2="168" y2="100" {...FIG} />
        <line x1="94" y1="88" x2="66" y2="58" {...FIG} />
        <circle cx="59" cy="48" r="8" {...FIG} />
        <line x1="66" y1="58" x2="48" y2="110" {...FIG} />
        <line x1="98" y1="87" x2="136" y2="84" {...HOT} />
        <line x1="92" y1="68" x2="134" y2="65" {...ARROW} />
        <polygon points="88,68 96,63 96,73" fill="#71717a" />
        <polygon points="138,65 130,60 130,70" fill="#71717a" />
      </svg>
    ),
  },
  {
    name: "LEG SWINGS", dose: "2×10 / DIRECTION", target: "DYNAMIC HIP PREP — PRE-RUN ONLY", preRun: true,
    desc: "Hand on a wall, swing one leg front-to-back like a pendulum, building range with each swing. Then face the wall and swing side-to-side. This is the mandatory warm-up before every quality session and stride set — it's how the hamstring gets told what's coming.",
    cues: ["Controlled pendulum, not a ballistic kick", "Build amplitude gradually — first swings are small", "Front-to-back AND side-to-side, both legs", "Do these BEFORE running, never as part of the rehab session"],
    svg: (
      <svg viewBox="0 0 220 130" width="100%" height="120" style={{ maxWidth: 280, display: "block", margin: "0 auto" }}>
        {GROUND}
        <line x1="66" y1="28" x2="66" y2="112" stroke="#27272a" strokeWidth="3" />
        <circle cx="108" cy="22" r="8" {...FIG} />
        <line x1="108" y1="34" x2="108" y2="64" {...FIG} />
        <line x1="108" y1="64" x2="105" y2="110" {...FIG} />
        <line x1="108" y1="42" x2="68" y2="46" {...FIG} />
        <g {...GHOST}><line x1="108" y1="64" x2="146" y2="86" /><line x1="108" y1="64" x2="76" y2="94" /></g>
        <circle cx="108" cy="64" r="4" fill="#f59e0b" />
        <path d="M 142 94 A 42 42 0 0 1 84 100" {...ARROW} />
        <polygon points="146,92 136,92 141,101" fill="#71717a" />
        <polygon points="80,101 88,95 90,105" fill="#71717a" />
      </svg>
    ),
  },
];

const SESSION = EXERCISES.filter((e) => !e.preRun);

// ───────────────────────────────────────────────────────────────
// STRENGTH LIBRARY — runner-specific, gym or home. ham:true flags
// hamstring/posterior-chain priority work given the right-side history.
// ───────────────────────────────────────────────────────────────

const STRENGTH = [
  { id: "rdl", name: "ROMANIAN DEADLIFT", dose: "3×8", ham: true, gear: "BARBELL / DUMBBELLS",
    target: "HAMSTRINGS + GLUTES + POSTERIOR CHAIN",
    desc: "Bar at hip height, soft knees. Push the hips straight back, lowering the bar along the thighs until you feel a deep hamstring stretch (about mid-shin), back flat the whole way. Drive the hips forward to stand. The single best loaded hamstring builder — go lighter, feel it in the hamstrings not the lower back.",
    cues: ["Hips back, not down — this is a hinge, not a squat", "Bar stays close, almost dragging up the legs", "Stop lowering when the hamstrings run out of stretch, not when the bar hits the floor", "Right side sets the load: if it fatigues first, that's your working weight"] },
  { id: "slrdl", name: "SINGLE-LEG RDL (LOADED)", dose: "3×8 / SIDE", ham: true, gear: "DUMBBELL / KETTLEBELL",
    target: "HAMSTRING + GLUTE + UNILATERAL BALANCE",
    desc: "The rehab hinge, now loaded. Weight in the opposite hand to the standing leg, hinge the hip back, free leg extending behind to horizontal. Targets each hamstring independently — the direct fix for the right-vs-left asymmetry that drives the tendinopathy.",
    cues: ["Hips square — don't let the top hip rotate open", "Standing shin stays vertical", "Light weight, slow tempo: balance is half the work", "Match reps to the weaker (right) side"] },
  { id: "hipthrust", name: "HIP THRUST", dose: "3×10", ham: true, gear: "BARBELL / BENCH",
    target: "GLUTES + HAMSTRINGS",
    desc: "Upper back on a bench, bar across the hips. Drive through the heels to lift until the torso is parallel to the floor, squeezing the glutes hard at the top. Strong glutes take load off the hamstring — the indirect but essential half of fixing posterior-chain issues.",
    cues: ["Full hip extension, ribs down — don't arch the lower back to fake height", "Squeeze and hold a beat at the top", "Drive through heels", "Chin tucked, eyes forward through the lift"] },
  { id: "nordic", name: "NORDIC CURL", dose: "3×6–8", ham: true, gear: "ANCHOR / PARTNER",
    target: "HAMSTRING — ECCENTRIC STRENGTH",
    desc: "Also in your rehab protocol — included here because it's the highest-value hamstring exercise you can load. Anchored ankles, straight body, lower as slowly as possible, catch and push back up. Proven to cut hamstring injury rates; the eccentric strength directly protects the right-side tendon.",
    cues: ["The slow lower IS the exercise", "Hips extended — no folding at the waist", "Shorten range if you can't control the full drop", "Right side dictates the rep count"] },
  { id: "bulgarian", name: "BULGARIAN SPLIT SQUAT", dose: "3×8 / SIDE", ham: false, gear: "DUMBBELLS / BENCH",
    target: "QUADS + GLUTES + SINGLE-LEG STRENGTH",
    desc: "Rear foot elevated on a bench, drop straight down into the front leg, drive back up through the front heel. Single-leg strength is the foundation of durable running — and your Hyrox background means you'll load these well.",
    cues: ["Front shin roughly vertical, knee tracks over the foot", "Torso tall, drop straight down", "Drive through the front heel", "Most of the weight in the front leg, back foot is just balance"] },
  { id: "stepup", name: "WEIGHTED STEP-UP", dose: "3×10 / SIDE", ham: false, gear: "DUMBBELLS / BOX",
    target: "QUADS + GLUTES + HILL-SPECIFIC POWER",
    desc: "Step onto a knee-height box driving through the lead heel, stand tall, lower under control. Directly trains the bridge climbs — Verrazzano, Queensboro, Willis Ave all reward this exact movement pattern.",
    cues: ["Push through the heel of the top foot, don't bounce off the bottom", "Control the way down — that's where the strength builds", "Knee-height box; higher isn't better", "Stand fully tall at the top before lowering"] },
  { id: "calfraise", name: "LOADED CALF RAISE", dose: "3×12 STRAIGHT + 3×12 BENT", ham: false, gear: "DUMBBELLS / STEP",
    target: "CALF + ACHILLES — CARBON-PLATE PREP",
    desc: "Weighted version of the rehab staple. Off a step for full range, slow lower. The SC Elite v5's plate loads the calf–Achilles chain harder than your trainers — building this now is what makes the taper shoe switch safe and pain-free.",
    cues: ["3-second lower every rep", "Full stretch at the bottom, full squeeze at the top", "Bent-knee sets hit the soleus — do both", "Build load gradually; the Achilles adapts slower than muscle"] },
  { id: "plank", name: "PLANK + SIDE PLANK", dose: "3×40S EACH", ham: false, gear: "BODYWEIGHT",
    target: "CORE + HIP STABILITY",
    desc: "Front plank for anterior core, side planks for the obliques and hip abductors. A stable trunk keeps your stride mechanics intact at mile 22 when fatigue tries to collapse your form — and good form protects the hamstring.",
    cues: ["Straight line head to heels, hips neither sagging nor piking", "Elbow under shoulder", "Breathe normally through the hold", "Quality of position over duration"] },
  { id: "deadbug", name: "DEAD BUG", dose: "3×10 / SIDE", ham: false, gear: "BODYWEIGHT",
    target: "DEEP CORE + ANTI-EXTENSION",
    desc: "On your back, arms up, knees at 90°. Slowly extend opposite arm and leg while pressing your lower back flat into the floor, then switch. Teaches the core to stabilize the pelvis while the limbs move — exactly what running demands.",
    cues: ["Lower back stays glued to the floor the whole time", "Slow and deliberate — no rushing the switch", "Exhale as the limbs extend", "Stop if the back arches; shorten the range instead"] },
  { id: "monster", name: "BANDED LATERAL WALK", dose: "3×12 / DIRECTION", ham: false, gear: "MINI BAND",
    target: "GLUTE MEDIUS + HIP STABILITY",
    desc: "Band around the ankles or knees, half-squat, step sideways keeping tension. Strengthens the glute medius that controls knee tracking and pelvic drop — a runner's-knee and IT-band insurance policy, and stride-stability for the long miles.",
    cues: ["Stay low in the half-squat throughout", "Keep band tension — don't let the feet snap together", "Lead with the heel, toes forward", "Feel it in the side of the hip, not the thigh"] },
];

const STRENGTH_BY_ID = Object.fromEntries(STRENGTH.map((s) => [s.id, s]));

const STRENGTH_GOAL = 2; // sessions per week
const REHAB_GOAL = 2; // rehab sessions per week

// Default strength placement for a built week: 2 sessions, on rest-day slots
// first, then the easiest available run day. Returns array of slot indices (0-6).
// Race week (has a race day) gets none.
function defaultStrengthSlots(week, slotsByDay) {
  if (week.days.some((d) => d.t === "race")) return [];
  const restSlots = [];
  const runSlots = [];
  for (let s = 0; s < 7; s++) {
    const runs = slotsByDay[s];
    if (!runs || runs.length === 0) restSlots.push(s);
    else {
      const minMi = Math.min(...runs.map((r) => r.m));
      const anyHard = runs.some((r) => r.t === "quality" || r.t === "long");
      runSlots.push({ s, minMi, anyHard });
    }
  }
  const picks = [...restSlots];
  if (picks.length < STRENGTH_GOAL) {
    runSlots.sort((a, b) => (a.anyHard - b.anyHard) || (a.minMi - b.minMi));
    for (const r of runSlots) {
      if (picks.length >= STRENGTH_GOAL) break;
      picks.push(r.s);
    }
  }
  return picks.slice(0, STRENGTH_GOAL).sort((a, b) => a - b);
}


// ───────────────────────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────
// LOG ACTIVITY FORM — captures distance, avg HR, pace, time for a
// planned run. Auto-fills pace↔time from distance. Shows planned-vs-
// actual reconciliation; logged distance becomes the source of truth.
// ───────────────────────────────────────────────────────────────

function LogForm({ planned, existing, onSave, onClear, onClose, S, display, fmtPace, fmtTime, parsePace, parseTime, MP_SEC }) {
  // distDigits holds RAW digits only (e.g. "0620"), right-to-left entry,
  // always rendered as exactly 2 digits before + 2 after the decimal.
  const numToDistDigits = (n) => {
    if (!n && n !== 0) return "";
    return String(Math.round(n * 100)).padStart(4, "0").slice(-4);
  };
  const initialDistDigits = existing ? numToDistDigits(existing.dist) : numToDistDigits(planned.m);
  const [distDigits, setDistDigits] = useState(initialDistDigits);
  const [hr, setHr] = useState(existing && existing.hr ? String(existing.hr) : "");
  const [paceStr, setPaceStr] = useState(existing && existing.paceSec ? fmtPace(existing.paceSec) : "");
  // timeDigits holds RAW digits only (e.g. "14543"), right-to-left entry.
  // timeStr (below) is the colon-formatted display/parse value derived from it.
  const initialTimeDigits = existing && existing.timeSec ? fmtTime(existing.timeSec).replace(/:/g, "") : "";
  const [timeDigits, setTimeDigits] = useState(initialTimeDigits);
  const [lastEdited, setLastEdited] = useState(null); // 'pace' | 'time'

  // Format raw digits "0620" → "06.20". Fixed 2-before / 2-after decimal —
  // pads on the left so the field always shows a complete, unambiguous value.
  const digitsToDist = (digits) => {
    const d = digits.replace(/\D/g, "").slice(0, 4).padStart(4, "0"); // cap at 99.99 mi
    const whole = d.slice(0, 2);
    const frac = d.slice(2);
    return `${whole}.${frac}`;
  };

  const dist = distDigits ? digitsToDist(distDigits) : "";

  // Format raw digits "14543" → "1:45:43". Always groups from the right in
  // pairs of two (SS, then MM, then any remaining digits as H).
  const digitsToTime = (digits) => {
    const d = digits.replace(/\D/g, "").slice(0, 6); // cap at H:MM:SS = 6 digits
    if (!d) return "";
    if (d.length <= 2) return d; // still typing seconds, show raw
    const ss = d.slice(-2);
    const rest = d.slice(0, -2);
    if (rest.length <= 2) return `${rest}:${ss}`;
    const mm = rest.slice(-2);
    const h = rest.slice(0, -2);
    return `${h}:${mm}:${ss}`;
  };

  const timeStr = digitsToTime(timeDigits);

  const distNum = parseFloat(dist) || 0;
  const paceSec = parsePace(paceStr);
  const timeSec = parseTime(timeStr);

  // Auto-derive the field the user didn't just touch, when we have distance + one of pace/time.
  const onDist = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    setDistDigits(digits);
    const d = parseFloat(digits ? digitsToDist(digits) : "0") || 0;
    if (d > 0) {
      if (lastEdited === "pace" && parsePace(paceStr) > 0) {
        setTimeDigits(fmtTime(parsePace(paceStr) * d).replace(/:/g, ""));
      } else if (lastEdited === "time" && parseTime(timeStr) > 0) {
        setPaceStr(fmtPace(parseTime(timeStr) / d));
      }
    }
  };
  const onPace = (v) => {
    setPaceStr(v); setLastEdited("pace");
    const p = parsePace(v);
    if (p > 0 && distNum > 0) setTimeDigits(fmtTime(p * distNum).replace(/:/g, ""));
  };
  const onTime = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    setTimeDigits(digits); setLastEdited("time");
    const formatted = digitsToTime(digits);
    const t = parseTime(formatted);
    if (t > 0 && distNum > 0) setPaceStr(fmtPace(t / distNum));
  };

  const distDelta = existing || distNum ? distNum - planned.m : 0;
  const paceVsMP = paceSec ? paceSec - MP_SEC : 0;

  const canSave = distNum > 0;
  const submit = () => {
    if (!canSave) return;
    onSave({
      dist: Math.round(distNum * 100) / 100,
      hr: hr ? Math.round(parseFloat(hr)) : null,
      paceSec: paceSec || null,
      timeSec: timeSec || null,
    });
  };

  const field = { width: "100%", background: "#080808", color: "#e4e4e7", border: "1px solid #27272a", fontFamily: "'DM Mono', monospace", fontSize: 15, padding: "9px 11px", boxSizing: "border-box" };
  const label = { fontSize: 9, color: "#52525b", marginBottom: 4, display: "block" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...S.surface, background: "#0d0d0d", maxWidth: 380, width: "100%", padding: 18, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ ...display, fontSize: 22, lineHeight: 1 }}>LOG RUN</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#71717a", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 0 }}>✕</button>
        </div>
        <div style={{ fontSize: 10, color: "#71717a", marginBottom: 16 }}>
          {planned.l} · PLANNED {planned.m} MI{planned.p && planned.p !== "—" ? " @ " + planned.p : ""}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={label}>DISTANCE (MI)</label>
            <input type="text" inputMode="numeric" value={dist} onChange={(e) => onDist(e.target.value)} placeholder="00.00" style={field} autoFocus />          </div>
          <div>
            <label style={label}>AVG HR (BPM)</label>
            <input type="number" inputMode="numeric" value={hr} onChange={(e) => setHr(e.target.value)} placeholder="—" style={field} />
          </div>
          <div>
            <label style={label}>AVG PACE (MM:SS)</label>
            <input type="text" inputMode="numeric" value={paceStr} onChange={(e) => onPace(e.target.value)} placeholder="9:55" style={field} />
          </div>
          <div>
            <label style={label}>TIME (H:MM:SS)</label>
            <input type="text" inputMode="numeric" value={timeStr} onChange={(e) => onTime(e.target.value)} placeholder="1:18:40" style={field} />
          </div>
        </div>

        <div style={{ fontSize: 8.5, color: "#3f3f46", marginBottom: 14, lineHeight: 1.5 }}>
          Enter distance plus either pace or time — the other fills in automatically.
        </div>

        {/* Reconciliation vs plan */}
        {distNum > 0 && (
          <div style={{ ...S.surface2, padding: "10px 12px", marginBottom: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            {planned.m > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <span style={{ color: "#71717a" }}>VS PLANNED DISTANCE</span>
                <span style={{ color: Math.abs(distDelta) < 0.05 ? "#4ade80" : "#fb923c" }}>
                  {distDelta > 0 ? "+" : ""}{(Math.round(distDelta * 10) / 10)} MI {Math.abs(distDelta) < 0.05 ? "(on plan)" : distDelta > 0 ? "(further)" : "(shorter)"}
                </span>
              </div>
            )}
            {paceSec > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <span style={{ color: "#71717a" }}>VS MARATHON PACE (9:55)</span>
                <span style={{ color: paceVsMP <= 0 ? "#4ade80" : "#a1a1aa" }}>
                  {paceVsMP === 0 ? "exactly MP" : (paceVsMP > 0 ? "+" : "−") + fmtPace(Math.abs(paceVsMP)) + "/mi " + (paceVsMP < 0 ? "(faster)" : "(slower)")}
                </span>
              </div>
            )}
            {planned.m > 0 && (
              <div style={{ fontSize: 8.5, color: "#52525b", marginTop: 2 }}>
                Your logged distance ({Math.round(distNum * 10) / 10} mi) will be used in totals instead of the planned {planned.m} mi.
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          {existing && (
            <button onClick={onClear} className="hoverlift" style={{ fontSize: 11, padding: "9px 14px", background: "transparent", color: "#f43f5e", border: "1px solid #f43f5e66", fontFamily: "inherit", cursor: "pointer" }}>DELETE</button>
          )}
          <button onClick={submit} disabled={!canSave} className="hoverlift"
            style={{ ...display, flex: 1, fontSize: 16, padding: "10px", background: canSave ? "#4ade80" : "#27272a", color: canSave ? "#080808" : "#52525b", border: "none", cursor: canSave ? "pointer" : "default" }}>
            {existing ? "✓ UPDATE LOG" : "✓ SAVE LOG"}
          </button>
        </div>
      </div>
    </div>
  );
}

// COMPONENT
// ───────────────────────────────────────────────────────────────

export default function NYCMarathonPlan() {
  const [tab, setTab] = useState("today");
  const [wk, setWk] = useState(0);
  const [day, setDay] = useState(null); // {k:'run'|'rest', i} — i = original day index for runs, slot index for rest
  const [moving, setMoving] = useState(null); // original day index of run being moved
  const [step, setStep] = useState(null); // rehab session step, null = library
  const [strSel, setStrSel] = useState(null); // expanded strength exercise id in the tab
  const [attachFor, setAttachFor] = useState(null); // {weekId, slot} day awaiting a strength pick
  const [menuOpen, setMenuOpen] = useState(false);
  const lpTimer = useRef(null);
  const lpFired = useRef(false);
  const [month, setMonth] = useState("ALL");
  const [done, setDone] = useState({});
  const [ovr, setOvr] = useState({});
  const [logs, setLogs] = useState({}); // { "weekId-origIdx": { dist, hr, paceSec, timeSec } }
  const [logFor, setLogFor] = useState(null); // {weekId, origIdx} being logged
  const [showNotes, setShowNotes] = useState(false);
  const [saveState, setSaveState] = useState("loading");
  const loaded = useRef(false);
  const saveTimer = useRef(null);

  // ── persistence: load once on mount ──
  useEffect(() => {
    (async () => {
      if (!window.storage) { loaded.current = true; setSaveState("local"); return; }
      try {
        const res = await window.storage.get("nyc-marathon-26-state");
        if (res && res.value) {
          const s = JSON.parse(res.value);
          if (s.done) setDone(s.done);
          if (s.ovr) setOvr(s.ovr);
          if (s.logs) setLogs(s.logs);
        }
        setSaveState("saved");
      } catch (e) {
        setSaveState("saved"); // first run — key doesn't exist yet
      } finally {
        loaded.current = true;
      }
    })();
  }, []);

  // ── persistence: debounced save on change ──
  useEffect(() => {
    if (!loaded.current || !window.storage) return;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await window.storage.set("nyc-marathon-26-state", JSON.stringify({ done, ovr, logs }));
        setSaveState(res ? "saved" : "error");
      } catch (e) { setSaveState("error"); }
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [done, ovr, logs]);

  const EFF = PLAN.map((_, i) => buildWeek(i, ovr));

  // slot layout (runs grouped by weekday 0-6) for any built week, respecting moves
  const slotsOf = (w) => {
    const mv = (ovr[w.id] || {}).moves || {};
    const s = Array.from({ length: 7 }, () => []);
    w.days.forEach((d, di) => {
      if (d.t === "rest") return;
      const t = mv[di] != null ? clamp(mv[di], 0, 6) : di;
      s[t].push({ ...d, origIdx: di });
    });
    return s;
  };
  const defStrengthOf = (w) => defaultStrengthSlots(w, slotsOf(w));
  const slotOfRun = (w, origIdx) => {
    const mv = (ovr[w.id] || {}).moves || {};
    return mv[origIdx] != null ? clamp(mv[origIdx], 0, 6) : origIdx;
  };
  // effective strength sessions for a week: list of { slot, ids } with ids.length>0
  const weekStrengthSessions = (w) => {
    const def = defStrengthOf(w);
    const out = [];
    for (let s = 0; s < 7; s++) {
      const ids = slotStrength(w.id, s, def);
      if (ids.length) out.push({ slot: s, ids });
    }
    return out;
  };
  const strengthStats = (w) => {
    const sess = weekStrengthSessions(w);
    const doneN = sess.filter((x) => strengthDone(w.id, x.slot)).length;
    return { total: sess.length, done: doneN, planned: Math.max(sess.length, defStrengthOf(w).length) };
  };
  const week = EFF[wk];
  const phase = PHASES[week.ph];

  const monthIdx = MONTHS.find((m) => m.k === month)?.m ?? null;
  const visible = monthIdx === null ? EFF : EFF.filter((w) => w.months.includes(monthIdx));

  const key = (id, d) => `${id}-${d}`;
  const isDone = (id, d) => !!done[key(id, d)];
  const toggle = (id, d) => setDone((prev) => ({ ...prev, [key(id, d)]: !prev[key(id, d)] }));

  // ── activity logs: actual run data attached to a planned run (by origIdx) ──
  const getLog = (id, origIdx) => logs[key(id, origIdx)] || null;
  const saveLog = (id, origIdx, entry) => {
    setLogs((p) => ({ ...p, [key(id, origIdx)]: entry }));
    setDone((p) => ({ ...p, [key(id, origIdx)]: true })); // logging implies done
  };
  const clearLog = (id, origIdx) => {
    setLogs((p) => { const c = { ...p }; delete c[key(id, origIdx)]; return c; });
  };
  // formatting
  const fmtPace = (sec) => { if (!sec) return "—"; const m = Math.floor(sec / 60), s = Math.round(sec % 60); return `${m}:${String(s).padStart(2, "0")}`; };
  const fmtTime = (sec) => { if (!sec) return "—"; const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.round(sec % 60); return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`; };
  // unscheduled-run log key: slot+100 so it never collides with a real run's origIdx (0-6)
  const restSlotIdx = (slot) => 100 + slot;
  const restRunIdx = (w) => restSlotIdx(DATE_MAP[ymd(now)] ? DATE_MAP[ymd(now)].dayIdx : 0);
  const parsePace = (str) => { if (!str) return 0; const p = str.split(":").map(Number); if (p.length === 2 && !p.some(isNaN)) return p[0] * 60 + p[1]; const f = parseFloat(str); return isNaN(f) ? 0 : Math.round(f * 60); };
  const parseTime = (str) => { if (!str) return 0; const p = str.split(":").map(Number); if (p.some(isNaN)) return 0; if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2]; if (p.length === 2) return p[0] * 60 + p[1]; return p[0] * 60; };
  // goal MP pace in sec/mi for delta coloring (9:55)
  const MP_SEC = 9 * 60 + 55;

  const weekStats = (w) => {
    let total = 0, doneN = 0;
    w.days.forEach((d, di) => {
      if (d.t === "rest") return;
      total += 1;
      if (isDone(w.id, di)) doneN += 1;
    });
    return { total, done: doneN, full: total > 0 && doneN === total };
  };

  const totals = EFF.reduce(
    (acc, w) => {
      w.days.forEach((d, di) => {
        if (d.t === "rest") return;
        acc.runs += 1;
        if (isDone(w.id, di)) { acc.doneRuns += 1; const lg = getLog(w.id, di); acc.miles += (lg && lg.dist) ? lg.dist : d.m; }
      });
      // unscheduled runs logged on rest days (keys 100-106)
      for (let s = 0; s < 7; s++) {
        const lg = getLog(w.id, 100 + s);
        if (lg && lg.dist) { acc.runs += 1; acc.doneRuns += 1; acc.miles += lg.dist; }
      }
      return acc;
    },
    { runs: 0, doneRuns: 0, miles: 0 }
  );
  const pct = totals.runs ? Math.round((totals.doneRuns / totals.runs) * 100) : 0;

  const load = (w) => {
    let easy = 0, quality = 0, long = 0;
    w.days.forEach((d) => {
      if (d.t === "quality") quality += d.m;
      else if (d.t === "long" || d.t === "race") long += d.m;
      else easy += d.m;
    });
    return { easy, quality, long };
  };

  const daysToRace = Math.max(0, Math.ceil((RACE_DATE - new Date()) / 86400000));

  // ── Today resolution ──
  const now = new Date();
  const todayCell = DATE_MAP[ymd(now)] || null; // null if outside the plan window
  // for a given calendar date, return { week, runs:[{...day, origIdx}], inPlan }
  const cellsForDate = (date) => {
    const loc = DATE_MAP[ymd(date)];
    if (!loc) return { inPlan: false, week: null, runs: [], rest: false };
    const w = EFF[loc.weekIdx];
    const mv = (ovr[w.id] || {}).moves || {};
    const runs = [];
    w.days.forEach((d, di) => {
      if (d.t === "rest") return;
      const slot = mv[di] != null ? clamp(mv[di], 0, 6) : di;
      if (slot === loc.dayIdx) runs.push({ ...d, origIdx: di });
    });
    return { inPlan: true, week: w, weekIdx: loc.weekIdx, dayIdx: loc.dayIdx, runs, rest: runs.length === 0 };
  };
  const maxMi = Math.max(...EFF.map((w) => w.mi));

  const NOTE_COLORS = {
    HAMSTRING: "#f59e0b", FUEL: "#fb7185", GARMIN: "#38bdf8", WHOOP: "#38bdf8",
    REHAB: "#a78bfa", SHOE: "#fde047", COURSE: "#fb923c", WEATHER: "#71717a",
  };

  const selectWeek = (i) => { setWk(i); setDay(null); setShowNotes(false); setMoving(null); };
  const pickMonth = (k) => {
    setMonth(k);
    const mi = MONTHS.find((m) => m.k === k)?.m ?? null;
    if (mi !== null && !EFF[wk].months.includes(mi)) {
      const first = EFF.find((w) => w.months.includes(mi));
      if (first) selectWeek(first.idx);
    }
  };
  const setOverride = (id, patch) => setOvr((p) => ({ ...p, [id]: { ...(p[id] || {}), ...patch } }));
  const setDayMiles = (id, origIdx, m) => {
    setOvr((p) => {
      const cur = { ...(p[id] || {}) };
      const miles = { ...(cur.miles || {}) };
      if (m == null) delete miles[origIdx]; else miles[origIdx] = clamp(m, 1, 30);
      if (Object.keys(miles).length) cur.miles = miles; else delete cur.miles;
      const c = { ...p };
      if (Object.keys(cur).length) c[id] = cur; else delete c[id];
      return c;
    });
  };
  const dayPinned = (id, origIdx) => ((ovr[id] || {}).miles || {})[origIdx] != null;
  const setDeleted = (id, origIdx, val) => {
    setOvr((p) => {
      const cur = { ...(p[id] || {}) };
      const deleted = { ...(cur.deleted || {}) };
      if (val) deleted[origIdx] = true; else delete deleted[origIdx];
      if (Object.keys(deleted).length) cur.deleted = deleted; else delete cur.deleted;
      // clear any mile pin on this day too — it's either gone or fresh again
      if (cur.miles && cur.miles[origIdx] != null) {
        const m = { ...cur.miles };
        delete m[origIdx];
        if (Object.keys(m).length) cur.miles = m; else delete cur.miles;
      }
      const c = { ...p };
      if (Object.keys(cur).length) c[id] = cur; else delete c[id];
      return c;
    });
  };
  const dayDeleted = (id, origIdx) => !!((ovr[id] || {}).deleted || {})[origIdx];

  // ── strength attached to days: ovr[weekId].strength = { origIdx: [exerciseId,...] } ──
  // ── strength is keyed by weekday SLOT (0-6), independent of runs so it works on rest days ──
  // ovr[weekId].strength = { slot: [ids] }  ·  removed slots stored as []
  // Default strength days are seeded by defaultStrengthSlots; user entries override.
  const DEFAULT_STRENGTH_TEMPLATE = ["rdl", "hipthrust", "plank"]; // hamstring-led starter
  const userStrength = (id, slot) => {
    const s = (ovr[id] || {}).strength || {};
    return Object.prototype.hasOwnProperty.call(s, slot) ? s[slot] : null;
  };
  const slotStrength = (id, slot, defSlots) => {
    const u = userStrength(id, slot);
    if (u !== null) return u; // user set it (possibly to [] = cleared)
    return defSlots.includes(slot) ? DEFAULT_STRENGTH_TEMPLATE : [];
  };
  const setSlotStrength = (id, slot, list) => {
    setOvr((p) => {
      const cur = { ...(p[id] || {}) };
      const str = { ...(cur.strength || {}) };
      str[slot] = list;
      cur.strength = str;
      return { ...p, [id]: cur };
    });
  };
  const toggleStrength = (id, slot, exId, defSlots) => {
    const list = [...slotStrength(id, slot, defSlots)];
    const at = list.indexOf(exId);
    if (at >= 0) list.splice(at, 1); else list.push(exId);
    setSlotStrength(id, slot, list);
  };
  const strengthDone = (id, slot) => !!done[`str-${id}-${slot}`];
  const toggleStrengthDone = (id, slot) => setDone((p) => ({ ...p, [`str-${id}-${slot}`]: !p[`str-${id}-${slot}`] }));

  // ── rehab tracking: a simple done-count per week toward REHAB_GOAL ──
  // Default rehab days mirror strength placement (rest days first).
  const defRehabOf = (w) => defaultStrengthSlots(w, slotsOf(w)); // same rest-day logic
  const rehabDone = (id, slot) => !!done[`reh-${id}-${slot}`];
  const toggleRehabDone = (id, slot) => setDone((p) => ({ ...p, [`reh-${id}-${slot}`]: !p[`reh-${id}-${slot}`] }));
  const rehabStats = (w) => {
    const def = defRehabOf(w);
    // count any rehab toggles this week (default slots + any extra the user marked)
    let doneN = 0;
    for (let s = 0; s < 7; s++) if (rehabDone(w.id, s)) doneN++;
    return { done: doneN, planned: Math.max(def.length, REHAB_GOAL), slots: def };
  };
  const resetWeek = (id) => setOvr((p) => { const c = { ...p }; delete c[id]; return c; });

  // ── run moving: slots are the 7 weekday columns; runs keep their original index as identity ──
  const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const applyMove = (id, origIdx, slot) => {
    setOvr((p) => {
      const cur = { ...(p[id] || {}) };
      const mv = { ...(cur.moves || {}) };
      if (slot === origIdx) delete mv[origIdx]; else mv[origIdx] = slot;
      if (Object.keys(mv).length) cur.moves = mv; else delete cur.moves;
      const c = { ...p };
      if (Object.keys(cur).length) c[id] = cur; else delete c[id];
      return c;
    });
  };
  const slots = slotsOf(week);
  const slotOf = (origIdx) => {
    const mv = (ovr[week.id] || {}).moves || {};
    return mv[origIdx] != null ? clamp(mv[origIdx], 0, 6) : origIdx;
  };
  const pressStart = (origIdx) => {
    lpFired.current = false;
    lpTimer.current = setTimeout(() => {
      lpFired.current = true;
      setMoving((m) => (m === origIdx ? null : origIdx));
    }, 450);
  };
  const pressEnd = () => { if (lpTimer.current) clearTimeout(lpTimer.current); };

  const wkRunDays = week.days.filter((d) => d.t !== "rest" && d.t !== "race").length;
  const hasRace = week.days.some((d) => d.t === "race");

  const S = {
    surface: { background: "#0d0d0d", border: "1px solid #1a1a1a" },
    surface2: { background: "#0f0f0f", border: "1px solid #141414" },
    display: { fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" },
    mono: { fontFamily: "'DM Mono', monospace" },
  };

  const stepBtn = {
    width: 26, height: 26, padding: 0, background: "#0f0f0f", color: "#a1a1aa",
    border: "1px solid #27272a", fontSize: 14, lineHeight: "24px", fontFamily: "inherit",
  };

  const LogBlock = ({ wId, origIdx, planned }) => {
    const lg = getLog(wId, origIdx);
    if (planned.t === "rest") return null;
    return (
      <div style={{ marginTop: 4 }}>
        {lg ? (
          <div style={{ ...S.surface2, padding: "9px 11px", borderLeft: "2px solid #4ade80" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: "#4ade80" }}>● ACTUAL — LOGGED</span>
              <button className="hoverlift" onClick={() => setLogFor({ weekId: wId, origIdx })}
                style={{ fontSize: 9, padding: "2px 8px", background: "transparent", color: "#71717a", border: "1px solid #27272a", fontFamily: "inherit" }}>EDIT</button>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11 }}><span style={{ color: "#52525b", fontSize: 8.5 }}>DIST </span><span style={{ color: "#e4e4e7" }}>{lg.dist}</span><span style={{ color: "#52525b", fontSize: 8.5 }}> MI</span></span>
              {lg.paceSec ? <span style={{ fontSize: 11 }}><span style={{ color: "#52525b", fontSize: 8.5 }}>PACE </span><span style={{ color: "#e4e4e7" }}>{fmtPace(lg.paceSec)}</span><span style={{ color: "#52525b", fontSize: 8.5 }}>/MI</span></span> : null}
              {lg.hr ? <span style={{ fontSize: 11 }}><span style={{ color: "#52525b", fontSize: 8.5 }}>HR </span><span style={{ color: "#e4e4e7" }}>{lg.hr}</span></span> : null}
              {lg.timeSec ? <span style={{ fontSize: 11 }}><span style={{ color: "#52525b", fontSize: 8.5 }}>TIME </span><span style={{ color: "#e4e4e7" }}>{fmtTime(lg.timeSec)}</span></span> : null}
            </div>
            {Math.abs(lg.dist - planned.m) >= 0.05 && (
              <div style={{ fontSize: 8.5, color: "#fb923c", marginTop: 5 }}>
                {lg.dist > planned.m ? "+" : ""}{Math.round((lg.dist - planned.m) * 10) / 10} mi vs the {planned.m} mi planned
              </div>
            )}
          </div>
        ) : (
          <button className="hoverlift" onClick={() => setLogFor({ weekId: wId, origIdx })}
            style={{ fontSize: 10, padding: "5px 12px", background: "#4ade8014", color: "#4ade80", border: "1px solid #4ade8066", fontFamily: "inherit" }}>
            LOG THIS RUN +
          </button>
        )}
      </div>
    );
  };

  const RehabBlock = ({ wId, slot, defSlots }) => {
    const isDefault = defSlots.includes(slot);
    const rDone = rehabDone(wId, slot);
    return (
      <div style={{ marginTop: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, color: isDefault ? "#a78bfa" : "#52525b" }}>
            {isDefault ? "REHAB SESSION · DEFAULT" : "REHAB"}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="hoverlift" onClick={() => { setTab("rehab"); setStep(0); }}
              style={{ fontSize: 9.5, padding: "3px 10px", background: "transparent", color: "#a78bfa", border: "1px solid #a78bfa66", fontFamily: "inherit" }}>
              OPEN GUIDED →
            </button>
            <button className="hoverlift" onClick={() => toggleRehabDone(wId, slot)}
              style={{ fontSize: 9.5, padding: "3px 10px", background: rDone ? "#a78bfa" : "transparent", color: rDone ? "#080808" : "#a78bfa", border: "1px solid #a78bfa", fontFamily: "inherit" }}>
              {rDone ? "✓ REHAB DONE" : "MARK REHAB DONE"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StrengthBlock = ({ wId, slot, defSlots }) => {
    const ids = slotStrength(wId, slot, defSlots);
    const isDefault = userStrength(wId, slot) === null && defSlots.includes(slot);
    const sDone = strengthDone(wId, slot);
    return (
      <div style={{ marginTop: 4 }}>
        {ids.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, color: "#52525b" }}>STRENGTH SESSION{isDefault ? " · DEFAULT" : ""}</span>
            <button className="hoverlift" onClick={() => toggleStrengthDone(wId, slot)}
              style={{ fontSize: 9.5, padding: "3px 10px", background: sDone ? "#f43f5e" : "transparent", color: sDone ? "#080808" : "#f43f5e", border: "1px solid #f43f5e", fontFamily: "inherit" }}>
              {sDone ? "✓ STRENGTH DONE" : "MARK STRENGTH DONE"}
            </button>
          </div>
        )}
        {ids.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8, opacity: sDone ? 0.55 : 1 }}>
            {ids.map((sid) => {
              const ex = STRENGTH_BY_ID[sid];
              if (!ex) return null;
              return (
                <div key={sid} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 8.5, padding: "2px 6px", flexShrink: 0, marginTop: 1, color: ex.ham ? "#f59e0b" : "#f43f5e", border: "1px solid " + (ex.ham ? "#f59e0b" : "#f43f5e") + "66", background: (ex.ham ? "#f59e0b" : "#f43f5e") + "14" }}>{ex.ham ? "STR · HAM" : "STRENGTH"}</span>
                  <span style={{ fontSize: 10.5, lineHeight: 1.55, color: "#a1a1aa" }}>
                    <span style={{ color: "#e4e4e7" }}>{ex.name}</span> · {ex.dose} — {ex.desc.split(".")[0]}.
                  </span>
                  <button className="hoverlift" onClick={() => toggleStrength(wId, slot, sid, defSlots)} aria-label="Remove" style={{ marginLeft: "auto", flexShrink: 0, fontSize: 10, padding: "0 6px", background: "transparent", color: "#52525b", border: "1px solid #27272a", fontFamily: "inherit" }}>✕</button>
                </div>
              );
            })}
          </div>
        )}
        <button className="hoverlift" onClick={() => { setAttachFor({ weekId: wId, slot }); setStrSel(null); setTab("strength"); }}
          style={{ fontSize: 10, padding: "5px 12px", background: "#f43f5e14", color: "#f43f5e", border: "1px solid #f43f5e66", fontFamily: "inherit" }}>
          {ids.length ? "EDIT STRENGTH +" : "ADD STRENGTH +"}
        </button>
      </div>
    );
  };

  const Fold = ({ open, onToggle, label, count }) => (
    <button onClick={onToggle} className="hoverlift"
      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "9px 12px", background: "#0d0d0d", border: "1px solid #1a1a1a", color: "#a1a1aa", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em", fontSize: 16 }}>
      <span style={{ color: "#52525b", fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{open ? "▾" : "▸"}</span>
      {label}
      {count != null && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, color: "#52525b" }}>({count})</span>}
    </button>
  );

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#e4e4e7", ...S.mono }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: #0d0d0d; }
        ::-webkit-scrollbar-thumb { background: #27272a; }
        .hoverlift { transition: filter .15s ease, transform .15s ease, border-color .15s ease, opacity .2s ease; }
        .hoverlift:hover { filter: brightness(1.25); transform: translateY(-1px); }
        .bar { transition: filter .15s ease; cursor: pointer; }
        .bar:hover { filter: brightness(1.4); }
        .fillbar { transition: height .35s ease, width .35s ease; }
        button { cursor: pointer; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @media (prefers-reduced-motion: reduce) { .hoverlift, .bar, .fillbar { transition: none; } }
      `}</style>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "20px 14px 60px" }}>

        {/* ── HEADER ── */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10, borderBottom: "1px solid #1c1c1c", paddingBottom: 14, marginBottom: 14 }}>
          <div>
            <div style={{ ...S.display, fontSize: 38, lineHeight: 0.95 }}>NYC MARATHON <span style={{ color: "#fb923c" }}>26</span></div>
            <div style={{ fontSize: 10.5, color: "#71717a", marginTop: 4 }}>SUB-4:20 BUILD — CAMERON — JUN 8 → NOV 1</div>
            <div style={{ fontSize: 8.5, marginTop: 3, color: saveState === "error" ? "#f43f5e" : saveState === "local" ? "#f59e0b" : "#3f3f46" }}>
              {saveState === "loading" ? "LOADING SAVED DATA…"
                : saveState === "saving" ? "SAVING…"
                : saveState === "saved" ? "● PROGRESS SAVED"
                : saveState === "error" ? "SAVE FAILED — CHANGES MAY NOT PERSIST"
                : "NO STORAGE AVAILABLE — SESSION ONLY"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, textAlign: "right" }}>
            <div>
              <div style={{ ...S.display, fontSize: 28, color: "#4ade80", lineHeight: 1 }}>{totals.miles.toFixed(1).replace(/\.0$/, "")}</div>
              <div style={{ fontSize: 9.5, color: "#52525b" }}>MILES LOGGED</div>
            </div>
            <div>
              <div style={{ ...S.display, fontSize: 28, color: "#fde047", lineHeight: 1 }}>T-{daysToRace}</div>
              <div style={{ fontSize: 9.5, color: "#52525b" }}>DAYS TO RACE</div>
            </div>
          </div>
        </header>

        {/* ── TABS ── */}
        <nav style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center", position: "relative" }}>
          {[["today", "TODAY"], ["plan", "SCHEDULE"], ["progress", "PROGRESS"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className="hoverlift"
              style={{ ...S.display, fontSize: 17, padding: "7px 16px", background: tab === id ? "#e4e4e7" : "#0d0d0d", color: tab === id ? "#080808" : "#71717a", border: "1px solid " + (tab === id ? "#e4e4e7" : "#1a1a1a") }}>
              {label}
            </button>
          ))}
          {(() => {
            const more = [["paces", "PACES"], ["rehab", "REHAB"], ["strength", "STRENGTH"], ["appendix", "APPENDIX"]];
            const activeMore = more.find(([id]) => id === tab);
            return (
              <div style={{ position: "relative" }}>
                <button onClick={() => setMenuOpen((o) => !o)} className="hoverlift"
                  style={{ ...S.display, fontSize: 17, padding: "7px 16px", background: activeMore ? "#e4e4e7" : "#0d0d0d", color: activeMore ? "#080808" : "#71717a", border: "1px solid " + (activeMore ? "#e4e4e7" : "#1a1a1a"), display: "flex", alignItems: "center", gap: 6 }}>
                  {activeMore ? activeMore[1] : "MORE"} <span style={{ fontSize: 10 }}>▾</span>
                </button>
                {menuOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 20, ...S.surface, background: "#0d0d0d", minWidth: 150, boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}>
                    {more.map(([id, label]) => (
                      <button key={id} onClick={() => { setTab(id); setMenuOpen(false); }} className="hoverlift"
                        style={{ display: "block", width: "100%", textAlign: "left", ...S.display, fontSize: 15, padding: "9px 14px", background: tab === id ? "#1a1a1a" : "transparent", color: tab === id ? "#e4e4e7" : "#a1a1aa", border: "none", borderBottom: "1px solid #141414" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </nav>

        {/* ── MONTH FILTER ── */}
        {(tab === "plan" || tab === "progress" || tab === "strength" || tab === "rehab") && (
          <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
            {MONTHS.map(({ k }) => (
              <button key={k} onClick={() => pickMonth(k)} className="hoverlift"
                style={{ fontSize: 10, padding: "4px 11px", fontFamily: "inherit", background: month === k ? "#27272a" : "transparent", color: month === k ? "#e4e4e7" : "#52525b", border: "1px solid " + (month === k ? "#3f3f46" : "#1a1a1a") }}>
                {k}
              </button>
            ))}
          </div>
        )}

        {/* ════════ TODAY TAB ════════ */}
        {tab === "today" && (() => {
          const td = cellsForDate(now);

          // pre-plan / post-plan states
          if (!td.inPlan) {
            const before = now < PLAN_START;
            return (
              <div style={{ ...S.surface, padding: 24, textAlign: "center" }}>
                <div style={{ ...S.display, fontSize: 26, marginBottom: 6 }}>{before ? "BLOCK STARTS SOON" : "BLOCK COMPLETE"}</div>
                <div style={{ fontSize: 11, color: "#71717a", lineHeight: 1.6, maxWidth: 420, margin: "0 auto 14px" }}>
                  {before
                    ? `Training kicks off Monday, ${fmtDate(PLAN_START)}. Until then, the Schedule tab has the full 21-week build laid out.`
                    : `Race day was ${fmtDate(RACE_DATE)}. However it went — the work in here was real. Open the Schedule tab to review the block.`}
                </div>
                <button className="hoverlift" onClick={() => setTab("plan")}
                  style={{ ...S.display, fontSize: 15, padding: "8px 20px", background: "#e4e4e7", color: "#080808", border: "none" }}>OPEN SCHEDULE →</button>
              </div>
            );
          }

          const w = td.week;
          const ph = PHASES[w.ph];
          const wst = weekStats(w);
          const L = load(w);
          const wkLogged = w.days.reduce((a, d, di) => { if (d.t === "rest" || !isDone(w.id, di)) return a; const lg = getLog(w.id, di); return a + ((lg && lg.dist) ? lg.dist : d.m); }, 0);

          // rolling 7-day window: today -3 ... today +3
          const windowDays = [];
          for (let off = -3; off <= 3; off++) {
            const dt = new Date(now); dt.setHours(0, 0, 0, 0); dt.setDate(dt.getDate() + off);
            windowDays.push({ off, date: dt, cell: cellsForDate(dt) });
          }

          return (
            <div>
              {/* Date + week context strip */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ ...S.display, fontSize: 30, lineHeight: 1 }}>{fmtDate(now)}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                    <span style={{ fontSize: 9.5, padding: "3px 8px", background: ph.color + "1f", color: ph.color, border: "1px solid " + ph.color + "55" }}>{ph.label}</span>
                    <button onClick={() => { selectWeek(w.idx); setTab("plan"); }} className="hoverlift"
                      style={{ fontSize: 10, padding: "3px 8px", background: "transparent", color: "#71717a", border: "1px solid #1a1a1a", fontFamily: "inherit" }}>{w.title} · {w.dates} →</button>
                  </div>
                </div>
              </div>

              {/* Week mileage + progress band */}
              <div style={{ ...S.surface, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontSize: 9.5, color: "#52525b" }}>THIS WEEK</span>
                  <span style={{ fontSize: 10, color: "#71717a" }}>
                    <span style={{ color: "#4ade80" }}>{wkLogged}</span> / {w.mi} MI LOGGED · <span style={{ color: "#e4e4e7" }}>{wst.done}/{wst.total}</span> RUNS
                  </span>
                </div>
                <div style={{ display: "flex", height: 8, border: "1px solid #1a1a1a", marginBottom: 6 }}>
                  <div className="fillbar" style={{ width: (L.easy / (w.mi || 1)) * 100 + "%", background: "#4ade8055" }} />
                  <div className="fillbar" style={{ width: (L.quality / (w.mi || 1)) * 100 + "%", background: "#fb923c66" }} />
                  <div className="fillbar" style={{ width: (L.long / (w.mi || 1)) * 100 + "%", background: "#fb718566" }} />
                </div>
                <div style={{ height: 4, background: "#141414", position: "relative" }}>
                  <div className="fillbar" style={{ position: "absolute", inset: 0, right: "auto", width: (wst.total ? wst.done / wst.total : 0) * 100 + "%", background: "#4ade80" }} />
                </div>
              </div>

              {/* Today's workout(s) */}
              {td.rest ? (
                <div style={{ ...S.surface, padding: 20, marginBottom: 10, textAlign: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: TYPES.rest.color, margin: "0 auto 10px" }} />
                  <div style={{ ...S.display, fontSize: 24 }}>REST DAY</div>
                  <div style={{ fontSize: 11, color: "#71717a", lineHeight: 1.6, maxWidth: 380, margin: "8px auto 0" }}>
                    Adaptation happens now, not in the work. Optional 20–30min walk. A great day to run the guided rehab session.
                  </div>
                  <button className="hoverlift" onClick={() => { setTab("rehab"); setStep(0); }}
                    style={{ marginTop: 12, fontSize: 11, padding: "7px 16px", background: "#a78bfa14", color: "#a78bfa", border: "1px solid #a78bfa66", fontFamily: "inherit" }}>OPEN GUIDED REHAB →</button>
                  <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 14, paddingTop: 12, textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
                    {getLog(w.id, restRunIdx(w)) ? (
                      <LogBlock wId={w.id} origIdx={restRunIdx(w)} planned={{ t: "easy", l: "Unscheduled run", m: 0, p: "—" }} />
                    ) : (
                      <button className="hoverlift" onClick={() => setLogFor({ weekId: w.id, origIdx: restRunIdx(w) })}
                        style={{ alignSelf: "flex-start", fontSize: 10, padding: "5px 12px", background: "#4ade8014", color: "#4ade80", border: "1px solid #4ade8066", fontFamily: "inherit" }}>
                        LOG A RUN (UNSCHEDULED) +
                      </button>
                    )}
                    <RehabBlock wId={w.id} slot={td.dayIdx} defSlots={defRehabOf(w)} />
                    <StrengthBlock wId={w.id} slot={td.dayIdx} defSlots={defStrengthOf(w)} />
                  </div>
                </div>
              ) : td.runs.map((d) => {
                const dDone = isDone(w.id, d.origIdx);
                return (
                  <div key={d.origIdx} style={{ ...S.surface, padding: 16, marginBottom: 10, borderLeft: "3px solid " + TYPES[d.t].color, opacity: dDone ? 0.62 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 9.5, color: "#52525b", marginBottom: 3 }}>TODAY'S WORKOUT{td.runs.length > 1 ? " ·" + " " + (td.runs.indexOf(d) + 1) + " OF " + td.runs.length : ""}</div>
                        <div style={{ ...S.display, fontSize: 26, lineHeight: 1 }}>{d.l}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, padding: "3px 9px", background: TYPES[d.t].color + "1f", color: TYPES[d.t].color, border: "1px solid " + TYPES[d.t].color + "55" }}>{d.p}</span>
                          <span style={{ fontSize: 10, padding: "3px 9px", color: "#e4e4e7", border: "1px solid #27272a" }}>{d.m} MI</span>
                          {d.ham && <span style={{ fontSize: 10, padding: "3px 9px", color: "#f59e0b", border: "1px solid #f59e0b66", background: "#f59e0b14" }}>HAMSTRING WATCH</span>}
                        </div>
                      </div>
                      <button className="hoverlift" onClick={() => setLogFor({ weekId: w.id, origIdx: d.origIdx })}
                        style={{ ...S.display, fontSize: 17, padding: "10px 22px", background: dDone ? "#4ade80" : "transparent", color: dDone ? "#080808" : "#4ade80", border: "1px solid #4ade80" }}>
                        {dDone ? "✓ LOGGED" : "LOG RUN"}
                      </button>
                    </div>
                    <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "#d4d4d8", margin: "0 0 12px" }}>{d.x}</p>
                    {d.n.length > 0 && (
                      <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 12, display: "flex", flexDirection: "column", gap: 9 }}>
                        {d.n.map(([tag, text], ni) => (
                          <div key={ni} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ fontSize: 8.5, padding: "2px 6px", flexShrink: 0, marginTop: 1, color: NOTE_COLORS[tag] || "#71717a", border: "1px solid " + (NOTE_COLORS[tag] || "#3f3f46") + "66", background: (NOTE_COLORS[tag] || "#3f3f46") + "14" }}>{tag}</span>
                            <span style={{ fontSize: 11, lineHeight: 1.6, color: "#a1a1aa" }}>{text}</span>
                          </div>
                        ))}
                        {d.n.some(([tag]) => tag === "REHAB") && (
                          <button className="hoverlift" onClick={() => { setTab("rehab"); setStep(0); }}
                            style={{ alignSelf: "flex-start", fontSize: 10, padding: "5px 12px", background: "#f59e0b14", color: "#f59e0b", border: "1px solid #f59e0b66", fontFamily: "inherit" }}>
                            OPEN GUIDED REHAB SESSION →
                          </button>
                        )}
                      </div>
                    )}
                    <div style={{ borderTop: d.n.length > 0 ? "none" : "1px solid #1a1a1a", paddingTop: d.n.length > 0 ? 4 : 12, display: "flex", flexDirection: "column", gap: 10 }}>
                      {getLog(w.id, d.origIdx) && <LogBlock wId={w.id} origIdx={d.origIdx} planned={d} />}
                      <RehabBlock wId={w.id} slot={slotOfRun(w, d.origIdx)} defSlots={defRehabOf(w)} />
                      <StrengthBlock wId={w.id} slot={slotOfRun(w, d.origIdx)} defSlots={defStrengthOf(w)} />
                    </div>
                  </div>
                );
              })}

              {/* Rolling 7-day strip */}
              <div style={{ ...S.surface, padding: "12px 10px 10px" }}>
                <div style={{ fontSize: 9.5, color: "#52525b", marginBottom: 8 }}>LAST 3 · TODAY · NEXT 3</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                  {windowDays.map(({ off, date, cell }) => {
                    const isToday = off === 0;
                    const runs = cell.runs || [];
                    const top = runs[0];
                    const tc = top ? TYPES[top.t] : TYPES.rest;
                    const allDone = cell.inPlan && runs.length > 0 && runs.every((r) => isDone(cell.week.id, r.origIdx));
                    const clickTarget = () => { if (cell.inPlan) { selectWeek(cell.weekIdx); setTab("plan"); } };
                    return (
                      <div key={off} onClick={clickTarget} className={cell.inPlan ? "hoverlift" : ""}
                        style={{ ...S.surface2, padding: "7px 3px 6px", minHeight: 78, cursor: cell.inPlan ? "pointer" : "default", textAlign: "center", position: "relative", opacity: cell.inPlan ? (allDone ? 0.5 : 1) : 0.3, borderColor: isToday ? tc.color : "#141414", boxShadow: isToday ? `0 0 0 1px ${tc.color}` : "none" }}>
                        {allDone && <span style={{ position: "absolute", top: 3, right: 4, fontSize: 9, color: "#4ade80" }}>✓</span>}
                        <div style={{ fontSize: 8, color: isToday ? "#e4e4e7" : "#52525b", marginBottom: 5 }}>
                          {date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                        </div>
                        <div style={{ fontSize: 8.5, color: "#3f3f46", marginBottom: 5 }}>{date.getDate()}</div>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: tc.color, margin: "0 auto 5px" }} />
                        <div style={{ fontSize: 8, color: "#a1a1aa", lineHeight: 1.2, minHeight: 20 }}>
                          {!cell.inPlan ? "—" : runs.length === 0 ? "Rest" : runs.length > 1 ? `${runs.length} runs` : top.l}
                        </div>
                        <div style={{ fontSize: 9.5, color: cell.inPlan && runs.length ? "#e4e4e7" : "#3f3f46", marginTop: 3 }}>
                          {cell.inPlan && runs.length ? runs.reduce((a, r) => a + r.m, 0) + "mi" : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ════════ PLAN TAB ════════ */}
        {tab === "plan" && (
          <div>
            {/* Mileage chart (filtered) */}
            <div style={{ ...S.surface, padding: "14px 12px 8px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "#52525b" }}>{month === "ALL" ? "FULL SEASON" : month} — WEEKLY MILEAGE</span>
                <span />              
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 110 }}>
                {visible.map((w) => {
                  const st = weekStats(w);
                  const frac = st.total ? st.done / st.total : 0;
                  const c = PHASES[w.ph].color;
                  const h = Math.max(8, (w.mi / maxMi) * 100);
                  const sel = w.idx === wk;
                  return (
                    <div key={w.id} className="bar" onClick={() => selectWeek(w.idx)} title={`${w.title} — ${w.mi}mi`}
                      style={{ flex: 1, height: h + "%", position: "relative", background: c + "26", border: "1px solid " + (sel ? c : c + "55"), boxShadow: sel ? `0 0 0 1px ${c}` : "none" }}>
                      <div className="fillbar" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: (frac * 100) + "%", background: c + "66" }} />
                      <div style={{ position: "absolute", bottom: -16, left: 0, right: 0, textAlign: "center", fontSize: 8, color: sel ? "#e4e4e7" : "#3f3f46" }}>{w.tick}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ height: 18 }} />
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", borderTop: "1px solid #141414", paddingTop: 8 }}>
                {Object.values(PHASES).map((p) => (
                  <span key={p.label} style={{ fontSize: 9.5, color: "#71717a", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 8, height: 8, background: p.color, display: "inline-block" }} />{p.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Week panel */}
            <div style={{ ...S.surface, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ ...S.display, fontSize: 28, lineHeight: 1 }}>{week.title}</span>
                  <span style={{ fontSize: 9.5, padding: "3px 8px", background: phase.color + "1f", color: phase.color, border: "1px solid " + phase.color + "55" }}>{phase.label}</span>
                  {weekStats(week).full && (
                    <span style={{ fontSize: 9.5, padding: "3px 8px", background: "#4ade8022", color: "#4ade80", border: "1px solid #4ade8066" }}>✓ COMPLETE</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="hoverlift" disabled={wk === 0} onClick={() => selectWeek(wk - 1)}
                    style={{ padding: "5px 12px", background: "#0f0f0f", color: wk === 0 ? "#3f3f46" : "#a1a1aa", border: "1px solid #1a1a1a", fontSize: 12, fontFamily: "inherit" }}>← PREV</button>
                  <button className="hoverlift" disabled={wk === PLAN.length - 1} onClick={() => selectWeek(wk + 1)}
                    style={{ padding: "5px 12px", background: "#0f0f0f", color: wk === PLAN.length - 1 ? "#3f3f46" : "#a1a1aa", border: "1px solid #1a1a1a", fontSize: 12, fontFamily: "inherit" }}>NEXT →</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 10.5, color: "#71717a", marginBottom: 10 }}>
                <span>{week.dates}</span>
                <span><span style={{ color: "#e4e4e7" }}>{week.mi}</span> MI PLANNED</span>
                <span>LONG RUN <span style={{ color: "#e4e4e7" }}>{week.lr}</span> MI</span>
              </div>

              {/* Adjust week controls */}
              <div style={{ ...S.surface2, padding: "9px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9.5, color: "#52525b" }}>ADJUST WEEK</span>
                <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <button className="hoverlift" style={stepBtn} aria-label="Decrease weekly miles"
                    onClick={() => setOverride(week.id, { mi: clamp(week.mi - 1, 6, 70) })}>−</button>
                  <input type="number" value={week.mi} min={6} max={70} aria-label="Weekly miles"
                    onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) setOverride(week.id, { mi: clamp(v, 6, 70) }); }}
                    style={{ width: 44, background: "#080808", color: "#e4e4e7", border: "1px solid #27272a", fontFamily: "inherit", fontSize: 13, textAlign: "center", padding: "4px 2px" }} />
                  <button className="hoverlift" style={stepBtn} aria-label="Increase weekly miles"
                    onClick={() => setOverride(week.id, { mi: clamp(week.mi + 1, 6, 70) })}>+</button>
                  <span style={{ fontSize: 9.5, color: "#52525b" }}>MI</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <button className="hoverlift" style={stepBtn} aria-label="Fewer run days"
                    onClick={() => setOverride(week.id, { days: clamp(wkRunDays - 1, 2, 6) })}>−</button>
                  <span style={{ width: 20, textAlign: "center", fontSize: 13 }}>{wkRunDays}</span>
                  <button className="hoverlift" style={stepBtn} aria-label="More run days"
                    onClick={() => setOverride(week.id, { days: clamp(wkRunDays + 1, 2, 6) })}>+</button>
                  <span style={{ fontSize: 9.5, color: "#52525b" }}>RUN DAYS{hasRace ? " + RACE" : ""}</span>
                </span>
                {week.edited && (
                  <button className="hoverlift" onClick={() => resetWeek(week.id)}
                    style={{ padding: "4px 10px", background: "transparent", color: "#71717a", border: "1px solid #27272a", fontSize: 10, fontFamily: "inherit" }}>RESET</button>
                )}
              </div>

              {/* Training load stacked bar */}
              {(() => {
                const L = load(week);
                const tot = L.easy + L.quality + L.long || 1;
                return (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", height: 8, border: "1px solid #1a1a1a" }}>
                      <div className="fillbar" style={{ width: (L.easy / tot) * 100 + "%", background: "#4ade8055" }} />
                      <div className="fillbar" style={{ width: (L.quality / tot) * 100 + "%", background: "#fb923c66" }} />
                      <div className="fillbar" style={{ width: (L.long / tot) * 100 + "%", background: "#fb718566" }} />
                    </div>
                    <div style={{ display: "flex", gap: 14, fontSize: 9, color: "#52525b", marginTop: 5 }}>
                      <span><span style={{ color: "#4ade80" }}>■</span> EASY {L.easy}MI</span>
                      <span><span style={{ color: "#fb923c" }}>■</span> QUALITY {L.quality}MI</span>
                      <span><span style={{ color: "#fb7185" }}>■</span> LONG {L.long}MI</span>
                    </div>
                  </div>
                );
              })()}

              {/* Move-mode banner */}
              {moving !== null && (() => { const mv = week.days[moving]; return (
                <div style={{ ...S.surface2, borderColor: "#f59e0b66", padding: "8px 12px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: "#f59e0b" }}>MOVING: {mv.l} ({mv.m} MI) — TAP A DAY TO PLACE IT</span>
                  <button onClick={() => setMoving(null)} className="hoverlift" style={{ fontSize: 10, padding: "3px 10px", background: "transparent", color: "#71717a", border: "1px solid #27272a", fontFamily: "inherit" }}>CANCEL</button>
                </div>
              ); })()}

              {/* 7-day grid — tap to open · hold a run to move it */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
                {slots.map((runs, si) => (
                  <div key={si} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {runs.length === 0 ? (() => {
                      const sel = day && day.k === "rest" && day.i === si;
                      return (
                        <div className="hoverlift"
                          onClick={() => {
                            if (moving !== null) { applyMove(week.id, moving, si); setMoving(null); return; }
                            setDay(sel ? null : { k: "rest", i: si }); setShowNotes(false);
                          }}
                          style={{ ...S.surface2, position: "relative", padding: "8px 5px 7px", cursor: "pointer", minHeight: 84, borderColor: moving !== null ? "#f59e0b44" : sel ? "#3f3f46" : "#141414", borderStyle: moving !== null ? "dashed" : "solid" }}>
                          <div style={{ fontSize: 9, color: "#52525b", textAlign: "center", marginBottom: 6 }}>{DAYS[si]}</div>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: TYPES.rest.color, margin: "0 auto 6px" }} />
                          <div style={{ fontSize: 9, color: "#a1a1aa", textAlign: "center", lineHeight: 1.25, minHeight: 23 }}>Rest</div>
                          <div style={{ fontSize: 11, color: "#3f3f46", textAlign: "center", marginTop: 4 }}>—</div>
                        </div>
                      );
                    })() : runs.map((r, ri) => {
                      const dDone = isDone(week.id, r.origIdx);
                      const sel = day && day.k === "run" && day.i === r.origIdx;
                      const tc = TYPES[r.t];
                      const lifted = moving === r.origIdx;
                      return (
                        <div key={r.origIdx} className="hoverlift" onContextMenu={(e) => e.preventDefault()}
                          onTouchStart={() => pressStart(r.origIdx)} onTouchEnd={pressEnd} onTouchMove={pressEnd}
                          onMouseDown={() => pressStart(r.origIdx)} onMouseUp={pressEnd} onMouseLeave={pressEnd}
                          onClick={() => {
                            if (lpFired.current) { lpFired.current = false; return; }
                            if (moving !== null) {
                              if (moving === r.origIdx) { setMoving(null); return; }
                              applyMove(week.id, moving, si); setMoving(null); return;
                            }
                            setDay(sel ? null : { k: "run", i: r.origIdx }); setShowNotes(false);
                          }}
                          style={{ ...S.surface2, position: "relative", padding: ri === 0 ? "8px 5px 7px" : "6px 5px 6px", cursor: moving !== null ? "copy" : "pointer", minHeight: runs.length > 1 ? 62 : 84, opacity: dDone && !lifted ? 0.5 : 1, borderColor: lifted ? "#f59e0b" : sel ? tc.color : moving !== null ? "#f59e0b44" : "#141414", borderStyle: moving !== null && !lifted ? "dashed" : "solid", boxShadow: lifted ? "0 0 0 1px #f59e0b" : "none", transform: lifted ? "translateY(-3px)" : "none", userSelect: "none", WebkitUserSelect: "none", touchAction: "manipulation" }}>
                          {dDone && <span style={{ position: "absolute", top: 4, right: 5, fontSize: 10, color: "#4ade80" }}>✓</span>}
                          {r.ham && <span title="Hamstring watch" style={{ position: "absolute", top: 6, left: 6, width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />}
                          {ri === 0 && <div style={{ fontSize: 9, color: "#52525b", textAlign: "center", marginBottom: 6 }}>{DAYS[si]}</div>}
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: tc.color, margin: "0 auto 6px" }} />
                          <div style={{ fontSize: 9, color: "#a1a1aa", textAlign: "center", lineHeight: 1.25, minHeight: runs.length > 1 ? 12 : 23 }}>{r.l}</div>
                          <div style={{ fontSize: 11, color: "#e4e4e7", textAlign: "center", marginTop: 4 }}>{r.m} MI</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 8.5, color: "#3f3f46", marginTop: 6 }}>HOLD A RUN TO MOVE IT TO ANOTHER DAY</div>

              {/* Day detail */}
              {day !== null && (() => {
                const isRest = day.k === "rest";
                const baseDay = isRest ? week.days[day.i] : null;
                const d = isRest
                  ? (baseDay.t === "rest" ? baseDay : { d: DAYS[day.i], t: "rest", l: "Rest", m: 0, p: "—", x: "Rest. The scheduled run was moved to another day.", n: [] })
                  : week.days[day.i];
                const slotName = isRest ? DAYS[day.i] : DAYS[slotOf(day.i)];
                const dDone = !isRest && isDone(week.id, day.i);
                return (
                  <div style={{ ...S.surface2, marginTop: 10, padding: 14, borderLeft: "2px solid " + TYPES[d.t].color }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ ...S.display, fontSize: 20, lineHeight: 1 }}>{slotName} — {d.l}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 9.5, padding: "2px 7px", background: TYPES[d.t].color + "1f", color: TYPES[d.t].color, border: "1px solid " + TYPES[d.t].color + "55" }}>{d.p}</span>
                          {!isRest && d.t !== "race" ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <button className="hoverlift" aria-label="Decrease day miles"
                                onClick={() => setDayMiles(week.id, day.i, Math.max(1, d.m - 1))}
                                style={{ width: 20, height: 20, padding: 0, lineHeight: "18px", textAlign: "center", background: "#0f0f0f", color: "#a1a1aa", border: "1px solid #27272a", fontFamily: "inherit", fontSize: 12 }}>−</button>
                              <input type="number" value={d.m} min={1} max={30} aria-label="Day miles"
                                onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) setDayMiles(week.id, day.i, v); }}
                                style={{ width: 38, background: "#080808", color: "#e4e4e7", border: "1px solid " + (dayPinned(week.id, day.i) ? "#fde04766" : "#27272a"), fontFamily: "inherit", fontSize: 12, textAlign: "center", padding: "2px 0" }} />
                              <button className="hoverlift" aria-label="Increase day miles"
                                onClick={() => setDayMiles(week.id, day.i, d.m + 1)}
                                style={{ width: 20, height: 20, padding: 0, lineHeight: "18px", textAlign: "center", background: "#0f0f0f", color: "#a1a1aa", border: "1px solid #27272a", fontFamily: "inherit", fontSize: 12 }}>+</button>
                              <span style={{ fontSize: 9.5, color: "#52525b" }}>MI</span>
                              {dayPinned(week.id, day.i) && (
                                <button className="hoverlift" onClick={() => setDayMiles(week.id, day.i, null)} title="Unpin — let week edits redistribute this day again"
                                  style={{ fontSize: 8.5, padding: "2px 6px", background: "#fde04714", color: "#fde047", border: "1px solid #fde04766", fontFamily: "inherit" }}>📌 PINNED ✕</button>
                              )}
                            </span>
                          ) : d.m > 0 ? (
                            <span style={{ fontSize: 9.5, padding: "2px 7px", color: "#71717a", border: "1px solid #27272a" }}>{d.m} MI</span>
                          ) : null}
                        </div>
                      </div>
                      {!isRest && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="hoverlift" onClick={() => setMoving(day.i)}
                            style={{ ...S.display, fontSize: 14, padding: "7px 14px", background: "transparent", color: "#f59e0b", border: "1px solid #f59e0b66" }}>
                            MOVE
                          </button>
                          {d.t !== "race" && (
                            <button className="hoverlift" onClick={() => { setDeleted(week.id, day.i, true); setDay(null); }}
                              style={{ ...S.display, fontSize: 14, padding: "7px 14px", background: "transparent", color: "#f43f5e", border: "1px solid #f43f5e66" }}>
                              DELETE
                            </button>
                          )}
                          <button className="hoverlift" onClick={() => setLogFor({ weekId: week.id, origIdx: day.i })}
                            style={{ ...S.display, fontSize: 15, padding: "7px 18px", background: dDone ? "#4ade80" : "transparent", color: dDone ? "#080808" : "#4ade80", border: "1px solid #4ade80" }}>
                            {dDone ? "✓ LOGGED" : "LOG RUN"}
                          </button>
                        </div>
                      )}
                      {isRest && dayDeleted(week.id, day.i) && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="hoverlift" onClick={() => setDeleted(week.id, day.i, false)}
                            style={{ ...S.display, fontSize: 14, padding: "7px 14px", background: "transparent", color: "#4ade80", border: "1px solid #4ade8066" }}>
                            RESTORE RUN
                          </button>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 12, lineHeight: 1.65, color: "#d4d4d8", margin: "0 0 10px" }}>{d.x}</p>
                    {d.n.length > 0 && (
                      <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 8 }}>
                        <Fold open={showNotes} onToggle={() => setShowNotes(!showNotes)} label="COACHING NOTES" count={d.n.length} />
                        {showNotes && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 2px 2px" }}>
                            {d.n.map(([tag, text], ni) => (
                              <div key={ni} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <span style={{ fontSize: 8.5, padding: "2px 6px", flexShrink: 0, marginTop: 1, color: NOTE_COLORS[tag] || "#71717a", border: "1px solid " + (NOTE_COLORS[tag] || "#3f3f46") + "66", background: (NOTE_COLORS[tag] || "#3f3f46") + "14" }}>{tag}</span>
                                <span style={{ fontSize: 10.5, lineHeight: 1.55, color: "#a1a1aa" }}>{text}</span>
                              </div>
                            ))}
                            {d.n.some(([tag]) => tag === "REHAB") && (
                              <button className="hoverlift" onClick={() => { setTab("rehab"); setStep(0); }}
                                style={{ alignSelf: "flex-start", fontSize: 10, padding: "5px 12px", background: "#f59e0b14", color: "#f59e0b", border: "1px solid #f59e0b66", fontFamily: "inherit" }}>
                                OPEN GUIDED REHAB SESSION →
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 8, marginTop: d.n.length > 0 ? 8 : 0, display: "flex", flexDirection: "column", gap: 10 }}>
                      {!isRest && getLog(week.id, day.i) && <LogBlock wId={week.id} origIdx={day.i} planned={d} />}
                      {isRest && (
                        getLog(week.id, restSlotIdx(day.i)) ? (
                          <LogBlock wId={week.id} origIdx={restSlotIdx(day.i)} planned={{ t: "easy", l: "Unscheduled run", m: 0, p: "—" }} />
                        ) : (
                          <button className="hoverlift" onClick={() => setLogFor({ weekId: week.id, origIdx: restSlotIdx(day.i) })}
                            style={{ alignSelf: "flex-start", fontSize: 10, padding: "5px 12px", background: "#4ade8014", color: "#4ade80", border: "1px solid #4ade8066", fontFamily: "inherit" }}>
                            LOG A RUN (UNSCHEDULED) +
                          </button>
                        )
                      )}
                      <RehabBlock wId={week.id} slot={isRest ? day.i : slotOf(day.i)} defSlots={defRehabOf(week)} />
                      <StrengthBlock wId={week.id} slot={isRest ? day.i : slotOf(day.i)} defSlots={defStrengthOf(week)} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ════════ PACES TAB ════════ */}
        {tab === "paces" && (
          <div>
            <div style={{ ...S.display, fontSize: 20, marginBottom: 8 }}>PACE REFERENCE — SUB-4:20</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 8, marginBottom: 20 }}>
              {ZONES.map((z, i) => (
                <div key={i} style={{ ...S.surface, padding: "12px 14px", borderLeft: "3px solid " + z.color }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 4 }}>
                    <span style={{ ...S.display, fontSize: 15 }}>{z.name}</span>
                    <span style={{ fontSize: 9.5, color: "#52525b" }}>{z.km}</span>
                  </div>
                  <div style={{ ...S.display, fontSize: 26, color: z.color, margin: "4px 0 6px" }}>{z.mi}</div>
                  <div style={{ fontSize: 10, lineHeight: 1.55, color: "#71717a" }}>{z.use}</div>
                </div>
              ))}
            </div>

            <div style={{ ...S.display, fontSize: 20, marginBottom: 8 }}>RACE DAY SPLITS — EVEN EFFORT @ 9:55/MI</div>
            <div style={{ ...S.surface, overflow: "hidden" }}>
              {SPLITS.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 16px", borderBottom: i < SPLITS.length - 1 ? "1px solid #141414" : "none", background: s.cp === "FINISH" ? "#fde04711" : "transparent" }}>
                  <span style={{ fontSize: 12, color: s.cp === "FINISH" ? "#fde047" : "#a1a1aa" }}>{s.cp}</span>
                  <span style={{ fontSize: 12, color: s.cp === "FINISH" ? "#fde047" : "#e4e4e7" }}>{s.t}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 9.5, color: "#52525b", marginTop: 8, lineHeight: 1.6 }}>
              SPLITS ASSUME PERFECTLY EVEN PACING. RACE PLAN IS A SLIGHT NEGATIVE-EFFORT SPLIT: 10:05–10:10/MI THROUGH MILE 10, 9:55/MI THROUGH MILE 20, THEN RACE THE LAST 10K. EXPECT TO BE ~90 SEC BEHIND THESE SPLITS AT HALFWAY — THAT IS THE PLAN WORKING.
            </p>
          </div>
        )}

        {/* ════════ PROGRESS TAB ════════ */}
        {tab === "progress" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 18 }}>
              {[
                { label: "RUNS DONE", value: `${totals.doneRuns} / ${totals.runs}`, color: "#4ade80" },
                { label: "MILES LOGGED", value: totals.miles.toFixed(1).replace(/\.0$/, ""), color: "#38bdf8" },
                { label: "COMPLETION", value: pct + "%", color: "#fb923c" },
              ].map((s, i) => (
                <div key={i} style={{ ...S.surface, padding: "14px 16px" }}>
                  <div style={{ fontSize: 9.5, color: "#52525b", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ ...S.display, fontSize: 32, color: s.color, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ ...S.display, fontSize: 20, marginBottom: 8 }}>{month === "ALL" ? "WEEK-BY-WEEK" : month + " — WEEK-BY-WEEK"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {visible.map((w) => {
                const st = weekStats(w);
                const frac = st.total ? st.done / st.total : 0;
                const c = PHASES[w.ph].color;
                return (
                  <div key={w.id} className="hoverlift" onClick={() => { selectWeek(w.idx); setTab("plan"); }}
                    style={{ ...S.surface, padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ ...S.display, fontSize: 16, width: 58, flexShrink: 0 }}>{w.title}</span>
                    <span style={{ width: 8, height: 8, background: c, flexShrink: 0 }} title={PHASES[w.ph].label} />
                    <div style={{ flex: 1, height: 6, background: "#141414", position: "relative" }}>
                      <div className="fillbar" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: frac * 100 + "%", background: c }} />
                    </div>
                    <span style={{ fontSize: 10, color: st.full ? "#4ade80" : "#71717a", width: 42, textAlign: "right", flexShrink: 0 }}>{st.done}/{st.total}</span>
                    <span style={{ fontSize: 10, color: "#52525b", width: 46, textAlign: "right", flexShrink: 0 }}>{w.mi} MI</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════ REHAB TAB ════════ */}
        {tab === "rehab" && (
          <div>
            {step === null ? (
              <div>
                {/* Weekly rehab tracker */}
                {(() => {
                  const vis = monthIdx === null ? EFF : EFF.filter((w) => w.months.includes(monthIdx));
                  const seasonDone = EFF.reduce((a, w) => a + rehabStats(w).done, 0);
                  const seasonPlanned = EFF.reduce((a, w) => a + Math.min(REHAB_GOAL, rehabStats(w).planned), 0);
                  return (
                    <div style={{ ...S.surface, padding: "14px 12px 8px", marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "#52525b" }}>REHAB TRACKER — GOAL {REHAB_GOAL}× / WK</span>
                        <span style={{ fontSize: 10, color: "#71717a" }}><span style={{ color: "#a78bfa" }}>{seasonDone}</span> / {seasonPlanned} SESSIONS DONE</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 70 }}>
                        {vis.map((w) => {
                          const st = rehabStats(w);
                          const sel = w.idx === wk;
                          return (
                            <div key={w.id} className="bar" onClick={() => selectWeek(w.idx)} title={`${w.title} — ${st.done}/${REHAB_GOAL} rehab done`}
                              style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 2, cursor: "pointer" }}>
                              {Array.from({ length: REHAB_GOAL }).map((_, k) => {
                                const filled = k < st.done;
                                return (
                                  <div key={k} style={{ flex: 1, minHeight: 8, background: filled ? "#a78bfa" : "#a78bfa22", border: "1px solid " + (sel ? "#a78bfa88" : "#1a1a1a") }} />
                                );
                              })}
                              <div style={{ textAlign: "center", fontSize: 8, color: sel ? "#e4e4e7" : "#3f3f46" }}>{w.tick}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", borderTop: "1px solid #141414", paddingTop: 8, marginTop: 6 }}>
                        <span style={{ fontSize: 9, color: "#71717a", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, background: "#a78bfa", display: "inline-block" }} />DONE</span>
                        <span style={{ fontSize: 9, color: "#71717a", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, background: "#a78bfa22", display: "inline-block" }} />PLANNED</span>
                        <span style={{ fontSize: 9, color: "#71717a" }}>MARK DONE ON A DAY (default rest days), OR TAP A WEEK</span>
                      </div>
                    </div>
                  );
                })()}
                <div style={{ ...S.surface, padding: 16, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ ...S.display, fontSize: 22, lineHeight: 1 }}>GUIDED SESSION</div>
                    <div style={{ fontSize: 10, color: "#71717a", marginTop: 4, lineHeight: 1.5 }}>THE FULL PROTOCOL, ONE EXERCISE AT A TIME — ~15 MIN. RUN IT ON REST DAYS AND AFTER QUALITY OR LONG RUNS.</div>
                  </div>
                  <button onClick={() => setStep(0)} className="hoverlift"
                    style={{ ...S.display, fontSize: 16, padding: "9px 22px", background: "#f59e0b", color: "#080808", border: "1px solid #f59e0b" }}>
                    START →
                  </button>
                </div>

                <div style={{ ...S.display, fontSize: 20, marginBottom: 8 }}>EXERCISE LIBRARY</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
                  {EXERCISES.map((ex, i) => (
                    <div key={i} className="hoverlift" onClick={() => { const si = SESSION.indexOf(ex); if (si >= 0) setStep(si); }}
                      style={{ ...S.surface, padding: 14, cursor: ex.preRun ? "default" : "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ ...S.display, fontSize: 15 }}>{ex.name}</span>
                        <span style={{ fontSize: 9, padding: "2px 7px", color: ex.preRun ? "#38bdf8" : "#f59e0b", border: "1px solid " + (ex.preRun ? "#38bdf866" : "#f59e0b66"), background: (ex.preRun ? "#38bdf8" : "#f59e0b") + "14" }}>{ex.preRun ? "PRE-RUN" : ex.dose}</span>
                      </div>
                      <div style={{ fontSize: 8.5, color: "#52525b", margin: "4px 0 8px" }}>{ex.target}</div>
                      {ex.svg}
                      <div style={{ fontSize: 10, lineHeight: 1.55, color: "#a1a1aa", marginTop: 8 }}>{ex.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12, fontSize: 9, color: "#52525b" }}>
                  <span><span style={{ color: "#e4e4e7" }}>━</span> WORKING POSITION</span>
                  <span><span style={{ color: "#52525b" }}>┅</span> START POSITION</span>
                  <span><span style={{ color: "#f59e0b" }}>━</span> WHERE YOU SHOULD FEEL IT</span>
                </div>
              </div>
            ) : (() => {
              const ex = SESSION[step];
              const last = step === SESSION.length - 1;
              return (
                <div style={{ ...S.surface, padding: 16, maxWidth: 560, margin: "0 auto" }}>
                  {/* progress segments */}
                  <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                    {SESSION.map((_, i) => (
                      <div key={i} style={{ flex: 1, height: 4, background: i <= step ? "#f59e0b" : "#1a1a1a" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ ...S.display, fontSize: 24, lineHeight: 1 }}>{ex.name}</span>
                    <span style={{ fontSize: 10, color: "#52525b" }}>{step + 1} OF {SESSION.length}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, margin: "8px 0 12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, padding: "3px 9px", color: "#f59e0b", border: "1px solid #f59e0b66", background: "#f59e0b14" }}>{ex.dose}</span>
                    <span style={{ fontSize: 10, padding: "3px 9px", color: "#71717a", border: "1px solid #27272a" }}>{ex.target}</span>
                  </div>
                  <div style={{ ...S.surface2, padding: "14px 8px", marginBottom: 12 }}>{ex.svg}</div>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: "#d4d4d8", margin: "0 0 10px" }}>{ex.desc}</p>
                  <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 10, marginBottom: 14 }}>
                    {ex.cues.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 10.5, lineHeight: 1.6, color: "#a1a1aa", marginBottom: 4 }}>
                        <span style={{ color: "#f59e0b", flexShrink: 0 }}>—</span><span>{c}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <button className="hoverlift" onClick={() => setStep(step === 0 ? null : step - 1)}
                      style={{ padding: "8px 16px", background: "#0f0f0f", color: "#a1a1aa", border: "1px solid #1a1a1a", fontSize: 12, fontFamily: "inherit" }}>
                      {step === 0 ? "EXIT" : "← BACK"}
                    </button>
                    <button className="hoverlift" onClick={() => setStep(last ? null : step + 1)}
                      style={{ ...S.display, fontSize: 15, padding: "8px 22px", background: last ? "#4ade80" : "#f59e0b", color: "#080808", border: "none" }}>
                      {last ? "✓ FINISH SESSION" : "NEXT →"}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ════════ STRENGTH TAB ════════ */}
        {tab === "strength" && (
          <div>
            {attachFor && (() => {
              const w = EFF.find((x) => x.id === attachFor.weekId);
              const label = w ? `${w.title} · ${DAYS[attachFor.slot]}` : "";
              return (
                <div style={{ ...S.surface, borderColor: "#f43f5e66", padding: "9px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: "#f43f5e" }}>ADDING STRENGTH TO {label} — TAP EXERCISES TO ADD / REMOVE</span>
                  <button onClick={() => setAttachFor(null)} className="hoverlift" style={{ fontSize: 10, padding: "3px 10px", background: "transparent", color: "#71717a", border: "1px solid #27272a", fontFamily: "inherit" }}>DONE</button>
                </div>
              );
            })()}

            {/* Weekly strength tracker */}
            {(() => {
              const vis = monthIdx === null ? EFF : EFF.filter((w) => w.months.includes(monthIdx));
              const seasonDone = EFF.reduce((a, w) => a + strengthStats(w).done, 0);
              const seasonPlanned = EFF.reduce((a, w) => a + strengthStats(w).planned, 0);
              return (
                <div style={{ ...S.surface, padding: "14px 12px 8px", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                    <span style={{ fontSize: 10, color: "#52525b" }}>STRENGTH TRACKER — GOAL {STRENGTH_GOAL}× / WK</span>
                    <span style={{ fontSize: 10, color: "#71717a" }}><span style={{ color: "#f43f5e" }}>{seasonDone}</span> / {seasonPlanned} SESSIONS DONE</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 70 }}>
                    {vis.map((w) => {
                      const st = strengthStats(w);
                      const goal = Math.min(STRENGTH_GOAL, st.planned || STRENGTH_GOAL) || 1;
                      const sel = w.idx === wk;
                      return (
                        <div key={w.id} className="bar" onClick={() => selectWeek(w.idx)} title={`${w.title} — ${st.done}/${st.total} strength done`}
                          style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 2, cursor: "pointer" }}>
                          {Array.from({ length: STRENGTH_GOAL }).map((_, k) => {
                            const filled = k < st.done;
                            const planned = k < st.total;
                            return (
                              <div key={k} style={{ flex: 1, minHeight: 8, background: filled ? "#f43f5e" : planned ? "#f43f5e33" : "#141414", border: "1px solid " + (sel ? "#f43f5e88" : "#1a1a1a") }} />
                            );
                          })}
                          <div style={{ textAlign: "center", fontSize: 8, color: sel ? "#e4e4e7" : "#3f3f46" }}>{w.tick}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", borderTop: "1px solid #141414", paddingTop: 8, marginTop: 6 }}>
                    <span style={{ fontSize: 9, color: "#71717a", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, background: "#f43f5e", display: "inline-block" }} />DONE</span>
                    <span style={{ fontSize: 9, color: "#71717a", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, background: "#f43f5e33", display: "inline-block" }} />PLANNED</span>
                    <span style={{ fontSize: 9, color: "#71717a" }}>TAP A WEEK TO OPEN IT</span>
                  </div>
                </div>
              );
            })()}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
              <div style={{ ...S.display, fontSize: 20 }}>STRENGTH LIBRARY</div>
              <div style={{ fontSize: 9, color: "#52525b", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} /> HAMSTRING / POSTERIOR-CHAIN PRIORITY
              </div>
            </div>
            <div style={{ fontSize: 10, color: "#71717a", lineHeight: 1.55, marginBottom: 12 }}>
              Goal is {STRENGTH_GOAL} sessions/week, defaulted onto rest days (or your easiest run day if you're short on rest). Lead with the amber hamstring work. Tap a card for detail; use ADD STRENGTH on any day to build that day's session.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 8 }}>
              {[...STRENGTH].sort((a, b) => (b.ham ? 1 : 0) - (a.ham ? 1 : 0)).map((ex) => {
                const open = strSel === ex.id;
                const attached = attachFor ? slotStrength(attachFor.weekId, attachFor.slot, defStrengthOf(EFF.find((x) => x.id === attachFor.weekId))).includes(ex.id) : false;
                return (
                  <div key={ex.id} style={{ ...S.surface, padding: 14, borderLeft: "3px solid " + (ex.ham ? "#f59e0b" : "#3f3f46"), cursor: "pointer" }}
                    onClick={() => { if (attachFor) { toggleStrength(attachFor.weekId, attachFor.slot, ex.id, defStrengthOf(EFF.find((x) => x.id === attachFor.weekId))); } else { setStrSel(open ? null : ex.id); } }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ ...S.display, fontSize: 16, display: "flex", alignItems: "center", gap: 7 }}>
                        {ex.ham && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />}
                        {ex.name}
                      </span>
                      <span style={{ fontSize: 9.5, padding: "2px 7px", color: "#fb923c", border: "1px solid #fb923c66", background: "#fb923c14" }}>{ex.dose}</span>
                    </div>
                    <div style={{ fontSize: 8.5, color: "#52525b", margin: "5px 0 0" }}>{ex.target}</div>
                    <div style={{ fontSize: 8.5, color: "#3f3f46", marginTop: 2 }}>{ex.gear}</div>

                    {attachFor ? (
                      <div style={{ marginTop: 10, fontSize: 10, padding: "5px 10px", textAlign: "center", color: attached ? "#080808" : "#f43f5e", background: attached ? "#f43f5e" : "#f43f5e14", border: "1px solid #f43f5e66" }}>
                        {attached ? "✓ ADDED — TAP TO REMOVE" : "+ TAP TO ADD"}
                      </div>
                    ) : open ? (
                      <div style={{ marginTop: 10, borderTop: "1px solid #1a1a1a", paddingTop: 10 }}>
                        <p style={{ fontSize: 11, lineHeight: 1.65, color: "#d4d4d8", margin: "0 0 10px" }}>{ex.desc}</p>
                        {ex.cues.map((c, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, fontSize: 10, lineHeight: 1.55, color: "#a1a1aa", marginBottom: 4 }}>
                            <span style={{ color: ex.ham ? "#f59e0b" : "#71717a", flexShrink: 0 }}>—</span><span>{c}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 10, color: "#71717a", marginTop: 8 }}>Tap for detail ›</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════ APPENDIX TAB ════════ */}
        {tab === "appendix" && (
          <div>
            <div style={{ ...S.display, fontSize: 20, marginBottom: 8 }}>KEY PRINCIPLES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8, marginBottom: 20 }}>
              {PRINCIPLES.map((p, i) => (
                <div key={i} style={{ ...S.surface, padding: "12px 14px" }}>
                  <div style={{ ...S.display, fontSize: 15, color: "#fb923c", marginBottom: 5 }}>{p.title}</div>
                  <div style={{ fontSize: 10.5, lineHeight: 1.6, color: "#a1a1aa" }}>{p.body}</div>
                </div>
              ))}
            </div>

            <div style={{ ...S.display, fontSize: 20, marginBottom: 8 }}>PHASES</div>
            <div style={{ ...S.surface, padding: "10px 14px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 7 }}>
              {Object.values(PHASES).map((p) => (
                <span key={p.label} style={{ fontSize: 10.5, color: "#a1a1aa", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 9, height: 9, background: p.color, flexShrink: 0 }} />
                  <span style={{ width: 64, color: "#e4e4e7" }}>{p.label}</span>
                  <span style={{ color: "#52525b" }}>{p.range}</span>
                </span>
              ))}
            </div>

            <div style={{ ...S.display, fontSize: 20, marginBottom: 8 }}>LEGEND</div>
            <div style={{ ...S.surface, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
              {Object.entries(TYPES).map(([id, t]) => (
                <span key={id} style={{ fontSize: 10.5, color: "#a1a1aa", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />{t.label}
                </span>
              ))}
              <span style={{ fontSize: 10.5, color: "#a1a1aa", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />HAMSTRING WATCH — extra attention day given the right-side history
              </span>
            </div>
          </div>
        )}
      </div>

      {/* LOG ACTIVITY MODAL */}
      {logFor && (() => {
        const w = EFF.find((x) => x.id === logFor.weekId);
        if (!w) return null;
        const planned = logFor.origIdx >= 100
          ? { t: "easy", l: "Unscheduled run", m: 0, p: "—" }
          : w.days[logFor.origIdx];
        if (!planned) return null;
        return (
          <LogForm
            key={logFor.weekId + "-" + logFor.origIdx}
            planned={planned}
            existing={getLog(logFor.weekId, logFor.origIdx)}
            onSave={(entry) => { saveLog(logFor.weekId, logFor.origIdx, entry); setLogFor(null); }}
            onClear={() => { clearLog(logFor.weekId, logFor.origIdx); setLogFor(null); }}
            onClose={() => setLogFor(null)}
            S={S} display={S.display} fmtPace={fmtPace} fmtTime={fmtTime}
            parsePace={parsePace} parseTime={parseTime} MP_SEC={MP_SEC}
          />
        );
      })()}
    </div>
  );
}

