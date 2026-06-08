# Timeless XI

**Build your dream World Cup team from any era and simulate a tournament.**

A browser-based game where you:
1. Pick your country
2. Choose a formation (4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-4)
3. Roll the dice to get random players (with 3 strikes to re-roll)
4. Pick a coach
5. Simulate a full tournament (groups → knockouts → final)
6. See game-by-game results with goal scorers
7. Share your campaign as a retro-styled image

**[Play now](https://timelessxi.com)** (Coming soon)

---

## Features

- 📊 **23 World Cup squads** (1930-2026)
- ⚽ **Realistic match simulation** based on player ratings
- 🏆 **Full tournament progression** (32 teams, groups, knockouts)
- 🎨 **Retro 80s aesthetic** (neon, gradients, synthwave vibes)
- 📸 **Shareable campaign images** (PNG download)
- 📱 **Mobile responsive**

---

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
# Clone repo
git clone https://github.com/pablosanchezprieto/timeless-xi.git
cd timeless-xi

# Install dependencies
npm install

# Start dev server
npm run dev
```

The game will open at `http://localhost:5173`

---

## Data Pipeline

The game relies on World Cup squad data enriched with player ratings:

```bash
# 1. Fetch squads from Zafronix API
npm run fetch

# 2. Enrich with historical ratings (via Claude API)
npm run enrich

# 3. Compress and optimize for static hosting
npm run build:data

# Or run all three at once:
npm run pipeline
```

---

## Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
git push origin main  # Workflow auto-deploys
```

---

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details.

Key files:
- `scripts/fetch-squads.mjs` — Zafronix API fetcher
- `scripts/enrich-ratings.mjs` — Claude API enrichment
- `src/components/Game.jsx` — Main game flow
- `src/utils/simulator.js` — Match/tournament logic
- `src/styles/` — Retro 80s design

---

## Status

🔄 **In Development**

- [x] Phase 0: Environment setup
- [x] Phase 1: Data pipeline (fetch → enrich → compress)
  - [x] 1a: Zafronix validation & fetching
  - [x] 1b: Claude API enrichment with age penalties
  - [x] 1c: JSON optimization & gzip compression
- [🔄] Phase 2: React UI + game logic (in progress)
  - [🔄] 2a: React setup & component scaffolding
- [ ] Phase 3: Integration & deployment
- [ ] Phase 4: Polish & extras

### Development Workflow

Each session is tracked via **[docs/HANDOFF.md](docs/HANDOFF.md)**:
- ✅ What was completed
- 🔄 What's in progress
- 📋 Copy-paste prompt to resume next session

See [docs/PROGRESS.md](docs/PROGRESS.md) for detailed phase progress.

---

## Inspiration

Built with love, inspired by [7a0.com.br](https://7a0.com.br/en/play) (game-by-game simulation) and classic 80s aesthetics.

---

## License

MIT

---

## Questions?

Open an issue on GitHub or [chat with Claude Code](https://claude.ai/code).

Built with Claude Code + agentic development 🚀
