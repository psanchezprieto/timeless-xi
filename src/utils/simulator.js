import { getAllHistoricalTeamStats } from './db'

// ── Tier tables for fallback AI rating when no historical data exists ───────
const TIER_1 = new Set(['Brazil', 'Germany', 'Italy', 'Argentina', 'France', 'Spain', 'Netherlands', 'West Germany'])
const TIER_2 = new Set(['England', 'Portugal', 'Belgium', 'Uruguay', 'Croatia', 'Mexico', 'Sweden', 'Hungary', 'Russia'])
const TIER_3 = new Set(['Poland', 'Czech Republic', 'Czechoslovakia', 'Yugoslavia', 'Romania', 'Chile', 'Switzerland', 'Denmark', 'Turkey', 'South Korea', 'Japan', 'Austria', 'Morocco', 'Senegal', 'Ghana', 'Nigeria'])

function tierRating(country) {
  if (TIER_1.has(country)) return 72 + Math.random() * 14
  if (TIER_2.has(country)) return 60 + Math.random() * 14
  if (TIER_3.has(country)) return 50 + Math.random() * 12
  return 38 + Math.random() * 16
}

// ── Poisson-approximate goal count, capped at 8 ────────────────────────────
function poissonSample(lambda) {
  const l = Math.exp(-Math.max(0.1, lambda))
  let k = 0, p = Math.random()
  while (p > l && k < 8) { k++; p *= Math.random() }
  return k
}

// Generic player names for fallback scorers when opponent team has no roster
const GENERIC_PLAYER_NAMES = [
  'Silva', 'Martinez', 'Rodriguez', 'Garcia', 'Lopez', 'Fernandez',
  'Perez', 'Gonzalez', 'Sanchez', 'Ramirez', 'Torres', 'Diaz',
  'Muller', 'Schmidt', 'Neuer', 'Kroos', 'Schweinsteiger', 'Reus',
  'Buffon', 'Verratti', 'Marchisio', 'Thiago', 'Busquets', 'Xavi',
  'Hazard', 'De Bruyne', 'Kompany', 'Verhoeven', 'Pastore', 'Cavani',
]

const SCORER_WEIGHT = {
  // Broad legacy positions
  FWD: 3, MID: 1.5, DEF: 0.3, GK: 0.02,
  // Granular positions (used after the 10-position refactor)
  ST: 3, LW: 2.5, RW: 2.5,
  CM: 1.5, LM: 1.2, RM: 1.2, CAM: 2, CDM: 0.5,
  CB: 0.25, LB: 0.3, RB: 0.3,
}

function weightedPick(players) {
  const weights = players.map(p => SCORER_WEIGHT[p.position] ?? 0.5)
  const total = weights.reduce((a, b) => a + b, 0)
  if (total === 0) return players[Math.floor(Math.random() * players.length)].name
  let r = Math.random() * total
  for (let i = 0; i < players.length; i++) {
    r -= weights[i]
    if (r <= 0) return players[i].name
  }
  return players[players.length - 1].name
}

function getGoalScorers(players, count) {
  if (!count) return []

  // Use provided players if available, otherwise generate generic names
  if (players?.length > 0) {
    return Array.from({ length: count }, () => weightedPick(players))
  }

  // Fallback: random selection from generic pool
  return Array.from({ length: count }, () =>
    GENERIC_PLAYER_NAMES[Math.floor(Math.random() * GENERIC_PLAYER_NAMES.length)]
  )
}

// ── Core match simulation (0-100 rating scale) ────────────────────────────
// Skill weight (0.4) is intentionally larger than randomness (±0.4) so that
// a 30-point rating gap reliably produces the stronger side winning (~90%+).
export function simulateMatch(homeCountry, awayCountry, homeRating, awayRating, homePlayers = [], awayPlayers = []) {
  const diff = (homeRating - awayRating) / 10
  const homeExp = Math.max(0.15, 1.2 + diff * 0.4 + (Math.random() - 0.5) * 0.8)
  const awayExp = Math.max(0.15, 1.2 - diff * 0.4 + (Math.random() - 0.5) * 0.8)
  const homeGoals = poissonSample(homeExp)
  const awayGoals = poissonSample(awayExp)

  return {
    home: homeCountry,
    away: awayCountry,
    homeGoals,
    awayGoals,
    homeScorers: getGoalScorers(homePlayers, homeGoals),
    awayScorers: getGoalScorers(awayPlayers, awayGoals),
    draw: homeGoals === awayGoals,
    penalties: false,
  }
}

export function simulateKnockoutMatch(homeTeam, awayTeam) {
  const result = simulateMatch(
    homeTeam.country, awayTeam.country,
    homeTeam.avgRating, awayTeam.avgRating,
    homeTeam.players || [],
    awayTeam.players || []
  )

  if (result.draw) {
    result.penalties = true
    const winnerScore = 3 + Math.floor(Math.random() * 3)   // 3, 4, or 5
    const loserScore  = winnerScore - (1 + Math.floor(Math.random() * 2)) // winner - 1 or 2
    const homeWins    = Math.random() < 0.5
    result.penHome    = homeWins ? winnerScore : loserScore
    result.penAway    = homeWins ? loserScore  : winnerScore
    result.winner = result.penHome > result.penAway ? homeTeam : awayTeam
  } else {
    result.winner = result.homeGoals > result.awayGoals ? homeTeam : awayTeam
  }

  return result
}

// ── AI team generation ─────────────────────────────────────────────────────

// Async: pull real historical squads from data files, exclude user's own entry.
export async function generateHistoricalAITeams(userCountry, userYear, count = 31) {
  const allTeams = await getAllHistoricalTeamStats()
  const pool = allTeams.filter(t => !(t.country === userCountry && t.year === userYear))
  return pool.sort(() => Math.random() - 0.5).slice(0, count)
}

// Sync fallback used when historical data isn't available yet.
const FALLBACK_POOL = [
  'Algeria','Austria','Belgium','Bolivia','Brazil','Bulgaria','Cameroon','Canada',
  'Chile','Colombia','Costa Rica','Croatia','Czech Republic','Czechoslovakia',
  'Denmark','Ecuador','Egypt','England','France','Germany','Ghana','Greece',
  'Honduras','Hungary','Iceland','Iran','Iraq','Italy','Ivory Coast','Jamaica',
  'Japan','Kuwait','Mexico','Morocco','Netherlands','Nigeria','Norway','Panama',
  'Paraguay','Peru','Poland','Portugal','Qatar','Romania','Russia','Saudi Arabia',
  'Scotland','Senegal','Serbia','Slovakia','Slovenia','South Africa','South Korea',
  'Spain','Sweden','Switzerland','Togo','Trinidad and Tobago','Tunisia','Turkey',
  'Ukraine','United States','Uruguay','Wales','West Germany','Yugoslavia','Zaire',
]

export function generateAITeams(userCountry, count = 31) {
  const pool = FALLBACK_POOL.filter(c => c !== userCountry)
  return pool.sort(() => Math.random() - 0.5).slice(0, count).map(country => ({
    country,
    year: null,
    avgRating: parseFloat(tierRating(country).toFixed(1)),
    isUser: false,
  }))
}

export function calcTeamRating(players, coach) {
  if (!players?.length) return 60
  const avg = players.reduce((s, p) => s + (p.rating || 60), 0) / players.length
  const moraleBonus = coach?.moraleBoost || 0
  return parseFloat((avg + moraleBonus).toFixed(1))
}

export function createGroups(teams) {
  const shuffled = [...teams].sort(() => Math.random() - 0.5)
  return ['A','B','C','D','E','F','G','H'].map((letter, i) => ({
    name: letter,
    teams: shuffled.slice(i * 4, i * 4 + 4).map(t => ({ ...t, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 })),
    matches: [],
  }))
}

export function simulateGroup(group) {
  const teams = group.teams.map(t => ({ ...t }))
  const matches = []

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const result = simulateMatch(
        teams[i].country, teams[j].country,
        teams[i].avgRating, teams[j].avgRating,
        teams[i].players || [],
        teams[j].players || []
      )
      matches.push(result)
      teams[i].gf += result.homeGoals; teams[i].ga += result.awayGoals
      teams[j].gf += result.awayGoals; teams[j].ga += result.homeGoals
      if (result.homeGoals > result.awayGoals) { teams[i].w++; teams[i].pts += 3; teams[j].l++ }
      else if (result.awayGoals > result.homeGoals) { teams[j].w++; teams[j].pts += 3; teams[i].l++ }
      else { teams[i].d++; teams[i].pts++; teams[j].d++; teams[j].pts++ }
    }
  }

  teams.sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga))
  return { ...group, teams, matches }
}
