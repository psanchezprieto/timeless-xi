import pako from 'pako'

let squadCache = {}
let coachCache = null
let metaCache = null

/**
 * Load meta.json - registry of all data files
 */
export async function loadMeta() {
  if (metaCache) return metaCache

  try {
    const res = await fetch('/data/meta.json')
    metaCache = await res.json()
    return metaCache
  } catch (e) {
    console.error('Error loading meta.json:', e)
    throw new Error('Failed to load tournament data')
  }
}

/**
 * Load gzipped squad file for a specific decade
 */
export async function loadSquadsByDecade(decade) {
  if (squadCache[decade]) return squadCache[decade]

  try {
    const res = await fetch(`/data/squads-${decade}.json.gz`)
    const buffer = await res.arrayBuffer()
    const decompressed = pako.inflate(buffer, { to: 'string' })
    const data = JSON.parse(decompressed)
    squadCache[decade] = data
    return data
  } catch (e) {
    console.error(`Error loading squads for ${decade}:`, e)
    return null
  }
}

/**
 * Load all coaches
 */
export async function loadCoaches() {
  if (coachCache) return coachCache

  try {
    const res = await fetch('/data/coaches.json.gz')
    const buffer = await res.arrayBuffer()
    const decompressed = pako.inflate(buffer, { to: 'string' })
    coachCache = JSON.parse(decompressed)
    return coachCache
  } catch (e) {
    console.error('Error loading coaches:', e)
    return {}
  }
}

/**
 * Get all players from a specific country
 */
export async function getPlayersByCountry(countryName) {
  const meta = await loadMeta()
  const players = []

  // Load data from all decades that have this country
  for (const decade of meta.decades) {
    const data = await loadSquadsByDecade(decade.range)
    if (data && data.squads) {
      // Find squads for this country
      const countrySquads = data.squads.filter(s => {
        // Denormalize: look up country code in meta
        const countryData = meta.countries.find(c => c.c === s.c)
        return countryData && countryData.n === countryName
      })

      // Extract players
      countrySquads.forEach(squad => {
        if (squad.p) {
          squad.p.forEach(player => {
            players.push({
              name: player.n,
              position: player.pos,
              number: player.num,
              rating: player.r,
              confidence: player.conf,
              year: squad.y,
              country: countryName,
            })
          })
        }
      })
    }
  }

  return players
}

/**
 * Get coaches for a specific country
 */
export async function getCoachesByCountry(countryName) {
  const coaches = await loadCoaches()
  return coaches[countryName] || []
}

/**
 * Get random players for a position
 */
export async function getRandomPlayersForPosition(countryName, position, count = 3) {
  const players = await getPlayersByCountry(countryName)
  const positionPlayers = players.filter(p => p.position === position)

  // Shuffle and take first N
  const shuffled = positionPlayers.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Get all countries available in the database
 */
export async function getAvailableCountries() {
  const meta = await loadMeta()
  if (meta.countries) {
    return meta.countries.map(c => c.n).sort()
  }
  return []
}

/**
 * Clear cache (for testing)
 */
export function clearCache() {
  squadCache = {}
  coachCache = null
  metaCache = null
}
