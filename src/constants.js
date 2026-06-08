export const FORMATIONS = {
  '4-4-2': {
    name: '4-4-2 Classic',
    positions: { GK: 1, DEF: 4, MID: 4, FWD: 2 },
    description: 'Balanced defense and attack',
  },
  '4-3-3': {
    name: '4-3-3 Modern',
    positions: { GK: 1, DEF: 4, MID: 3, FWD: 3 },
    description: 'Flexible midfield with wing play',
  },
  '3-5-2': {
    name: '3-5-2 Attacking',
    positions: { GK: 1, DEF: 3, MID: 5, FWD: 2 },
    description: 'Midfield dominance and width',
  },
  '5-3-2': {
    name: '5-3-2 Defensive',
    positions: { GK: 1, DEF: 5, MID: 3, FWD: 2 },
    description: 'Solid defense, quick counterattacks',
  },
  '4-2-4': {
    name: '4-2-4 Vintage',
    positions: { GK: 1, DEF: 4, MID: 2, FWD: 4 },
    description: 'Ultra-aggressive, classic 80s style',
  },
}

export const POSITIONS = {
  GK:  { name: 'Goalkeeper',  abbr: 'GK' },
  DEF: { name: 'Defender',    abbr: 'DEF' },
  MID: { name: 'Midfielder',  abbr: 'MID' },
  FWD: { name: 'Forward',     abbr: 'FWD' },
  // Specific positions (used after enrichment)
  CB:  { name: 'Center Back',  abbr: 'CB' },
  LB:  { name: 'Left Back',    abbr: 'LB' },
  RB:  { name: 'Right Back',   abbr: 'RB' },
  CM:  { name: 'Central Mid',  abbr: 'CM' },
  LM:  { name: 'Left Mid',     abbr: 'LM' },
  RM:  { name: 'Right Mid',    abbr: 'RM' },
  ST:  { name: 'Striker',      abbr: 'ST' },
  LW:  { name: 'Left Wing',    abbr: 'LW' },
  RW:  { name: 'Right Wing',   abbr: 'RW' },
}

export const TOURNAMENT_STRUCTURE = {
  GROUPS: 8,
  TEAMS_PER_GROUP: 4,
  TOTAL_TEAMS: 32,
  ROUNDS: ['Group', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final'],
}
