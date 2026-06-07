# Timeless XI: Agentic Development Manifest

## Project Vision

**Build an interactive World Cup simulation game where players assemble dream teams from historical squads and compete in a tournament.**

Reference: https://7a0.com.br/en/play — game-by-game simulation with match details, goal scorers, and tournament progression.

---

## Core Features (MVP → Full Game)

### MVP (Phase 1-2)
1. **Country selection** with flag and search
2. **Formation picker** (4-4-2, 4-3-3, 3-5-2, 5-3-2)
3. **Dice roller** + position-by-position player selection (with 3 strikes)
4. **Coach selection** (morale boost)
5. **Tournament simulation** (groups → knockout stages)
6. **Match-by-match playback** (goals, scorers, final stats)

### Phase 3-4 Extensions
- Shareable PNG summary
- Campaign statistics (best player, toughest opponent, etc.)
- Replay/history tracking

---

## Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS via CDN
- **Aesthetic**: **Retro 80s** (neon, gradients, pixelated fonts, bold colors)
  - Inspiration: synthwave, arcade games, 1980s sports broadcasting
  - Color palette: neon pink, cyan, yellow, dark backgrounds
  - Typography: all-caps headings, monospace accents
- **Animations**: CSS + framer-motion (optional)
- **UI Reference**: 7a0.com.br for match/tournament display

### Data Pipeline
- **Source**: Zafronix API (`https://api.zafronix.com/fifa/worldcup/v1/tournaments/{year}`)
- **Enrichment**: Claude API (batch) for player ratings (1-10 scale)
- **Format**: JSON (split by decade) + gzip compression
- **Size target**: <2MB gzipped
- **Serving**: GitHub Pages (static)

### Game Logic
- **Match simulation**: `user_avg_rating - opponent_avg_rating * 0.5 + random(-2, +2)`
- **Tournament**: 32 teams, 4 groups, group → R16 → QF → SF → Final
- **Coach boost**: +2-5% morale

---

## File Structure

```
timeless-xi/
├── scripts/
│   ├── fetch-squads.mjs            # Zafronix fetcher + validation
│   ├── enrich-ratings.mjs          # Claude API batch enrichment
│   ├── build-json.mjs              # Organize & optimize JSON
│   └── compress.mjs                # gzip compression
├── public/
│   ├── data/
│   │   ├── squads-1930-1950.json.gz
│   │   ├── squads-1950-1970.json.gz
│   │   ├── squads-1970-1990.json.gz
│   │   ├── squads-1990-2010.json.gz
│   │   ├── squads-2010-2026.json.gz
│   │   └── meta.json
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── main.jsx                    # React entry
│   ├── components/
│   │   ├── Game.jsx                # Main game flow
│   │   ├── CountryPicker.jsx       # Country + flag selection
│   │   ├── FormationPicker.jsx     # 4 formation cards
│   │   ├── DiceRoller.jsx          # Position-by-position selector
│   │   ├── CoachPicker.jsx         # Coach selection + morale
│   │   ├── TournamentSim.jsx       # Bracket + match playback
│   │   ├── MatchDetail.jsx         # Goals, scorers, stats
│   │   └── CampaignSummary.jsx     # Final stats & PNG export
│   ├── utils/
│   │   ├── db.js                   # Data loader + decompression
│   │   ├── simulator.js            # Match/tournament logic
│   │   └── format.js               # Formatting helpers
│   ├── styles/
│   │   ├── index.css               # Retro 80s design
│   │   └── animations.css          # Dice roll, confetti, etc.
│   └── constants.js                # Formations, positions, etc.
├── docs/
│   ├── TIMELESS_XI_PROJECT_BRIEF.md      # Product spec
│   ├── TIMELESS_ELEVEN_ROADMAP.md        # Development phases
│   ├── PROGRESS.md                       # Phase completion tracking
│   └── ARCHITECTURE.md                   # Technical deep dive
├── .github/workflows/
│   ├── deploy.yml                  # GitHub Pages auto-deploy
│   └── update-data.yml             # Monthly data refresh
├── package.json
├── vite.config.js
├── CLAUDE.md                       # THIS FILE
└── README.md

```

---

## AI Workflow & Skills

### Strategy: Progressive, Incremental Building
1. **Phase 0**: Initialize + create CLAUDE.md + first git commit
2. **Phase 1**: Data pipeline (fetch → enrich → compress)
   - Test Zafronix API, validate data, flag gaps
   - Run Claude enrichment (batch API)
   - Verify compression & file sizes
3. **Phase 2**: React UI (components + game logic)
   - Build each component independently
   - Test data loading + caching
4. **Phase 3**: Integration + deployment
   - GitHub Pages setup
   - End-to-end testing
5. **Phase 4**: Polish (PNG export, extra features)

### Skills to Create (as needed)
- `/pipeline`: Run full data pipeline (fetch → enrich → compress)
- `/test-game`: Start dev server, verify game flow end-to-end
- `/deploy`: Build + push to GitHub Pages
- `/data-check`: Validate data quality, flag gaps

### Hooks to Configure (optional)
- Before git commit: validate data files exist
- After Phase 1: run lighthouse audit
- On error: create issue in docs

---

## Claude API Usage

### Batch Enrichment (Phase 1)
```
For each player:
  Prompt: "Rate this footballer 1-10 historically (era, position, country, year).
           Respond ONLY with a number 1-10."
  Input: {name, position, country, year}
  Output: {rating: 1-10, confidence: 0-1}
```

**Cost estimate**: 2,500+ players × batch processing = ~$20-40 USD

**Caching strategy**: After first enrichment, store ratings + don't re-fetch same player.

---

## Data Quality Expectations

### Zafronix API
- **Coverage**: 23 World Cups (1930-2026)
- **Expected gaps**: Some players missing from early tournaments (pre-1950)
- **Validation**: All players must have {name, number, position, year, country}
- **Gaps report**: Create `data/fetch-gaps.json` documenting missing squads/players

### Enriched Ratings
- **Target**: 95%+ of players have ratings
- **Fallback**: Auto-rate based on era (early WCs = lower ratings, recent = higher)
- **Issues**: Flag uncertain ratings in `data/enrichment-gaps.json`

---

## Aesthetic: Retro 80s

### Visual Design
- **Background**: Dark navy or black with subtle grid/scanline overlay
- **Primary colors**: Neon pink (#FF10F0), cyan (#00F0FF), bright yellow (#FFFF00)
- **Fonts**: 
  - Headings: All-caps, bold sans-serif (or "Press Start 2P" for pixel feel)
  - Body: Clean sans-serif with slight letter-spacing
- **Buttons**: Thick borders, glowing text-shadow, hover effects
- **Cards**: Neon outline, drop-shadow glow
- **Animations**: Pulse, flicker, slide-in effects (retro CRT feel)

### Reference Aesthetics
- 80s arcade cabinets (Pac-Man, Space Invaders)
- 80s synthwave album covers
- VHS tape aesthetic (slight color distortion)

---

## Success Criteria

### Phase 1 (Data)
- [ ] Fetch all 23 World Cup squads from Zafronix
- [ ] Validate 95%+ data completeness
- [ ] Enrich ratings via Claude API (batch)
- [ ] Compress to <2MB gzipped
- [ ] Create meta.json with country/tournament registry

### Phase 2 (UI)
- [ ] React loads in <2 seconds
- [ ] Country picker works
- [ ] Formation selection displays correctly
- [ ] Dice roller + position selector functional
- [ ] Coach picker loads
- [ ] Tournament bracket displays all rounds

### Phase 3 (Game Logic)
- [ ] Match simulation produces realistic scores
- [ ] Tournament progression (groups → knockouts) works
- [ ] Goal scorers assigned realistically
- [ ] Campaign summary shows correct stats

### Phase 4 (Polish)
- [ ] Retro 80s aesthetic applied consistently
- [ ] Mobile responsive (48px+ touch targets)
- [ ] PNG export works + looks shareable
- [ ] Lighthouse score 90+
- [ ] GitHub Pages deployed
- [ ] Custom domain (optional)

---

## Documents to Update as We Build

- **PROGRESS.md**: Track phase completion, blockers, decisions
- **ARCHITECTURE.md**: Technical decisions, component interactions
- **README.md**: Setup + usage guide for players

---

## Notes for Future Agents

1. **Test data before scaling**: Validate Zafronix response structure first (curl 1 year)
2. **Cost tracking**: Keep tabs on Claude API usage (batch = 50% cheaper than regular)
3. **Commit frequently**: Each phase gets a commit; each major fix gets a commit
4. **Ask before risky changes**: Force-push, deleting files, API key exposure
5. **Reference the roadmap**: When stuck, re-read TIMELESS_ELEVEN_ROADMAP.md
6. **Player feedback loop**: Share builds early, iterate on 7a0-style UI

---

## Quick Commands

```bash
# Dev
npm install
npm run dev              # Start local Vite server

# Data pipeline
npm run fetch            # Fetch squads from Zafronix
npm run enrich           # Enrich with Claude ratings
npm run build:data       # Compress JSON files
npm run pipeline         # All three (shortcut)

# Build & deploy
npm run build            # Vite build to dist/
npm run preview          # Preview production build locally

# Git
git status               # Check changes
git add .                # Stage all
git commit -m "..."      # Commit
git log --oneline        # View history
```

---

## Contacts & Resources

- **Zafronix API**: https://api.zafronix.com (free tier, no auth needed)
- **Claude API**: https://console.anthropic.com (batch API for cost savings)
- **7a0 Inspiration**: https://7a0.com.br/en/play
- **Tailwind CDN**: https://cdn.tailwindcss.com
- **GitHub Pages**: https://docs.github.com/en/pages

---

## Ready to Build!

Phase 0 is done. Phase 1 (data pipeline) starts next. Let Claude Code build incrementally, testing each step.

Built with Claude Code + agentic development 🚀
