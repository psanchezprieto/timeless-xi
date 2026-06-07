// Game formations with position breakdown
export const FORMATIONS = {
  '4-4-2': {
    name: '4-4-2 Classic',
    positions: {
      GK: 1,
      DEF: 4,
      MID: 4,
      FWD: 2,
    },
    description: 'Balanced defense and attack',
  },
  '4-3-3': {
    name: '4-3-3 Modern',
    positions: {
      GK: 1,
      DEF: 4,
      MID: 3,
      FWD: 3,
    },
    description: 'Flexible midfield with wing play',
  },
  '3-5-2': {
    name: '3-5-2 Attacking',
    positions: {
      GK: 1,
      DEF: 3,
      MID: 5,
      FWD: 2,
    },
    description: 'Midfield dominance and width',
  },
  '5-3-2': {
    name: '5-3-2 Defensive',
    positions: {
      GK: 1,
      DEF: 5,
      MID: 3,
      FWD: 2,
    },
    description: 'Solid defense, quick counterattacks',
  },
}

// Player positions in the game
export const POSITIONS = {
  GK: { name: 'Goalkeeper', abbr: 'GK' },
  DEF: { name: 'Defender', abbr: 'DEF' },
  MID: { name: 'Midfielder', abbr: 'MID' },
  FWD: { name: 'Forward', abbr: 'FWD' },
}

// Ball distribution by formation (% of possession per position group)
export const BALL_DISTRIBUTION = {
  '4-4-2': { GK: 5, DEF: 30, MID: 40, FWD: 25 },
  '4-3-3': { GK: 5, DEF: 28, MID: 42, FWD: 25 },
  '3-5-2': { GK: 5, DEF: 20, MID: 50, FWD: 25 },
  '5-3-2': { GK: 5, DEF: 40, MID: 30, FWD: 25 },
}

// Match simulation parameters
export const MATCH_PARAMS = {
  BASE_DURATION: 90, // minutes
  INJURY_RISK: 0.05, // 5% per match
  GOAL_WEIGHT: {
    FWD: 2.0, // Forwards more likely to score
    MID: 1.2,
    DEF: 0.2,
    GK: 0.0,
  },
}

// Coach morale boost range
export const COACH_BOOST_RANGE = { min: 2, max: 5 }

// Player rating scale (0-100 FIFA-style)
export const RATING_SCALE = { min: 40, max: 100 }

// Tournament structure
export const TOURNAMENT_STRUCTURE = {
  GROUPS: 8,
  TEAMS_PER_GROUP: 4,
  TOTAL_TEAMS: 32,
  ROUNDS: ['Group', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final'],
}
