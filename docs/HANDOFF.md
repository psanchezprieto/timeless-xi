# Timeless XI: Session Handoff

Use this file to **resume work in the next Claude Code session**. Copy the prompt under **Copy-Paste Handoff Prompt** and paste when you restart.

---

## **Current Session Status**

**Last completed**: Phase 2b — game component scaffolding (CountryPicker, FormationPicker, DiceRoller, CoachPicker, TournamentSim, CampaignSummary, Game.jsx, constants.js) — built but **NOT YET COMMITTED**
**Current task**: None — commit pending work, then proceed to Phase 2c (real data integration + utils)
**Blocker**: Node v12.22.9 in dev environment. `npm run dev` fails — Vite needs Node 14.18+. Upgrade Node to test locally.

---

## **⚠️ Pending Uncommitted Changes**

All of the following exist on disk but are **not committed**:

| File | Status | Notes |
|------|--------|-------|
| `src/components/Game.jsx` | Untracked | Game flow orchestrator (71 lines) |
| `src/components/CountryPicker.jsx` | Untracked | 85 countries hardcoded + search (167 lines) |
| `src/components/FormationPicker.jsx` | Untracked | 4 formation cards (102 lines) |
| `src/components/DiceRoller.jsx` | Untracked | Placeholder — auto-picks fake players (113 lines) |
| `src/components/CoachPicker.jsx` | Untracked | Placeholder — no real coach data yet (98 lines) |
| `src/components/TournamentSim.jsx` | Untracked | Placeholder — mocked 2-second simulation (70 lines) |
| `src/components/CampaignSummary.jsx` | Untracked | Campaign results display (76 lines) |
| `src/constants.js` | Untracked | FORMATIONS, POSITIONS, TOURNAMENT_YEARS (85 lines) |
| `public/index.html` | Deleted (unstaged) | Was moved to root `index.html` in commit 5d7b64e |
| `src/App.jsx` | Modified | Debug console.logs added; NOT wired to Game.jsx yet |
| `package.json` | Modified | Vite downgraded `^5.0.0 → ^3.2.11` |
| `package-lock.json` | Modified | Regenerated for Vite 3 |
| `README.md` | Modified | Status section updated |

**Action needed**: Commit all of these together as "Phase 2b: Scaffold game components (placeholder data)".

Note: `src/App.jsx` still shows the loading shell and does NOT render `Game.jsx`. Wiring that up is part of Phase 2c.

---

## **Copy-Paste Handoff Prompt for Phase 2c**

```
Resume Timeless XI — World Cup dream team game. Working directory: /home/botuser/timeless-xi

Read first:
- CLAUDE.md (project manifest, tech stack, aesthetic rules)
- docs/PROGRESS.md (phase tracking)
- docs/HANDOFF.md (this file — uncommitted work list)

## CURRENT STATE

Phase 1 (data pipeline): ✅ 100% complete
  - public/data/: 5 squad .json.gz files (138 KB) + coaches.json.gz
  - public/data/meta.json: registry (10,437 players, 85 countries, 457 squads, 258 coaches)

Phase 2a (React shell): ✅ Complete
  - index.html: Vite entry, Tailwind CDN, retro dark theme
  - src/main.jsx + src/App.jsx: loads meta.json, shows retro loading screen

Phase 2b (game components scaffolded): ⚠️ Built but uncommitted
  - src/components/: Game.jsx + 6 screen components (wired flow, placeholder data)
  - src/constants.js: FORMATIONS, POSITIONS, TOURNAMENT_YEARS
  - Components use placeholder/mock data — real data integration is Phase 2c

⚠️ BLOCKER: Node v12.22.9 in this environment. Vite needs Node 14.18+.
  Upgrade Node before running `npm run dev`. If unable to upgrade, skip local dev testing.

## FIRST: Commit pending work

Stage and commit everything:
git add src/components/ src/constants.js src/App.jsx && git add -u && git add index.html 2>/dev/null || true
git commit -m "Phase 2b: Scaffold game components with placeholder data

- Game.jsx: game flow orchestrator (country → formation → dice → coach → tournament → summary)
- CountryPicker.jsx: 85 countries with flags and search
- FormationPicker.jsx: 4 formation cards (4-4-2, 4-3-3, 3-5-2, 5-3-2)
- DiceRoller.jsx: position-by-position UI (placeholder — real data in Phase 2c)
- CoachPicker.jsx: coach selector (placeholder — real data in Phase 2c)
- TournamentSim.jsx: tournament bracket (placeholder simulation)
- CampaignSummary.jsx: results display
- constants.js: FORMATIONS, POSITIONS, TOURNAMENT_YEARS
- Downgrade vite to ^3.2.11 for Node compatibility"

## TASK: Phase 2c — Real Data Integration + Utils

Build the utilities that replace placeholder data with real squad/coach data.

### 1. Create src/utils/db.js

```javascript
import pako from 'pako'

const cache = {}

export async function loadMeta() {
  if (cache.meta) return cache.meta
  const res = await fetch('/data/meta.json')
  cache.meta = await res.json()
  return cache.meta
}

export async function loadCoaches() {
  if (cache.coaches) return cache.coaches
  const res = await fetch('/data/coaches.json.gz')
  const buf = await res.arrayBuffer()
  const json = JSON.parse(pako.inflate(new Uint8Array(buf), { to: 'string' }))
  cache.coaches = json
  return cache.coaches
}

export function getDecadeFile(year) {
  if (year < 1950) return 'squads-1930-1950.json.gz'
  if (year < 1970) return 'squads-1950-1970.json.gz'
  if (year < 1990) return 'squads-1970-1990.json.gz'
  if (year < 2010) return 'squads-1990-2010.json.gz'
  return 'squads-2010-2026.json.gz'
}

export async function loadDecade(year) {
  const filename = getDecadeFile(year)
  if (cache[filename]) return cache[filename]
  const res = await fetch(`/data/${filename}`)
  const buf = await res.arrayBuffer()
  const data = JSON.parse(pako.inflate(new Uint8Array(buf), { to: 'string' }))
  cache[filename] = data
  return data
}

export async function getPlayersForCountry(country, decade) {
  // decade is the decoded squad array from loadDecade()
  // Data format: { c: countryCode, cn: countryName, y: year, p: [{n, pos, num, r, conf}] }
  return decade.filter(squad => squad.cn === country || squad.c === country)
}
```

### 2. Create src/utils/simulator.js

```javascript
export function calculateTeamRating(players) {
  if (!players.length) return 70
  const sum = players.reduce((acc, p) => acc + (p.r || 70), 0)
  return sum / players.length
}

export function simulateMatch(teamA, teamB, coachBoostA = 0) {
  const ratingA = calculateTeamRating(teamA) + coachBoostA
  const ratingB = calculateTeamRating(teamB)
  const diff = (ratingA - ratingB) * 0.05
  const rand = (Math.random() - 0.5) * 4
  const margin = Math.round(diff + rand)
  const base = Math.max(0, Math.floor(Math.random() * 3))
  const goalsA = Math.max(0, base + Math.max(0, margin))
  const goalsB = Math.max(0, base - Math.max(0, margin))
  return { goalsA, goalsB }
}

export function generateGoalScorers(players, goals) {
  // Weight forwards and midfielders more
  const attackers = players.filter(p => p.pos === 'FWD' || p.pos === 'MID')
  const pool = attackers.length > 0 ? attackers : players
  return Array.from({ length: goals }, () => {
    const scorer = pool[Math.floor(Math.random() * pool.length)]
    const minute = Math.floor(Math.random() * 90) + 1
    return { name: scorer?.n || 'Unknown', minute }
  }).sort((a, b) => a.minute - b.minute)
}

export function generateOpponents(userCountry, count = 31) {
  // Return an array of opponent stubs with random ratings
  const opponents = []
  for (let i = 0; i < count; i++) {
    opponents.push({ name: `Opponent ${i + 1}`, avgRating: 60 + Math.random() * 25 })
  }
  return opponents
}
```

### 3. Create src/utils/format.js

```javascript
export function getDecadeFile(year) {
  if (year < 1950) return 'squads-1930-1950.json.gz'
  if (year < 1970) return 'squads-1950-1970.json.gz'
  if (year < 1990) return 'squads-1970-1990.json.gz'
  if (year < 2010) return 'squads-1990-2010.json.gz'
  return 'squads-2010-2026.json.gz'
}

export function formatScore(goalsA, goalsB) {
  return `${goalsA} - ${goalsB}`
}

export function getPositionLabel(pos) {
  return { GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward' }[pos] || pos
}
```

### 4. Wire DiceRoller to real data

Update `src/components/DiceRoller.jsx` to:
- Accept a `year` prop (or pick a random available year for the country)
- Use `loadDecade(year)` + `getPlayersForCountry()` from db.js
- For each position slot, pick 3 random players at that position
- User clicks one → add to team
- Show player name + rating badge per candidate
- Keep the 3-strikes mechanic (re-roll costs a strike)

### 5. Wire CoachPicker to real data

Update `src/components/CoachPicker.jsx` to:
- Use `loadCoaches()` from db.js
- Show the 3 coaches for the selected country
- Display: name, era, moraleBoost value
- Coach data format from coaches.json: { country, coaches: [{name, era, moraleBoost}] }

### 6. Wire TournamentSim to real simulation

Update `src/components/TournamentSim.jsx` to:
- Generate 32 teams: user's team + 31 random opponents (from simulator.js)
- Draw groups (8 groups of 4)
- Simulate group stage match by match using simulateMatch()
- Progress to R16 → QF → SF → Final
- Show bracket and results after each round
- Reference 7a0.com.br for match display style

### 7. Wire App.jsx to Game.jsx

Update `src/App.jsx` so once meta.json loads, it renders `<Game />` instead of the "Start Game" placeholder button.

## After building

- Test flow: country pick → formation → dice (with real players) → coach → tournament
- Commit: "Phase 2c: Real data integration (db.js, simulator.js, DiceRoller + CoachPicker + TournamentSim wired)"
- Update PROGRESS.md to mark 2c complete

## Node version note

Node v12.22.9 is in the current environment — Vite needs 14.18+. If unable to run `npm run dev` locally:
- Build components and verify structure/imports manually
- Use `node --version` to check; if v14+ is available in path try `nvm use 18` or similar
```

---

## **What Was Just Done**

✅ **Phase 2b: Game Component Scaffolding** (Built — uncommitted)

Components built by Haiku (uncommitted, see pending changes table above):
- `Game.jsx`: Full state machine — country → formation → dice → coach → tournament → summary
- `CountryPicker.jsx`: 85 hardcoded countries with flag emojis, search filter
- `FormationPicker.jsx`: 4 formation cards
- `DiceRoller.jsx`: UI ready, auto-picks placeholder names (needs Phase 2c wiring)
- `CoachPicker.jsx`: UI ready, no real coach data yet
- `TournamentSim.jsx`: Mocked — waits 2s, returns hardcoded champion result
- `CampaignSummary.jsx`: Displays result stats + "Play Again"
- `constants.js`: FORMATIONS with position counts, POSITIONS array, TOURNAMENT_YEARS

---

✅ **Phase 2a: React + Vite Setup** (Complete — committed 5d7b64e, 85cb882)

- `index.html`: Root Vite entry, Tailwind CDN, dark retro theme, scanline effect
- `src/main.jsx`: React 18 entry point
- `src/App.jsx`: Loads meta.json, shows retro loading screen → placeholder "Start Game" button
- Color palette: soft neons (#d97fb6 pink, #5eb3c6 cyan, #e8c547 gold)

---

✅ **Phase 1 (Data Pipeline): 100% complete**

- 10,437 players, 457 squads, 19/23 tournaments, 85 countries
- 258 historical coaches (3 per country)
- public/data/: 5 decade .json.gz + coaches.json.gz + meta.json (138 KB total)

---

## **Current State of the Codebase**

```
timeless-xi/
├── CLAUDE.md ✅
├── README.md ✅ (modified, uncommitted)
├── index.html ✅                  (Vite root entry — committed 5d7b64e)
├── package.json (modified)        (vite ^3.2.11 — uncommitted)
├── vite.config.js ✅
├── .gitignore ✅
├── scripts/ ✅ Phase 1 complete
│   ├── fetch-squads.mjs
│   ├── enrich-ratings.mjs
│   ├── apply-age-penalty.mjs
│   ├── build-json.mjs
│   ├── compress.mjs
│   └── generate-coaches.mjs
├── src/
│   ├── main.jsx ✅                (committed)
│   ├── App.jsx (modified)         (loading shell — not wired to Game.jsx yet)
│   ├── constants.js ⚠️            (UNTRACKED — uncommitted)
│   ├── components/ ⚠️             (ALL UNTRACKED — uncommitted)
│   │   ├── Game.jsx
│   │   ├── CountryPicker.jsx
│   │   ├── FormationPicker.jsx
│   │   ├── DiceRoller.jsx         (placeholder data)
│   │   ├── CoachPicker.jsx        (placeholder data)
│   │   ├── TournamentSim.jsx      (mocked simulation)
│   │   └── CampaignSummary.jsx
│   ├── utils/ (empty)             ← Phase 2c builds here
│   └── styles/ (empty)            ← Phase 2d builds here
├── public/
│   ├── index.html ⚠️              (DELETED from disk — uncommitted deletion)
│   └── data/ ✅
│       ├── squads-1930-1950.json.gz (109 B — no data for pre-1954 from API)
│       ├── squads-1950-1970.json.gz (21 KB)
│       ├── squads-1970-1990.json.gz (29 KB)
│       ├── squads-1990-2010.json.gz (44 KB)
│       ├── squads-2010-2026.json.gz (38 KB)
│       ├── coaches.json.gz (4.8 KB)
│       └── meta.json ✅
├── data/ (source, not served)
│   ├── raw-squads.json
│   ├── enriched-squads.json
│   ├── coaches.json
│   ├── fetch-gaps.json
│   └── enrichment-gaps.json
└── docs/
    ├── HANDOFF.md ✅ (this file)
    ├── PROGRESS.md ✅
    ├── TIMELESS_XI_PROJECT_BRIEF.md ✅
    ├── TIMELESS_ELEVEN_ROADMAP.md ✅
    └── ARCHITECTURE.md ✅
```

---

## **Outstanding Decisions**

| Decision | Notes |
|----------|-------|
| Node upgrade | Needed for `npm run dev`. Environment has v12.22.9; need 14.18+. |
| Color palette tension | CLAUDE.md calls for harsh neons; current UI uses softer variants. Confirm preference before Phase 2d. |
| CountryPicker data source | Currently hardcoded 85 countries. Should load from meta.json for accuracy. |
| DiceRoller year selection | Needs design decision: random year from country history, or user picks year? |
| TournamentSim complexity | Current spec says 32 teams; 19 teams have data. Confirm whether to pad with AI-only opponents. |

---

## **Session History**

| Date | Phase | Completed | Commit |
|------|-------|-----------|--------|
| 2026-06-07 | 0 | Environment setup | 4242666 |
| 2026-06-07 | 1a | Zafronix fetcher + full fetch | 975d8bf |
| 2026-06-07 | 1b | Claude API enrichment + age penalties | 15169ed |
| 2026-06-07 | 1c | JSON optimizer + compressor | 04eb28e |
| 2026-06-07 | 1d | Coach data generation (258 coaches) | 0eac773 |
| 2026-06-07 | 2a | React + Vite setup, retro UI shell | 85cb882 |
| 2026-06-07 | 2a | Color palette refinement | 5d7b64e |
| 2026-06-07 | 2b | Game components scaffolded | ⚠️ UNCOMMITTED |

---

**Last updated**: 2026-06-07 (Sonnet sweep — rewrote from scratch, corrected hallucinated Node v24 claim, documented uncommitted Phase 2b components, removed stale Phase 1b task section)

Phase 1 (data): ✅ 100% complete
Phase 2a (React shell): ✅ Complete
Phase 2b (component scaffolding): ✅ Built but uncommitted
Phase 2c (real data integration): 🔲 Ready to build
