# Timeless XI: Development Progress

Track completion of each phase, blockers, and key decisions.

---

## Phase 0: Environment Setup ✅

- [x] Git initialized
- [x] package.json created
- [x] Directory structure scaffolded
- [x] CLAUDE.md (system prompt) written
- [x] .gitignore configured
- [x] vite.config.js created

**Completed**: 2026-06-07

---

## Phase 1: Data Pipeline ✅

### Subphase 1a: Zafronix Fetcher
- [x] Create scripts/fetch-squads.mjs
- [x] Validate data structure & error handling
- [x] Handle rate limits + retries
- [x] Output data/raw-squads.json
- [x] Create data/fetch-gaps.json report
- [x] Test mode (--test flag for 2 years)
- [x] Create test-api.mjs validation script
- [x] Add dotenv support for API key authentication
- [x] Fix player validation (jersey vs number field)
- [x] Fetch all 23 World Cup tournaments

**Status**: ✅ Complete (2026-06-07)
**Results**: 457 squads, 10,437 players, 19/23 years with data

### Subphase 1b: Claude API Enrichment
- [x] Create scripts/enrich-ratings.mjs
- [x] Implement batch API calls (Sonnet 4.6)
- [x] Apply age-based penalties (35+, 38+)
- [x] Output data/enriched-squads.json (10,437 players)
- [x] Create data/enrichment-gaps.json report
- [x] Add apply-age-penalty.mjs script

**Status**: ✅ Complete (2026-06-07)
**Results**: 10,437 players rated 0-100 (FIFA-style), 95% confidence, age penalties applied

### Subphase 1c: Compress & Organize
- [x] Create scripts/build-json.mjs
- [x] Split data by decade (5 files)
- [x] Optimize JSON (short keys: c, y, p, r, conf)
- [x] Create scripts/compress.mjs
- [x] Generate public/data/meta.json
- [x] gzip compression: 80% ratio

**Status**: ✅ Complete (2026-06-07)
**Results**: 5 .json.gz files, 152KB total (<2MB target), meta.json with registry

### Subphase 1d: Coach Data Generation
- [x] Create scripts/generate-coaches.mjs
- [x] Call Claude API to generate historical coaches per country
- [x] Output data/coaches.json
- [x] Validate coach structure (name, era, moraleBoost)
- [x] Compress to coaches.json.gz (4.8 KB) in public/data/
- [x] Integrate into `npm run pipeline`

**Status**: ✅ Complete (2026-06-07)
**Results**: 258 historical coaches (3 per country), coaches.json.gz in public/data/, metadata in meta.json

---

## Phase 2: React UI 🔲

### Subphase 2a: Vite + React Setup
- [x] Create src/main.jsx (React 18 entry point)
- [x] Create index.html (HTML entry point for Vite)
- [x] Create src/App.jsx (data loading + loading states)
- [x] Verify file structure and code correctness
- [x] Refine UI with softer color palette and cleaner aesthetics

**Status**: ✅ Complete (2026-06-07)
**Files created**:
  - index.html: Root HTML template with Tailwind CDN, refined dark theme
  - src/main.jsx: React 18 entry point with ReactDOM.createRoot()
  - src/App.jsx: Main component with meta.json loader, loading spinner, error handling
  
**Design**: Softer color palette (#d97fb6, #5eb3c6, #e8c547), subtle shadows, modern Inter font, clean UI

### Subphase 2b: Game Components + Utils ✅
- [x] Game.jsx (main flow orchestrator)
- [x] CountryPicker.jsx (team selection with flags + search)
- [x] FormationPicker.jsx (4 formation cards)
- [x] DiceRoller.jsx (position-by-position picker with rerolls — real data)
- [x] CoachPicker.jsx (coach selection with morale boost — real data)
- [x] TournamentSim.jsx (full 32-team bracket: groups → R16 → QF → SF → Final)
- [x] CampaignSummary.jsx (final stats: MVP, goals, match history)
- [x] src/utils/db.js (pako decompression, squad + coach data loader)
- [x] src/utils/simulator.js (match simulation, knockout, group stage)
- [x] src/styles/theme.js (shared C constants + style helpers)

**Status**: ✅ Complete (2026-06-07)
**Key decisions**:
  - Ratings: 0-100 scale (raw 1-10 × 10 from enrichment)
  - AI teams tiered by WC history (Tier 1=70-85, Tier 2=60-75, Tier 3=50-65)
  - Match formula: Poisson distribution on expected goals (diff/10 * 0.25 ± variance)
  - User always plays as "home" in knockout matches (for scorer attribution)
  - MVP computed from goal scorers across all matches

### Subphase 2c: Retro 80s Styling
- [ ] src/styles/index.css (scanlines, neon glows, animations)
- [ ] src/styles/animations.css (dice roll, confetti, card flips)
- [ ] Mobile responsive polish (48px+ touch targets)

**Status**: Pending

### Subphase 2d: Retro 80s Styling
- [ ] src/styles/index.css (Tailwind + custom)
- [ ] src/styles/animations.css (dice, confetti, glow)
- [ ] Apply neon color palette
- [ ] Test on mobile

**Status**: Pending

---

## Phase 3: Integration & Deployment 🔲

- [ ] GitHub Pages config
- [ ] GitHub Actions deploy workflow
- [ ] DNS setup (custom domain optional)
- [ ] End-to-end testing

**Status**: Pending

---

## Phase 4: Polish & Extras 🔲

- [ ] PNG export (html2canvas)
- [ ] Campaign statistics
- [ ] Social sharing
- [ ] Performance optimization (Lighthouse 90+)
- [ ] Documentation (README, ARCHITECTURE)

**Status**: Pending

---

## Key Decisions

| Decision | Status | Notes |
|----------|--------|-------|
| Data source: Zafronix API | ✅ Approved | Free tier, 23 World Cups |
| Enrichment: Claude batch API | ✅ Approved | ~$20-40 cost, 50% cheaper than standard |
| Aesthetic: Retro 80s | ✅ Approved | Neon, gradients, pixelated vibe |
| UI reference: 7a0.com.br | ✅ Approved | Game-by-game match display |
| Scope: MVP → Full game | ✅ Approved | Start with core, expand incrementally |

---

## Blockers & Issues

| Issue | Impact | Status |
|-------|--------|--------|
| Node v12.22.9 in dev environment | `npm run dev` fails — Vite 3+ requires Node 14.18+ | 🔴 Active — upgrade Node before testing locally |
| Phase 2b components uncommitted | 7 components + constants.js in `src/` not yet in git | 🔴 Active — need to commit before next session |
| `public/index.html` deleted (moved to root `index.html`) | Correct for Vite; uncommitted deletion | 🟡 Stage and commit `git rm public/index.html` |

---

## Next Steps

1. **Commit pending work** — 7 components + constants.js in `src/` are built but uncommitted (see HANDOFF.md)
2. **Upgrade Node** to 18+ (prerequisite for running `npm run dev` — current env has v12.22.9)
3. **Phase 2c**: Wire real data — utils/db.js, utils/simulator.js; update DiceRoller + CoachPicker + TournamentSim
4. **Phase 2d**: Apply retro 80s styling (src/styles/index.css, animations.css)
5. **Phase 3**: Deploy to GitHub Pages

---

## Artifacts Generated

| File | Purpose |
|------|---------|
| `CLAUDE.md` | System prompt for agents |
| `package.json` | Dependencies + npm scripts |
| `vite.config.js` | Vite build config |
| `.gitignore` | Git ignore rules |
| `index.html` | Vite HTML entry (root-level) |
| `src/main.jsx` | React 18 entry point |
| `src/App.jsx` | App shell with meta.json loading |
| `scripts/fetch-squads.mjs` | Zafronix API fetcher |
| `scripts/enrich-ratings.mjs` | Claude batch enrichment |
| `scripts/apply-age-penalty.mjs` | Age-based rating adjustment |
| `scripts/build-json.mjs` | JSON optimizer/decade splitter |
| `scripts/compress.mjs` | gzip compressor |
| `scripts/generate-coaches.mjs` | Coach data generator |
| `public/data/` | 5 squad .json.gz files + coaches.json.gz + meta.json |

---

**Last updated**: 2026-06-07 (Sonnet sweep)

---

## 📋 Session Handoff

After each development session, check [docs/HANDOFF.md](HANDOFF.md) for:
- What was completed ✅
- What's currently in progress 🔄
- Copy-paste prompt to resume in next chat

See HANDOFF.md for full details and workflow.
