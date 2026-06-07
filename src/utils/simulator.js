// Ratings use the 0-100 scale stored in the squad data (passed through by db.js).
// AI team ratings are generated in the same 0-100 range for fair comparison.

const TIER_1 = new Set(['Brazil', 'Germany', 'Italy', 'Argentina', 'France', 'Spain', 'Netherlands', 'West Germany'])
const TIER_2 = new Set(['England', 'Portugal', 'Belgium', 'Uruguay', 'Croatia', 'Mexico', 'Sweden', 'Hungary', 'Russia'])
const TIER_3 = new Set(['Poland', 'Czech Republic', 'Czechoslovakia', 'Yugoslavia', 'Romania', 'Chile', 'Switzerland', 'Denmark', 'Turkey', 'South Korea', 'Japan', 'Austria'])

const AI_COUNTRY_POOL = [
  'Algeria','Australia','Austria','Bolivia','Bulgaria','Cameroon','Canada','Chile','Colombia',
  'Costa Rica','Czech Republic','Czechoslovakia','Denmark','Ecuador','Egypt','El Salvador',
  'Ghana','Greece','Honduras','Hungary','Iceland','Iran','Iraq','Ivory Coast','Jamaica',
  'Japan','Kuwait','Mexico','Morocco','Netherlands','Nigeria','Norway','Panama','Paraguay',
  'Peru','Poland','Portugal','Qatar','Romania','Russia','Saudi Arabia','Scotland','Senegal',
  'Serbia','Slovakia','Slovenia','South Africa','South Korea','Sweden','Switzerland','Togo',
  'Trinidad and Tobago','Tunisia','Turkey','Ukraine','United States','Uruguay','Wales',
  'West Germany','Yugoslavia','Zaire',
]

function aiRating(country) {
  if (TIER_1.has(country)) return 70 + Math.random() * 15   // 70-85
  if (TIER_2.has(country)) return 60 + Math.random() * 15   // 60-75
  if (TIER_3.has(country)) return 50 + Math.random() * 15   // 50-65
  return 40 + Math.random() * 20                             // 40-60
}

export function generateAITeams(userCountry, count = 31) {
  const pool = AI_COUNTRY_POOL.filter(c => c !== userCountry)
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count)
  return shuffled.map(country => ({
    country,
    avgRating: parseFloat(aiRating(country).toFixed(1)),
    isUser: false,
  }))
}

export function calcTeamRating(players, coach) {
  if (!players || !players.length) return 60
  const avg = players.reduce((s, p) => s + (p.rating || 60), 0) / players.length
  const moraleBonus = (coach?.moraleBoost || 0) // morale adds direct rating points
  return parseFloat((avg + moraleBonus).toFixed(1))
}

// Poisson-approximate sample capped at 8
function poissonSample(lambda) {
  const l = Math.exp(-Math.max(0.1, lambda))
  let k = 0, p = Math.random()
  while (p > l && k < 8) { k++; p *= Math.random() }
  return k
}

function weightedPick(players) {
  const weights = players.map(p => {
    if (p.position === 'FWD') return 3
    if (p.position === 'MID') return 1.5
    if (p.position === 'DEF') return 0.3
    return 0
  })
  const total = weights.reduce((a, b) => a + b, 0)
  if (total === 0) return players[Math.floor(Math.random() * players.length)].name
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return players[i].name
  }
  return players[players.length - 1].name
}

function getGoalScorers(players, count) {
  if (!count || !players?.length) return []
  return Array.from({ length: count }, () => weightedPick(players))
}

// Ratings on 0-100 scale. Returns a match result object.
export function simulateMatch(homeCountry, awayCountry, homeRating, awayRating, homePlayers = []) {
  const diff = (homeRating - awayRating) / 10 // normalize to ~0-3 range
  const homeExp = Math.max(0.3, 1.3 + diff * 0.25 + (Math.random() - 0.5) * 1.5)
  const awayExp = Math.max(0.3, 1.0 - diff * 0.25 + (Math.random() - 0.5) * 1.5)
  const homeGoals = poissonSample(homeExp)
  const awayGoals = poissonSample(awayExp)

  return {
    home: homeCountry,
    away: awayCountry,
    homeGoals,
    awayGoals,
    homeScorers: getGoalScorers(homePlayers, homeGoals),
    awayScorers: [],
    draw: homeGoals === awayGoals,
    penalties: false,
  }
}

export function simulateKnockoutMatch(homeTeam, awayTeam, homePlayers = []) {
  const result = simulateMatch(
    homeTeam.country, awayTeam.country,
    homeTeam.avgRating, awayTeam.avgRating,
    homePlayers
  )

  if (result.draw) {
    result.penalties = true
    result.penHome = Math.floor(Math.random() * 6)
    result.penAway = Math.floor(Math.random() * 6)
    while (result.penHome === result.penAway) {
      result.penHome = Math.floor(Math.random() * 6)
      result.penAway = Math.floor(Math.random() * 6)
    }
    result.winner = result.penHome > result.penAway ? homeTeam : awayTeam
  } else {
    result.winner = result.homeGoals > result.awayGoals ? homeTeam : awayTeam
  }

  return result
}

export function createGroups(teams) {
  const shuffled = [...teams].sort(() => Math.random() - 0.5)
  const groupLetters = ['A','B','C','D','E','F','G','H']
  return groupLetters.map((letter, i) => ({
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
        teams[i].isUser ? teams[i].players : []
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
