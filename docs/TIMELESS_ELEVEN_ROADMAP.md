# Timeless Eleven: Complete Development Roadmap

A step-by-step guide to building the Timeless Eleven game in VS Code using Claude Code for agentic development.

---

## Current Status (June 2026)

| Phase | Status | Notes |
|-------|--------|-------|
| **Phase 0** — Environment setup | ✅ Done | Node, Vite, React, Tailwind |
| **Phase 1** — Data pipeline | ✅ Done | 10,437 players · 85 countries · 457 squads · 258 coaches · 138 KB compressed |
| **Phase 2** — React UI + game logic | ✅ Done | All 8 components built + integrated with real data |
| **Phase 3** — GitHub Actions deploy | ✅ Done | Auto-deploys on push to main |
| **Phase 4** — Performance & integration | ✅ Done | Parallel data loading, background preload, no errors |
| **Phase 5** — Launch | 🔄 In progress | See checklist below |

---

## Phase 5: Launch Checklist

### You need to do (external steps)

- [ ] **Create Ko-fi account** at ko-fi.com → note your username → share with Claude to add the button
- [ ] **Buy domain** — `timeless-xi.com` (check availability on Namecheap ~$10/yr)
- [ ] **Enable GitHub Pages** in repo settings:
  - Go to https://github.com/psanchezprieto/timeless-xi/settings/pages
  - Source: **GitHub Actions** (not branch)
- [ ] **Configure DNS** once GitHub Pages is enabled and domain is bought:
  ```
  A     @    185.199.108.153
  A     @    185.199.109.153
  A     @    185.199.110.153
  A     @    185.199.111.153
  CNAME www  psanchezprieto.github.io
  ```
  - Then add custom domain in GitHub Pages settings

### Claude can do (code changes)

- [x] SEO meta tags in index.html (Open Graph, Twitter card)
- [x] robots.txt + sitemap.xml
- [x] CNAME file for custom domain (update if domain name differs)
- [ ] Ko-fi floating button — waiting on your Ko-fi username
- [ ] Social share button ("Share my XI on Twitter")
- [ ] og:image — create a simple 1200×630 preview image
- [ ] End-to-end test full game flow

---

## Phase 6: Stats Page (post-launch)

**Goal**: A public `/stats` route showing community-wide leaderboards from real player data.

### Desired stats
- Top scores (tournament placement + full squad snapshot)
- Most picked players per position overall
- Most picked players per nation
- Most popular countries

### Architecture

```
GitHub Actions (daily cron)
  └─ query PostHog Events API (personal API key — GitHub Secret)
  └─ compute aggregates
  └─ write public/data/stats.json → commit → push
     ↓
React StatsPage component
  └─ fetch('/data/stats.json')
  └─ renders leaderboards
```

### Implementation plan
1. **GH Actions job** (`update-stats.yml`): runs daily at 06:00 UTC
   - Calls PostHog `/api/event` or `/api/query` with personal API key (GitHub Secret `POSTHOG_PERSONAL_KEY`)
   - Aggregates `player_picked` events → top players per position + per country
   - Aggregates `campaign_completed` events → top scores (placement + squad snapshot)
   - Writes `public/data/stats.json` and commits directly to main
2. **React StatsPage** (`src/components/StatsPage.jsx`):
   - Route: click "Stats" link in Header
   - Sections: Top Scores · Most Picked by Position · Most Picked by Country
   - Falls back gracefully if stats.json is empty/stale
3. **Header**: add "Stats" nav link
4. **Cookie note**: only counts events from users who accepted analytics

### Dependencies
- PostHog personal API key → GitHub Secret (never in frontend)
- `public/data/stats.json` seeded with empty structure before first run

### Estimated effort: 1–2 sessions

---

## **Phase 0: Environment Setup (30 mins)**

### **Step 1: Install Prerequisites**

**Node.js & npm:**
```bash
# macOS
brew install node

# Windows / Linux
# Download from https://nodejs.org (v18+ recommended)
```

**Verify installation:**
```bash
node --version  # v18+
npm --version   # v9+
```

**Claude Code CLI:**
```bash
npm install -g @anthropic-ai/claude-code
claude --version  # Should show 1.x.x
```

---

### **Step 2: Install VS Code & Claude Code Extension**

1. **Install VS Code**
   - Download from https://code.visualstudio.com
   - Minimum version: 1.98.0

2. **Install Claude Code Extension**
   - Open VS Code
   - Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux)
   - Search `Claude Code`
   - Install the one published by **Anthropic** (not third-party clones)
   - You'll see an orange spark icon (✱) in the toolbar

3. **Authenticate**
   - Click the spark icon or Command Palette (`Cmd+Shift+P` → "Claude Code: Open")
   - Browser opens → sign in with Anthropic account
   - (Alternative: set `ANTHROPIC_API_KEY` env var + start VS Code with `code .`)

4. **Verify Setup**
   - In VS Code integrated terminal: `claude --version`
   - Should show `claude-code 1.x.x`

---

### **Step 3: Create Project Directory**

```bash
# Create and navigate
mkdir timeless-eleven
cd timeless-eleven

# Initialize git
git init
git config user.name "Your Name"
git config user.email "your@email.com"

# Initialize Node.js project
npm init -y

# Install dependencies
npm install axios better-sqlite3 zlib
npm install -D vite react react-dom

# Create directory structure
mkdir -p scripts data public/data public/src src
touch .gitignore README.md CLAUDE.md
```

**.gitignore:**
```
node_modules/
dist/
.env
*.db
.DS_Store
```

---

### **Step 4: Create CLAUDE.md (System Prompt)**

This file tells Claude Code how your project is organized.

**CLAUDE.md:**
```markdown
# Timeless Eleven: Agentic Development Manifest

## Project Overview
Build an interactive football game where users:
1. Pick their national team
2. Roll the dice to get a random World Cup era
3. Build a starting XI from that era's squad
4. Simulate a match result

## Tech Stack
- **Frontend**: React 18 + Vite
- **Data**: JSON + gzip (stored in public/data/)
- **Agent tasks**: Fetch Zafronix API, enrich with Claude ratings, compress data
- **Hosting**: GitHub Pages (static)
- **Styling**: Tailwind CSS (via CDN)

## File Structure
```
timeless-eleven/
├── scripts/
│   ├── fetch-squads.mjs          # Zafronix API fetcher
│   ├── enrich-ratings.mjs        # Claude API enrichment
│   ├── build-json.mjs            # JSON writer
│   └── compress.mjs              # gzip compression
├── public/
│   ├── data/
│   │   ├── squads-1930-1950.json.gz
│   │   ├── squads-1950-1970.json.gz
│   │   ├── squads-1970-1990.json.gz
│   │   ├── squads-1990-2010.json.gz
│   │   ├── squads-2010-2026.json.gz
│   │   └── meta.json
│   ├── index.html
│   └── app.jsx
├── src/
│   ├── Game.jsx                  # Main game component
│   ├── TeamPicker.jsx            # Country selection
│   ├── YearRoller.jsx            # Year randomizer
│   ├── SquadSelector.jsx         # Player picker (11/11)
│   ├── MatchSimulator.jsx        # Match result display
│   ├── utils/
│   │   ├── db.js                 # Local data loader
│   │   └── simulator.js          # Match logic
│   └── styles.css
├── package.json
├── CLAUDE.md                     # THIS FILE
└── vite.config.js

## Agent Workflow Pattern

1. **Context gathering**: Read source files, understand structure
2. **Planning**: Break task into steps (fetch → validate → enrich → compress)
3. **Execution**: Run scripts, check output
4. **Verification**: Compare results, flag gaps
5. **Iteration**: Fix issues, improve data quality

## Zafronix API Details
- Endpoint: `https://api.zafronix.com/fifa/worldcup/v1/tournaments/{year}`
- Free tier: 1,000 req/day (no card needed)
- Response: 23 tournaments (1930-2026), 2,500+ players
- Needed fields: `tournament.teams[].squad[].{name, number, position}`

## Data Quality Expectations
- **Complete**: All players with name, number, position
- **Partial**: Missing some players or jersey numbers
- **Gaps**: Missing entire squads or data quality issues

Create `data/gaps.json` flagging any issues the agent finds.

## Claude Code Usage
When you open a file and click the spark icon (✱), prompt the agent with:
- "Build the squad fetcher from Zafronix"
- "Enrich player ratings using Claude API"
- "Compress all JSON files to .gz"
- "Create the React game UI"

The agent will:
- Read your entire codebase
- Suggest a plan (view before executing)
- Edit files, run scripts, commit changes
- Flag issues and improve on feedback

## Key Commands
- `claude --help`: Show all CLI options
- In VS Code: Press `✱` icon or `Cmd+Shift+P` → "Claude Code"
- Plan mode: Agent shows plan before executing (safer)
- @-mentions: Reference files with `@filename` in prompts

## Success Criteria
- [ ] Fetch all 23 World Cup squads from Zafronix
- [ ] Enrich players with historical ratings
- [ ] Compress JSON files to <2MB total gzipped
- [ ] React game loads, renders UI
- [ ] User can pick country, roll year, select 11 players
- [ ] Match simulation runs, displays result
- [ ] Deploy to GitHub Pages

## Notes for Claude Code
- Run agents incrementally (don't try to build everything at once)
- Test each script independently before chaining
- Keep JSON structure flat (easy to compress)
- Use batch API for Claude rating calls (50% cheaper)
- Git commit after each major phase
```

---

## **Phase 1: Agent Fetcher (The Data Pipeline)**

### **Goal**
Create a Node.js script that Claude Code can run to:
1. Fetch all 23 World Cup squads from Zafronix
2. Validate data
3. Output clean JSON files
4. Flag any gaps

### **Step 1: Scaffold Fetch Script**

Open VS Code. Click the spark icon (✱). Paste this prompt:

```
I need to build a Node.js script that fetches World Cup data from the Zafronix API.

Requirements:
- Fetch all 23 World Cups (1930-2026) from https://api.zafronix.com/fifa/worldcup/v1/tournaments/{year}
- For each tournament, extract country squads with player data (name, number, position)
- Validate that each player has name, number, and position
- Save raw data to `data/raw-squads.json`
- Flag any missing or incomplete data in `data/fetch-gaps.json`
- Log progress and stats (total countries, players, gaps)

Create `scripts/fetch-squads.mjs` with:
- Async function to fetch from Zafronix
- Error handling (rate limits, timeouts)
- Validation logic
- JSON output to public/data/

Use axios for HTTP requests. No API key needed (free tier).

Plan before executing.
```

**What Claude Code will do:**
- Create the script
- Show you a diff
- Ask for approval
- Run it and show results

---

### **Step 2: Enrich with Ratings**

Once the fetcher works, prompt:

```
Now I need to enrich the player data with historical ratings.

Read the raw squads from `data/raw-squads.json`.

For each player:
- Call Claude API (use Batch API for 50% discount) with prompt:
  "Rate this player's historical significance 1-10 (as a footballer in that era):
   Name: {name}, Position: {position}, Country: {country}, Year: {year}.
   Respond with ONLY a number 1-10."
- Store rating + confidence score
- Handle API errors gracefully

Output:
- `data/enriched-squads.json` with ratings added
- `data/enrichment-gaps.json` flagging uncertain ratings

Create `scripts/enrich-ratings.mjs`.

Use batch API: submit all requests at once, poll for results in 24 hours.
If running locally, cache responses so you don't re-query.

Plan before executing.
```

---

### **Step 3: Compress & Organize**

Once enriched data exists, prompt:

```
Now organize and compress the squad data for static hosting.

Read from `data/enriched-squads.json`.

Split by decade into separate files:
- squads-1930-1950.json (early tournaments)
- squads-1950-1970.json
- squads-1970-1990.json
- squads-1990-2010.json
- squads-2010-2026.json

Optimize each JSON:
- Use short keys: "n" for name, "pos" for position, "num" for number, "r" for rating
- Remove unnecessary fields (clubs, caps, birthdates)
- Keep structure flat for good gzip compression

Compress each to .json.gz using gzip.

Output to `public/data/squads-*.json.gz`.

Create a `public/data/meta.json` with:
- List of all countries (id, name, flag emoji)
- List of all tournaments (year, host)
- Data quality summary

Create `scripts/build-json.mjs` and `scripts/compress.mjs`.

Plan before executing.
```

---

### **Step 4: Create an npm Script**

Prompt Claude Code:

```
Add to package.json:
- "scripts": { "fetch": "node scripts/fetch-squads.mjs", "enrich": "node scripts/enrich-ratings.mjs", "build:data": "node scripts/build-json.mjs && node scripts/compress.mjs" }

Also create a GitHub Actions workflow in `.github/workflows/update-data.yml` that:
- Runs monthly after each World Cup
- Fetches latest squad data
- Re-enriches with ratings (if needed)
- Compresses and commits to repo

This way the data stays fresh automatically.
```

---

## **Phase 2: React Game UI**

### **Goal**
Build an interactive game where users:
1. Pick a country
2. Roll a random year
3. Select 11 players from that squad
4. See match results

### **Step 1: Setup Vite + React**

Prompt:

```
Set up Vite + React for Timeless Eleven.

Requirements:
- Create vite.config.js with React plugin
- Create public/index.html as entry point
- Create src/main.jsx as React root
- Install tailwind CSS from CDN (no build step needed)
- Add dev script: "npm run dev" should start local server

The game will be fully static (no server), so Vite just bundles React + game code.

Create the minimal boilerplate, don't build the full game yet.

Plan before executing.
```

---

### **Step 2: Build Game Components**

Prompt:

```
Create the main game components in src/:

1. **Game.jsx** (root component)
   - State: selectedCountry, selectedYear, selectedPlayers (array of 11), matchResult
   - Flow: CountryPicker → YearRoller → SquadSelector → MatchSimulator

2. **CountryPicker.jsx**
   - Load meta.json
   - Show dropdown or buttons for all countries
   - On select: setState(selectedCountry)

3. **YearRoller.jsx**
   - Show "Roll the Dice 🎲" button
   - On click: pick random year from selectedCountry's available years
   - Load the compressed squad file for that year
   - Show animation (spinning dice effect with CSS)

4. **SquadSelector.jsx**
   - Display all players from selected squad
   - User clicks to select 11 (show count: X/11)
   - Buttons for GK, DEF, MID, FWD filter
   - Show player ratings
   - "Lock In XI" button to proceed

5. **MatchSimulator.jsx**
   - Display selected XI (positions + names + ratings)
   - "Simulate Match" button
   - Show result: "Final Score: 7-0" or random scoreline
   - Confetti animation if they won 7-0
   - "Play Again" to reset

Create src/utils/db.js:
- loadMeta(): Load meta.json
- loadSquad(year, country): Decompress and load squad-*.json.gz
- calculateTeamRating(players): Sum player ratings
- simulateMatch(team1Rating, team2Rating): Return score (based on ratings + randomness)

Plan before executing.
```

---

### **Step 3: Styling & UX**

Prompt:

```
Polish the game UI with Tailwind CSS (via CDN):

1. Create src/styles.css with custom animations:
   - Dice roll animation (spin 3D)
   - Player selection pulse
   - Confetti burst for 7-0 win
   - Smooth transitions between screens

2. Design choices (pick ONE aesthetic, execute consistently):
   Option A: **Brutalist**: Bold sans-serif, stark black/white, minimal decoration
   Option B: **Retro 80s**: Gradient backgrounds, neon colors, pixelated fonts
   Option C: **Minimalist**: Clean typography, lots of whitespace, muted colors
   Option D: **Playful**: Rounded buttons, emoji accents, vibrant colors

3. Responsive design:
   - Mobile-first
   - Touch-friendly buttons (48px minimum)
   - Readable on all screen sizes

4. Include:
   - Header with Timeless Eleven branding + brief how-to-play
   - Loading states (showing "Loading squad data...")
   - Error messages (if squad fails to load)
   - Footer with "Built with Claude Code" credit

Execute the aesthetic choice I should pick. Be bold. Avoid generic AI slop.

Plan before executing.
```

---

## **Phase 3: Data Integration**

### **Step 1: Load & Cache Squad Data**

Prompt:

```
Update src/utils/db.js to:

1. Load meta.json on app startup
   - Cache in window.TIMELESS_DATA
   - Show loading spinner while fetching

2. On year roll, fetch the compressed squad file (e.g., squads-1990-2010.json.gz)
   - Browser auto-decompresses .gz files (GitHub Pages handles this)
   - Parse JSON
   - Cache in memory (don't re-fetch same file)

3. Implement pako (a gzip library for browser):
   npm install pako
   - Use pako.inflate() to decompress if needed

4. Handle errors:
   - Network timeout: show "Squad data unavailable"
   - Missing squad: show "No squad data for this year"
   - Graceful fallback to show available years only

Create a data loader with retries (max 3 attempts).

Plan before executing.
```

---

### **Step 2: GitHub Pages Deployment**

Prompt:

```
Configure GitHub Pages deployment:

1. Update package.json:
   - Add "build": "vite build" (outputs to dist/)
   - Add "deploy": "npm run build && git add dist/ && git commit -m 'Deploy' && git push"

2. Create .github/workflows/deploy.yml:
   - On push to main: run npm run build
   - Deploy dist/ to GitHub Pages

3. Create github Pages config in vite.config.js:
   - Set base: '/timeless-eleven/' (if using repo name as path)
   - OR use custom domain

4. Create gh-pages branch for deployment

5. Push to GitHub and verify at https://yourusername.github.io/timeless-eleven/

Plan before executing, show the complete workflow.
```

---

## **Phase 4: Testing & Polish**

### **Step 1: Manual Testing**

Prompt:

```
Test the game end-to-end:

1. Start dev server: npm run dev
2. Pick a country (e.g., Spain)
3. Roll the year (should pick random from available years)
4. See the squad load
5. Select 11 players
6. Simulate match
7. See result

As you test, log issues you find:
- Confetti not working?
- Squad data loading too slow?
- UI broken on mobile?
- Player ratings seem wrong?

Create `data/test-report.md` documenting:
- What works
- What's broken
- Suggested fixes (for next iteration)

Iterate based on findings.
```

---

### **Step 2: Performance Optimization**

Prompt:

```
Optimize performance:

1. Measure:
   - npm install --save-dev lighthouse
   - Run lighthouse audit
   - Report Core Web Vitals (LCP, FID, CLS)

2. Optimize:
   - Code split React components (lazy load MatchSimulator, etc.)
   - Minify JSON files (remove whitespace)
   - Pre-compress .json.gz files (gzip level 9)
   - Cache meta.json in localStorage
   - Lazy-load squad files only when needed

3. Target:
   - First load: <2 seconds
   - Squad load: <500ms
   - Page Lighthouse score: 90+

Create a performance report in `docs/PERFORMANCE.md`.
```

---

### **Step 3: Final Polish**

Prompt:

```
Final polish:

1. Add documentation:
   - README.md: How to play, how to build, how to deploy
   - ARCHITECTURE.md: Technical overview
   - CONTRIBUTING.md: How others can contribute

2. Add extras (optional):
   - Social share button ("I built a 7-0 team from Spain 1986!")
   - Stats tracking (saved lineups in localStorage)
   - Dark mode toggle
   - Multiple language support (for fun: English, Spanish, Portuguese)

3. Create a "Gaps Report" dashboard:
   - Show which squads have incomplete data
   - Link to Zafronix API to verify
   - Invite users to submit corrections

4. Commit everything, push to GitHub

```

---

## **Phase 5: Deployment & Updates**

### **Domain & Hosting**

```bash
# Buy domain (e.g., timelesseleven.com from Namecheap ~$6-7/year)

# Point to GitHub Pages:
# In domain registrar DNS settings:
# - A record: 185.199.108.153
# - A record: 185.199.109.153
# - A record: 185.199.110.153
# - A record: 185.199.111.153

# Verify in repo settings: Settings → Pages → Custom Domain
```

---

### **Ongoing Updates**

**Monthly data refresh (automatic via GitHub Actions):**
```bash
# After each World Cup tournament, the workflow runs:
1. Fetch new squads from Zafronix
2. Enrich with ratings
3. Compress and commit
4. GitHub Pages auto-deploys

# Manual update:
npm run fetch && npm run enrich && npm run build:data && git add public/data && git commit -m "Update squad data"
```

---

## **File-by-File Summary**

| File | Purpose | Priority |
|------|---------|----------|
| **scripts/fetch-squads.mjs** | Fetch from Zafronix | P0 |
| **scripts/enrich-ratings.mjs** | Claude API enrichment | P0 |
| **scripts/build-json.mjs** | Organize JSON | P0 |
| **scripts/compress.mjs** | Gzip compression | P0 |
| **src/Game.jsx** | Main game logic | P0 |
| **src/components/CountryPicker.jsx** | Country selection | P0 |
| **src/components/YearRoller.jsx** | Year randomizer | P0 |
| **src/components/SquadSelector.jsx** | Player picker | P0 |
| **src/components/MatchSimulator.jsx** | Match result | P0 |
| **src/utils/db.js** | Data loader | P0 |
| **src/utils/simulator.js** | Match logic | P0 |
| **src/styles.css** | Styling + animations | P1 |
| **public/index.html** | HTML entry | P0 |
| **CLAUDE.md** | Agent manifest | P0 |
| **vite.config.js** | Build config | P0 |
| **.github/workflows/deploy.yml** | Auto-deploy | P1 |
| **.github/workflows/update-data.yml** | Auto data refresh | P1 |

---

## **Estimated Timeline**

| Phase | Duration | Notes |
|-------|----------|-------|
| **Phase 0** | 30 mins | One-time setup |
| **Phase 1** | 2-4 hours | Data pipeline (biggest chunk) |
| **Phase 2** | 3-5 hours | React UI & game logic |
| **Phase 3** | 1-2 hours | Integration & deployment |
| **Phase 4** | 1-2 hours | Testing & polish |
| **Phase 5** | 30 mins | Deploy live |
| **TOTAL** | 8-14 hours | Spread over 2-3 days |

---

## **Tips for Working with Claude Code**

### **Best Practices**

1. **Start small**: Build one script fully before moving to the next
2. **Test independently**: Run each script alone before chaining them
3. **Use Plan Mode**: Let Claude show the plan before executing
4. **@-mention files**: `@fetch-squads.mjs` when referencing them
5. **Commit after each phase**: `git commit -m "Phase X: [description]"`
6. **Read diffs carefully**: Claude Code shows what will change before applying

### **Common Prompts**

```
# When stuck:
"Show me the current state of [filename]. What's broken?"

# When scaling:
"Refactor [filename] to handle 10x more data. Show the plan first."

# When debugging:
"Run [script] and show me the error. Then fix it."

# When iterating:
"The previous output was [issue]. Update [filename] to fix this. Plan first."
```

### **If Something Goes Wrong**

1. **Check the error message**: Claude Code shows what failed
2. **Ask Claude to debug**: "I got this error: [error]. Fix it."
3. **Revert to last commit**: `git checkout -- .`
4. **Start from saved checkpoint**: Claude Code has automatic checkpoints

---

## **Success Checklist**

- [x] Node.js + npm installed
- [x] Claude Code CLI + VS Code extension working
- [x] `CLAUDE.md` created (system prompt)
- [x] Zafronix squads fetched & validated
- [x] Player ratings enriched (Claude API)
- [x] JSON files compressed (<2MB total — 138 KB achieved)
- [x] React game loads in browser
- [x] Country picker works
- [x] Formation selection works
- [x] Dice roller + position selector functional
- [x] Coach picker works
- [x] Tournament bracket + match playback
- [x] Styling looks intentional & bold
- [x] GitHub Actions deploy workflow configured
- [ ] GitHub Pages enabled in repo settings
- [ ] Custom domain bought + DNS configured
- [ ] Ko-fi button added
- [ ] og:image created
- [ ] Live at timeless-xi.com

---

## **Next Steps After Launch**

1. **Gather user feedback** (Discord, Twitter, GitHub Issues)
2. **Track analytics** (which countries/years are popular)
3. **Expand features**:
   - Save lineups to localStorage
   - Compare lineups with friends (shareable links)
   - "Best possible XI" challenge (optimize by rating)
   - Historical commentary (why was this player in the squad?)
4. **Add more tournaments** (Euros, Copa América, Olympics)
5. **Mobile app** (React Native)

---

## **Questions?**

Open the VS Code terminal (`Ctrl+```) and ask Claude Code directly:
```
"I'm stuck on [problem]. Help me fix it."
```

Claude will read your code, understand the context, and help you move forward.

Good luck building! 🚀
