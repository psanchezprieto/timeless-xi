# Timeless XI: Architecture & Technical Design

---

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   PLAYER BROWSER                        │
│              (React + Vite + Tailwind)                  │
│                                                          │
│  Game.jsx → CountryPicker → FormationPicker →          │
│  DiceRoller → CoachPicker → TournamentSim →            │
│  MatchDetail → CampaignSummary                          │
└────────────┬────────────────────────────────────────────┘
             │
             ↓ (fetch + pako.inflate)
         ┌───────────────────────────┐
         │   GitHub Pages Static      │
         │   public/data/*.json.gz    │
         │   (squads, coaches, meta)  │
         └───────────────────────────┘
             ↑ (generated once, hosted forever)
             │
    ┌────────┴────────────┐
    │   Build Scripts     │
    │  (runs locally)     │
    └────────┬────────────┘
             │
    ┌────────┴─────────────────────┐
    │   Data Pipeline (Phase 1)     │
    │                               │
    │ 1. fetch-squads.mjs           │
    │    ↓ Zafronix API             │
    │ 2. enrich-ratings.mjs         │
    │    ↓ Claude Batch API         │
    │ 3. build-json.mjs             │
    │ 4. compress.mjs               │
    │    ↓ gzip                     │
    │ public/data/squads-*.json.gz  │
    └───────────────────────────────┘
```

**Key insight**: All data is generated once locally (or on CI), then hosted statically. No backend server needed.

---

## Data Schema

### meta.json
```json
{
  "countries": [
    {
      "id": "ESP",
      "name": "Spain",
      "flag": "🇪🇸",
      "availableYears": [1950, 1962, 1978, 1986, 1990, 1998, 2002, 2010, 2014, 2018, 2022, 2026]
    }
  ],
  "tournaments": [
    { "year": 1930, "host": "Uruguay" },
    { "year": 1934, "host": "Italy" },
    // ... 23 total
  ],
  "dataVersion": "2026-06-07",
  "totalPlayers": 2847,
  "totalCoaches": 256
}
```

### squads-YYYY-YYYY.json.gz (compressed)
```json
{
  "squads": [
    {
      "c": "ESP",              // country code
      "y": 2010,               // year
      "p": [                   // players
        {
          "n": "Iker Casillas",
          "num": 1,
          "pos": "GK",
          "r": 8.5,            // rating (1-10)
          "id": "unique_hash"
        },
        // ... more players
      ],
      "coaches": [
        {
          "n": "Luis Aragonés",
          "r": 1950,           // born year (for era context)
          "m": 5               // morale boost %
        }
      ]
    }
  ]
}
```

**Optimization notes**:
- Short keys ("c", "y", "p", "r") reduce JSON size by ~30%
- Removed: caps, goals, assists, club (not needed for game)
- Gzipped: ~15-20 KB per decade file

---

## Component Architecture

### Game Flow
```
Game.jsx (root state)
├── Screen 1: CountryPicker
│   └── onSelect → setState(country) → next screen
│
├── Screen 2: FormationPicker
│   └── onSelect → setState(formation) → next screen
│
├── Screen 3: DiceRoller
│   ├── Position loop (GK → DEF → MID → FWD)
│   ├── Roll button → fetch players → show top 8
│   ├── Select or Skip (cost 1 strike)
│   └── onComplete → next screen
│
├── Screen 4: CoachPicker
│   └── onSelect → setState(coach) → next screen
│
├── Screen 5: TournamentSim
│   ├── Run simulation (groups → knockouts)
│   ├── Display bracket + match details
│   ├── MatchDetail for each game (goals, scorers, stats)
│   └── onComplete → next screen
│
└── Screen 6: CampaignSummary
    ├── Final stats (W-D-L, goals, best player)
    ├── PNG export button
    └── Play Again → reset to CountryPicker
```

### State Management
```javascript
// Game.jsx top-level state
const [gameState, setGameState] = useState({
  screen: 'countryPicker',      // Current screen
  selectedCountry: null,        // ESP, BRA, etc.
  selectedFormation: null,      // 4-4-2, 4-3-3, etc.
  selectedPlayers: [],          // Array of 11 players (pos-by-pos)
  selectedCoach: null,
  strikeCount: 3,               // Re-rolls remaining
  
  // Simulation results
  tournament: null,             // Bracket + all matches
  campaignStats: null           // W-D-L, goals, etc.
});
```

---

## Game Logic

### Match Simulation
```javascript
function simulateMatch(userTeam, opponentTeam) {
  const userAvg = average(userTeam.players.map(p => p.rating));
  const oppAvg = average(opponentTeam.players.map(p => p.rating));
  
  // Base differential + randomness
  const goalDiff = 
    (userAvg - oppAvg) * 0.5 +    // Rating advantage (50% weight)
    (Math.random() - 0.5) * 4;     // Random variance (-2 to +2)
  
  // Add coach morale boost
  const boostedDiff = goalDiff + (userTeam.coach.moraleBoost * 0.01);
  
  // Generate score
  const baseGoals = Math.max(0, Math.round(goalDiff));
  const userScore = baseGoals + Math.random() > 0.5 ? 1 : 0;
  const oppScore = Math.max(0, userScore - Math.round(boostedDiff));
  
  return { userScore, oppScore };
}
```

**Factors**:
- Team average rating (primary driver)
- Coach morale boost (secondary, +2-5%)
- Random variance (enables upsets, keeps game interesting)

### Tournament Structure
```
32 teams → 8 groups of 4
  ↓ (3 matches each)
Group winners + runners-up (16 teams)
  ↓ (Random draw for R16)
Round of 16 (8 matches → 8 winners)
  ↓
Quarterfinals (4 matches → 4 winners)
  ↓
Semifinals (2 matches → 2 winners)
  ↓
Final (1 match → 1 champion)
```

**Match outcomes**:
- Win = 3 pts
- Draw = 1 pt
- Loss = 0 pts

**Opponent generation**:
Each opponent is a random squad from Zafronix data (different era, different country).

---

## Data Loading & Caching

### Initial Load (src/utils/db.js)
```javascript
// On app startup
async function loadMeta() {
  const response = await fetch('/data/meta.json');
  window.TIMELESS_DATA = { meta: await response.json() };
  // Cached in memory + localStorage
}

// On year selection
async function loadSquad(year, country) {
  const decade = Math.floor(year / 10) * 10;
  const file = `/data/squads-${decade}-${decade + 10}.json.gz`;
  
  const gz = await fetch(file).then(r => r.arrayBuffer());
  const json = pako.inflate(gz, { to: 'string' });
  const squads = JSON.parse(json);
  
  // Cache in memory
  window.TIMELESS_DATA.squads[file] = squads;
  return squads.find(s => s.c === country && s.y === year);
}
```

**Performance**:
- meta.json: ~10 KB (loaded once)
- squad file: ~50-100 KB (lazy loaded per decade)
- Decompression: <100ms in browser

---

## Styling: Retro 80s

### CSS Variables
```css
:root {
  --color-neon-pink: #FF10F0;
  --color-cyan: #00F0FF;
  --color-yellow: #FFFF00;
  --color-dark-bg: #0a0a0a;
  --color-navy: #1a1a2e;
  
  --glow: 0 0 10px var(--color-neon-pink);
  --font-accent: 'Press Start 2P', monospace;
  --font-body: 'Inter', sans-serif;
}
```

### Key Components
- **Buttons**: Thick border, text glow, on-hover pulse
- **Cards**: Neon outline, drop-shadow (color: pink/cyan)
- **Background**: Dark with subtle scanline overlay (CSS pattern)
- **Animations**: Dice spin, flicker, slide-in (see animations.css)

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First load | <2s | TBD |
| Squad load | <500ms | TBD |
| Match sim | <100ms | TBD |
| PNG export | <3s | TBD |
| Lighthouse | 90+ | TBD |
| Mobile Responsive | Yes | TBD |

---

## Dependencies & Why

| Lib | Purpose | Notes |
|-----|---------|-------|
| React 18 | UI framework | Standard, hooks-based |
| Vite | Build tool | Fast HMR, minimal config |
| Tailwind CDN | CSS utility | No build step needed |
| Axios | HTTP client | Simpler than fetch for Node scripts |
| Pako | gzip in browser | Decompress squad files |
| html2canvas | PNG export | Generate shareable images |
| Framer Motion | Animations | Optional (can use CSS-only) |

---

## GitHub Pages Deployment

### Static Hosting
```
GitHub repo
├── /public (served as root)
│   ├── index.html
│   ├── data/
│   │   ├── squads-*.json.gz
│   │   └── meta.json
│   └── assets/ (Vite output)
└── /docs (alternative source, if using)
```

### Workflow
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Development Workflow

### Local Dev
```bash
npm install              # One-time setup
npm run dev              # Watch + HMR on :5173
```

### Data Updates
```bash
npm run fetch            # Fetch from Zafronix
npm run enrich           # Enrich ratings (expensive, once per month)
npm run build:data       # Compress + output to public/data/
git add public/data/
git commit -m "Update squad data"
git push                 # GitHub Actions auto-deploys
```

### Deployment
```bash
npm run build            # Vite build to dist/
git push                 # GitHub Actions runs deploy.yml
# 30 seconds later, live at GitHub Pages URL
```

---

## Future Extensibility

### Easy to Add
- New tournaments (Euros, Copa América, Olympics) — just new JSON files
- Player stats (goals, assists, caps) — add to schema
- Lineup saving (localStorage) — new React context
- Leaderboard (serverless function) — call API on finish
- Dark mode — CSS custom property toggle

### Harder to Add (Requires Rethink)
- Multiplayer (needs backend)
- Real match APIs (adds complexity)
- Player transfers (data becomes stale fast)

---

**Last updated**: 2026-06-07
