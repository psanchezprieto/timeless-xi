/**
 * Format match result (e.g., "2-1" or "Draw")
 */
export function formatMatchResult(homeGoals, awayGoals) {
  if (homeGoals === awayGoals) return `${homeGoals} - Draw`
  return `${homeGoals} - ${awayGoals}`
}

/**
 * Format team name with emoji
 */
export function formatTeamName(countryName) {
  const flagMap = {
    Argentina: '🇦🇷',
    Australia: '🇦🇺',
    Austria: '🇦🇹',
    Belgium: '🇧🇪',
    Brazil: '🇧🇷',
    Croatia: '🇭🇷',
    France: '🇫🇷',
    Germany: '🇩🇪',
    Italy: '🇮🇹',
    Japan: '🇯🇵',
    Mexico: '🇲🇽',
    Netherlands: '🇳🇱',
    Portugal: '🇵🇹',
    Spain: '🇪🇸',
    'United States': '🇺🇸',
  }

  const flag = flagMap[countryName] || '⚽'
  return `${flag} ${countryName}`
}

/**
 * Format player rating with color indicator
 */
export function formatRating(rating) {
  if (rating >= 85) return `⭐ ${rating}`
  if (rating >= 75) return `✓ ${rating}`
  if (rating >= 60) return rating
  return `⚠ ${rating}`
}

/**
 * Format position abbreviation
 */
export function formatPosition(pos) {
  const labels = {
    GK: 'Goalkeeper',
    DEF: 'Defender',
    MID: 'Midfielder',
    FWD: 'Forward',
  }
  return labels[pos] || pos
}

/**
 * Get formation emoji
 */
export function getFormationEmoji(formation) {
  const emojis = {
    '4-4-2': '🔒',
    '4-3-3': '⚖️',
    '3-5-2': '🔥',
    '5-3-2': '🛡️',
  }
  return emojis[formation] || '⚽'
}

/**
 * Format tournament round name
 */
export function formatRound(round) {
  const names = {
    'groups': 'Group Stage',
    'r16': 'Round of 16',
    'qf': 'Quarterfinals',
    'sf': 'Semifinals',
    'final': 'Final',
  }
  return names[round] || round
}

/**
 * Format victory/loss message
 */
export function getMatchMessage(match, isPlayerTeam) {
  const playerGoals = isPlayerTeam ? match.homeGoals : match.awayGoals
  const opponentGoals = isPlayerTeam ? match.awayGoals : match.homeGoals

  if (playerGoals > opponentGoals) {
    return `✓ Victory ${playerGoals}-${opponentGoals}`
  } else if (playerGoals === opponentGoals) {
    return `= Draw ${playerGoals}-${opponentGoals}`
  } else {
    return `✗ Defeat ${playerGoals}-${opponentGoals}`
  }
}
