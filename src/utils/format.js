import { POSITIONS } from '../constants'

export function formatMatchResult(homeGoals, awayGoals) {
  const score = `${homeGoals} - ${awayGoals}`
  return homeGoals === awayGoals ? `${score} (Draw)` : score
}

export function formatTeamName(countryName) {
  const flagMap = {
    Argentina: '🇦🇷', Australia: '🇦🇺', Austria: '🇦🇹', Belgium: '🇧🇪',
    Brazil: '🇧🇷', Croatia: '🇭🇷', France: '🇫🇷', Germany: '🇩🇪',
    Italy: '🇮🇹', Japan: '🇯🇵', Mexico: '🇲🇽', Netherlands: '🇳🇱',
    Portugal: '🇵🇹', Spain: '🇪🇸', 'United States': '🇺🇸',
  }
  return `${flagMap[countryName] || '⚽'} ${countryName}`
}

export function formatRating(rating) {
  if (rating >= 85) return `⭐ ${rating}`
  if (rating >= 75) return `✓ ${rating}`
  if (rating >= 60) return rating
  return `⚠ ${rating}`
}

export function formatPosition(pos) {
  return POSITIONS[pos]?.name || pos
}

export function getFormationEmoji(formation) {
  const emojis = { '4-4-2': '🔒', '4-3-3': '⚖️', '3-5-2': '🔥', '5-3-2': '🛡️' }
  return emojis[formation] || '⚽'
}

export function formatRound(round) {
  const names = {
    groups: 'Group Stage',
    r16: 'Round of 16',
    qf: 'Quarterfinals',
    sf: 'Semifinals',
    final: 'Final',
  }
  return names[round] || round
}

export function getMatchMessage(match, isPlayerTeam) {
  const playerGoals = isPlayerTeam ? match.homeGoals : match.awayGoals
  const opponentGoals = isPlayerTeam ? match.awayGoals : match.homeGoals
  if (playerGoals > opponentGoals) return `✓ Victory ${playerGoals}-${opponentGoals}`
  if (playerGoals === opponentGoals) return `= Draw ${playerGoals}-${opponentGoals}`
  return `✗ Defeat ${playerGoals}-${opponentGoals}`
}
