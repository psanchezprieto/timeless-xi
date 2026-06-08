# Timeless XI: Project Brief

**Build an interactive World Cup simulation game where players assemble dream teams from historical squads and compete in a tournament.**

---

## **1. Product Overview**

### **What is Timeless XI?**

Timeless XI is a browser-based game that lets users:
1. **Select a country** from the current World Cup
2. **Choose a formation** (4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-4)
3. **Build their XI** by rolling dice and picking players position-by-position (with 3 "strikes" to re-roll)
4. **Hire a coach** (name + morale/tactic boost)
5. **Simulate a tournament** (group stage → round of 16 → quarters → semis → final)
6. **Face randomized opponents** from historical World Cups (e.g., Korea 2002, Brasil 1978)
7. **Share results** as a beautiful PNG with campaign stats

### **Core Loop**

```
User → Pick Country → Pick Formation → Roll Dice → Pick XI (pos-by-pos)
→ Pick Coach → Simulate Tournament → See Results → Share/Download PNG
```

---

## **2. User Journey**

### **Screen 1: Homepage / Country Selection**

**What user sees:**
- "Timeless XI" logo + tagline: "Build your dream team and win the World Cup"
- List of countries from the current World Cup (2026)
- Flag emoji + country name
- Search/filter option (especially helpful for former USSR countries)

**Mechanics:**
- Click a country to proceed
- Country roster is locked in (all players who ever played for that country across WC history)

**Note on USSR/Historical countries:**
- Display as: "USSR (1930-1991) → Russia (1992-present)"
- Let user pick either, but lock to available squads for that era
- Czechoslovakia → Czech Republic + Slovakia (allow both)
- Yugoslavia → Serbia, Croatia, Bosnia, Slovenia, North Macedonia (allow all)
- East/West Germany merge to "Germany"

**Next button:** "Choose Formation"

---

### **Screen 2: Formation Selection**

**What user sees:**
- 4 formation cards (4-4-2, 4-3-3, 3-5-2, 5-3-2)
- Visual diagram showing defensive/attacking positions
- Formation description: "4-4-2: Balanced, classic formation"
- Coach morale boost preview (e.g., "+5% morale if you pick Pelé")

**Mechanics:**
- Click formation to select
- Formation locks in and determines position order for dice rolling
- Show pitch diagram with positions filled as user progresses

**Next button:** "Start Rolling"

---

### **Screen 3: Dice Rolling & Player Selection**

**What user sees:**
- **Header:** Country flag + formation diagram (showing filled positions)
- **Current position:** "GK (Goalkeeper) - Required: 1"
- **Dice rolling area:** Large animated dice button ("Roll the Dice 🎲")
- **Player cards:** Top 5-8 options appear after roll, sorted by rating
- **Player card shows:** Name, number, position, era (year), rating (1-10), era info
- **Strike counter:** "⚠️ Strikes left: 3" (red X for each used)

**Mechanics:**

1. **Position sequence** (determined by formation):
   - 4-4-2: GK → DEF (4) → MID (4) → FWD (2)
   - 4-3-3: GK → DEF (4) → MID (3) → FWD (3)
   - 3-5-2: GK → DEF (3) → MID (5) → FWD (2)
   - 5-3-2: GK → DEF (5) → MID (3) → FWD (2)

2. **Rolling the dice:**
   - Click "Roll the Dice 🎲" → visual dice animation (2-3 seconds)
   - Result: 5-8 random players from country's history for that position
   - Players sorted by rating (highest first)

3. **Selecting a player:**
   - Click a player card → add to XI
   - Position now shows "✓ Filled" in green
   - Move to next position

4. **Using strikes:**
   - Don't like the rolled options? Click "Skip & Re-roll" (costs 1 strike)
   - Dice rolls again with fresh set of players
   - Once strikes = 0, user MUST pick from next roll

5. **After 11 players:**
   - UI moves to "Pick Your Coach"

**Coach Selection:**

**What user sees:**
- Same country's historical coaches (draw from historical data)
- Coach card: Name, nationality (if foreign), era, morale boost
- Example: "Tele Santana (1978)" → "+5% morale" or specific boost (e.g., "+10% possession")

**Mechanics:**
- Click coach card to select
- Once selected → "Build Complete! Let's Simulate."

**Next button:** "Simulate Tournament"

---

### **Screen 4: Tournament Simulation**

**What user sees:**
- **Header:** Country, XI preview (names + positions), formation badge
- **Tournament bracket:** Shows group stage → knockout stages
- **Match-by-match playback:** Text-based scoreline + event summary

**Tournament Structure:**

1. **Group Stage**
   - 4 groups, 4 teams each (32 teams total, realistic WC format)
   - User's team assigned to random group
   - 3 opponents drawn from historical WC squads (e.g., "Korea 2002", "Brasil 1978")
   - User plays 3 matches

2. **Match Simulation**
   - **Before match:** "vs Korea 2002 in Seoul, South Korea" (stadium location + era)
   - **During match:** Text scoreline updates
     - "15': Gol! Ronaldo scores!" 
     - "34': Yellow card to Silva"
     - "45'+2': Half time: 2-1"
   - **Final score:** "Full Time: 4-2"
   - **Scorers listed:** "Goals: Ronaldo (15', 45'), Zidane (28'), Silva (67')"
   - **Team stats:** Possession %, shots on target, pass accuracy

3. **Progression Logic**
   - Points: Win = 3, Draw = 1, Loss = 0
   - Group standings determined after 3 matches
   - If qualified: Proceed to Round of 16
   - If not: "Elimination: Finished 4th in group" → Campaign ends

4. **Knockout Stages**
   - **Round of 16:** Random draw from other group winners
   - **Quarters:** Random opponent from remaining teams
   - **Semis:** Random opponent
   - **Final:** If you win semis, random final opponent

5. **Match Outcomes**
   - Score based on: Team average rating vs opponent average rating + RNG
   - Formula: `user_rating - opponent_rating + random(-2 to +2)` determines goal differential
   - Example: User team avg 7.5 vs opponent avg 6.2 = expected edge of ~1.3 goals
   - RNG makes upsets possible but rare

---

### **Screen 5: Campaign Summary & Results**

**What user sees (before shareable PNG):**

1. **Tournament Overview**
   - Final standing: "🏆 Champion!" or "2nd Place" or "Eliminated in Quarters"
   - Stats box:
     - Matches played: 7
     - Win-Draw-Loss record: 6-1-0
     - Goals for / against: 23-7
     - Best player: "Ronaldo (5 goals)"
     - Toughest opponent: "Germany 1990 (lost 2-3)"
     - Morale boost applied: Coach name + bonus

2. **Tournament Bracket** (collapsible)
   - Group stage results (3 matches)
   - Knockout bracket showing all opponents + scores

3. **Squad Overview**
   - XI listed with formations (e.g., "GK: Casillas (8.2), DEF: Piqué (7.8), ...")
   - Coach name
   - Formation badge

4. **Download Options**
   - "📥 Download as PNG" button
   - "📋 Copy to Clipboard" (as text)
   - "🔗 Share Link" (generates shareable URL with stats encoded)

---

### **Screen 6: Shareable PNG Summary**

**What PNG contains:**

```
┌─────────────────────────────────────────────┐
│        Timeless XI - Campaign Summary       │
├─────────────────────────────────────────────┤
│ 🇪🇸 Spain - Formation: 4-3-3              │
│ Coach: Luis Aragonés (+5% morale)          │
├─────────────────────────────────────────────┤
│ RESULT: 🏆 2026 World Cup Champion          │
├─────────────────────────────────────────────┤
│ Campaign Stats:                             │
│ • Matches: 7 (6 wins, 1 draw, 0 losses)    │
│ • Goals: 23 scored, 7 conceded              │
│ • Best Player: Lamine Yamal (6 goals)      │
│ • Toughest Opponent: Germany 1990 (drew 1) │
├─────────────────────────────────────────────┤
│ Tournament Path:                            │
│ GROUP A: Spain 2-1 France, Spain 3-0 Japan,│
│          Spain 1-0 Belgium (1st place)     │
│ R16: Spain 2-1 Netherlands (AET)            │
│ QF: Spain 2-0 Brazil                       │
│ SF: Spain 1-1 Germany (4-2 pens)           │
│ FINAL: Spain 3-2 Argentina ✓               │
├─────────────────────────────────────────────┤
│ Starting XI (4-3-3):                        │
│ GK: Casillas (8.2)                         │
│ DEF: Alba (7.8), Piqué (7.9), Ramos (7.7),│
│      Albiol (7.6)                          │
│ MID: Xavi (8.1), Busquets (7.9), Iniesta│
│      (8.3)                                 │
│ FWD: Torres (7.9), Villa (7.8), Mata (7.5)│
├─────────────────────────────────────────────┤
│ Built with Timeless XI | timelessxi.com    │
└─────────────────────────────────────────────┘
```

**PNG Generation:**
- Use library like `html2canvas` or `canvas-based rendering`
- High-quality, shareable (1080x1440 pixels)
- Can be posted on Twitter, Instagram, Discord

---

## **3. Data Model**

### **Core Entities**

**Countries**
```json
{
  "id": "ESP",
  "name": "Spain",
  "flag": "🇪🇸",
  "allTimeSquads": [
    { "year": 1986, "tournament": "World Cup", "players": [...] },
    { "year": 2010, "tournament": "World Cup", "players": [...] }
  ]
}
```

**Players**
```json
{
  "id": "unique_id",
  "name": "Iniesta",
  "number": 6,
  "position": "MID",
  "era": 2010,
  "countryId": "ESP",
  "rating": 8.3,
  "goals": 2,
  "appearances": 131
}
```

**Coaches**
```json
{
  "id": "unique_id",
  "name": "Luis Aragonés",
  "countryId": "ESP",
  "era": 2010,
  "moraleBoost": 5
}
```

**Match Results** (generated during simulation)
```json
{
  "matchId": "unique_id",
  "userScore": 2,
  "opponentScore": 1,
  "scorers": [
    { "playerName": "Ronaldo", "minute": 23, "team": "user" },
    { "playerName": "Maldini", "minute": 45, "team": "opponent" }
  ],
  "stadium": "Estadio Azteca, Mexico City",
  "stats": { "possession": 55, "shotsOnTarget": 8, "passAccuracy": 82 }
}
```

---

## **4. Technical Stack**

### **Frontend**
- **Framework:** React 18 (with Vite)
- **Styling:** Tailwind CSS (via CDN)
- **Animations:** CSS + framer-motion (optional)
- **PNG generation:** html2canvas
- **State management:** React hooks

### **Data**
- **Format:** JSON + gzip (split by decade)
- **Size:** ~2-3MB gzipped total
- **Serving:** GitHub Pages (static)

### **Hosting**
- **Primary:** GitHub Pages (free)
- **Domain:** Custom domain (~$6-7/year)

---

## **5. Match Simulation Logic**

**Algorithm:**
```
user_avg_rating = average of 11 players' ratings
opponent_avg_rating = average of opponent's players

goal_differential = (user_avg_rating - opponent_avg_rating) * 0.5 + random(-2, +2)
```

**Factors:**
- Team average rating (primary)
- Coach morale boost (secondary, +2-5%)
- Random variance (enables upsets)

---

## **6. Timeline Estimate**

| Phase | Duration |
|-------|----------|
| **Setup** | 30 mins |
| **Data Pipeline** | 2-4 hrs |
| **Game Logic** | 4-6 hrs |
| **UI/Components** | 3-5 hrs |
| **PNG Generation** | 1-2 hrs |
| **Polish & Test** | 2-3 hrs |
| **Deployment** | 1 hr |
| **TOTAL** | **14-21 hrs** |

---

## **Success Criteria**

- [ ] Game loads in <3 seconds
- [ ] Campaign completes in <15 minutes
- [ ] PNG download works + looks shareable
- [ ] Mobile responsive
- [ ] Data quality: >95% of players have all fields

---

## **Next Steps**

1. **Review this brief** ✓
2. **Open VS Code** with TIMELESS_ELEVEN_ROADMAP.md
3. **Start Phase 0** (environment setup)
4. **Use Claude Code** to build each section

Ready? Let's build! 🚀
