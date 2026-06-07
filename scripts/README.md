# Data Pipeline Scripts

This directory contains all scripts for fetching, enriching, and compressing World Cup squad data.

## Quick Start

```bash
# 1. Install dependencies (one-time)
npm install

# 2. Test API connectivity
node scripts/test-api.mjs

# 3. Fetch squads (test mode: 2 years)
node scripts/fetch-squads.mjs --test

# 4. Fetch all squads (23 World Cups)
npm run fetch

# 5. Enrich with ratings (requires ANTHROPIC_API_KEY)
npm run enrich

# 6. Build and compress final data
npm run build:data

# Or all at once:
npm run pipeline
```

---

## Scripts Overview

### `fetch-squads.mjs` — Zafronix Data Fetcher

**Purpose**: Fetch all 23 World Cup squads from the Zafronix API.

**Input**: 
- API endpoint: `https://api.zafronix.com/fifa/worldcup/v1/tournaments/{year}`
- Years: 1930–2026 (23 total)

**Output**:
- `data/raw-squads.json` — Raw squad data with all players
- `data/fetch-gaps.json` — Report of missing/incomplete data

**Usage**:
```bash
# Test with 2 years (1930, 2022)
npm run fetch -- --test

# Full fetch (all 23 years)
npm run fetch
```

**What it does**:
1. Fetches each tournament from Zafronix
2. Validates each player has: name, number, position
3. Normalizes country codes (e.g., "Brazil" → "BRA")
4. Flags incomplete records in gaps report
5. Logs progress and statistics

**Expected output**:
```
✓ Saved 256 squads to data/raw-squads.json
✓ Saved gaps report to data/fetch-gaps.json

📈 Statistics:
  • Total squads: 256
  • Total players: 8,547
  • Unique countries: 89
  • Years with data: 23/23
```

---

### `test-api.mjs` — API Validation

**Purpose**: Quickly test Zafronix API connectivity and validate response structure.

**Usage**:
```bash
node scripts/test-api.mjs
```

**Output**: 
- Confirms API is reachable
- Shows response structure (teams, squad, player fields)
- Validates data format before running full fetch

**When to use**: Before your first `npm run fetch`, or if you suspect API changes.

---

### `enrich-ratings.mjs` — Claude API Enrichment *(Phase 1b)*

**Purpose**: Add player ratings (1–10 scale) using Claude API batch processing.

**Input**: 
- `data/raw-squads.json`
- `ANTHROPIC_API_KEY` environment variable

**Output**:
- `data/enriched-squads.json` — Squads with ratings
- `data/enrichment-gaps.json` — Report of uncertain/missing ratings

**Usage**:
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npm run enrich
```

**Cost**: ~$20–40 USD for all players (batch API, 50% cheaper than regular)

---

### `build-json.mjs` — JSON Optimizer *(Phase 1c)*

**Purpose**: Organize enriched data by decade and optimize for size.

**Input**: `data/enriched-squads.json`

**Output**: 
- `public/data/squads-1930-1950.json`
- `public/data/squads-1950-1970.json`
- ... (5 files total, one per decade)
- `public/data/meta.json` — Country registry and metadata

**Optimization**:
- Short keys: "c" (country), "y" (year), "p" (players), "r" (rating)
- Removes unused fields (caps, goals, assists, club)
- ~30% smaller than raw JSON

---

### `compress.mjs` — gzip Compression *(Phase 1c)*

**Purpose**: Compress decade files for web serving.

**Input**: `public/data/squads-*.json`

**Output**: `public/data/squads-*.json.gz`

**Target size**: <2 MB total gzipped (~20 KB per decade)

**Browser loading**: Decompress with `pako.inflate()` at runtime (<100 ms)

---

## Data Quality

### Expected Coverage

- **Tournaments**: 23 (1930–2026)
- **Teams**: ~256 (some years had 16 teams, recent have 32)
- **Players**: ~8,000–9,000
- **Data completeness**: 95%+ (some early tournaments have gaps)

### Gap Reports

After each phase, check the gaps report:

```bash
cat data/fetch-gaps.json      # API/network issues
cat data/enrichment-gaps.json  # Rating uncertainties
```

If a player is missing a rating, the system falls back to era-based defaults:
- 1930–1950: base 5
- 1950–1974: base 6
- 1974–2000: base 7
- 2000+: base 8

---

## Environment Variables

```bash
ANTHROPIC_API_KEY   # Required for enrich phase
DEBUG               # Set to "1" for verbose logs
```

---

## Troubleshooting

### "API error" or "timeout"
- Check internet connection: `node scripts/test-api.mjs`
- Zafronix may have rate limiting; retry in 30 seconds

### "unexpected API structure"
- Zafronix may have changed response format
- Run `node scripts/test-api.mjs` to debug
- File issue with sample output

### "Module not found: axios"
- Install dependencies: `npm install`

### "ANTHROPIC_API_KEY not set"
- Export key before enrich phase: `export ANTHROPIC_API_KEY="sk-ant-..."`
- Get key from https://console.anthropic.com

---

## Next Steps

- **Phase 1b**: Run `npm run enrich` to add player ratings
- **Phase 1c**: Run `npm run build:data` to optimize and compress
- **Phase 2**: Start React UI components

See `/docs/PROGRESS.md` for full roadmap.
