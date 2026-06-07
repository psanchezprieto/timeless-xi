import { FORMATIONS, BALL_DISTRIBUTION, MATCH_PARAMS } from '../constants'

/**
 * Calculate team strength (average rating adjusted for formation)
 */
export function calculateTeamStrength(players, formation) {
  if (!players || players.length === 0) return 50

  const avgRating = players.reduce((sum, p) => sum + (p.rating || 70), 0) / players.length

  // Formations have different baseline strengths (just for flavor)
  const formationBonus = {
    '4-4-2': 0,
    '4-3-3': 2,
    '3-5-2': 1,
    '5-3-2': -1,
  }

  return Math.max(30, Math.min(99, avgRating + (formationBonus[formation] || 0)))
}

/**
 * Simulate a single match
 */
export function simulateMatch(homeTeam, awayTeam, homeCoach = null, awayCoach = null) {
  const homeStrength = calculateTeamStrength(homeTeam.players, homeTeam.formation)
  const awayStrength = calculateTeamStrength(awayTeam.players, awayTeam.formation)

  // Apply coach boosts
  const homeBoost = homeCoach ? homeCoach.moraleBoost : 0
  const awayBoost = awayCoach ? awayCoach.moraleBoost : 0

  const adjustedHome = homeStrength + homeBoost
  const adjustedAway = awayStrength + awayBoost

  // Match simulation: base on strength difference
  const strengthDiff = adjustedHome - adjustedAway
  const homeWinChance = 0.5 + strengthDiff * 0.005 // Each point = 0.5% swing

  // Generate goals (average 2.5 goals per team)
  const homeGoals = Math.floor(Math.random() * 4 + (homeWinChance > 0.5 ? 1 : 0))
  const awayGoals = Math.floor(Math.random() * 4 + (homeWinChance < 0.5 ? 1 : 0))

  // Get goal scorers
  const homeScorers = getGoalScorers(homeTeam.players, homeGoals)
  const awayScorers = getGoalScorers(awayTeam.players, awayGoals)

  return {
    homeTeam: homeTeam.country,
    awayTeam: awayTeam.country,
    homeGoals,
    awayGoals,
    homeScorers,
    awayScorers,
    homeWin: homeGoals > awayGoals,
    awayWin: awayGoals > homeGoals,
    draw: homeGoals === awayGoals,
  }
}

/**
 * Select random goal scorers based on position (forwards more likely)
 */
function getGoalScorers(players, goalCount) {
  if (goalCount === 0) return []

  const scorers = []
  for (let i = 0; i < goalCount; i++) {
    // Weight forwards higher
    const weights = players.map(p => {
      if (p.position === 'FWD') return 3
      if (p.position === 'MID') return 1.5
      if (p.position === 'DEF') return 0.3
      return 0
    })

    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let rand = Math.random() * totalWeight
    let scorerIdx = 0

    for (let j = 0; j < weights.length; j++) {
      rand -= weights[j]
      if (rand <= 0) {
        scorerIdx = j
        break
      }
    }

    scorers.push(players[scorerIdx].name)
  }

  return scorers
}

/**
 * Create tournament bracket (32 teams, 8 groups)
 */
export function createTournamentBracket(teams) {
  // Shuffle teams into 4 groups of 4 (simplified)
  const shuffled = [...teams].sort(() => Math.random() - 0.5)
  const groups = {
    A: shuffled.slice(0, 4),
    B: shuffled.slice(4, 8),
    C: shuffled.slice(8, 12),
    D: shuffled.slice(12, 16),
    E: shuffled.slice(16, 20),
    F: shuffled.slice(20, 24),
    G: shuffled.slice(24, 28),
    H: shuffled.slice(28, 32),
  }

  return { groups, round: 'groups' }
}

/**
 * Simulate group stage
 */
export function simulateGroupStage(bracket, allTeams) {
  const results = {}

  Object.entries(bracket.groups).forEach(([groupName, teams]) => {
    const standings = teams.map(t => ({
      name: t,
      points: 0,
      gf: 0,
      ga: 0,
      played: 0,
    }))

    // Round-robin: each team plays every other team once
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const match = simulateMatch(
          { country: teams[i], players: allTeams[teams[i]]?.players, formation: allTeams[teams[i]]?.formation },
          { country: teams[j], players: allTeams[teams[j]]?.players, formation: allTeams[teams[j]]?.formation }
        )

        standings[i].played++
        standings[j].played++
        standings[i].gf += match.homeGoals
        standings[i].ga += match.awayGoals
        standings[j].gf += match.awayGoals
        standings[j].ga += match.homeGoals

        if (match.homeWin) {
          standings[i].points += 3
        } else if (match.awayWin) {
          standings[j].points += 3
        } else {
          standings[i].points += 1
          standings[j].points += 1
        }
      }
    }

    // Sort by points, then goal difference
    standings.sort((a, b) => {
      const pointDiff = b.points - a.points
      if (pointDiff !== 0) return pointDiff
      return (b.gf - b.ga) - (a.gf - a.ga)
    })

    results[groupName] = standings
  })

  return results
}

/**
 * Get knockout stage winners from group stage
 */
export function getKnockoutQualifiers(groupResults) {
  const qualifiers = []

  Object.entries(groupResults).forEach(([groupName, standings]) => {
    // Top 2 from each group advance
    qualifiers.push(standings[0].name)
    qualifiers.push(standings[1].name)
  })

  return qualifiers
}

/**
 * Simulate knockout stage (16 → 8 → 4 → 2 → 1)
 */
export function simulateKnockoutStage(qualifiers, allTeams) {
  const matches = []
  let remaining = qualifiers

  while (remaining.length > 1) {
    const roundMatches = []
    for (let i = 0; i < remaining.length; i += 2) {
      const match = simulateMatch(
        { country: remaining[i], players: allTeams[remaining[i]]?.players, formation: allTeams[remaining[i]]?.formation },
        { country: remaining[i + 1], players: allTeams[remaining[i + 1]]?.players, formation: allTeams[remaining[i + 1]]?.formation }
      )
      roundMatches.push(match)
    }

    matches.push(roundMatches)
    remaining = roundMatches.map(m => m.homeWin ? m.homeTeam : m.awayTeam)
  }

  return { matches, champion: remaining[0] }
}
