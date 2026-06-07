import pako from 'pako'

const cache = {}

export async function loadMeta() {
  if (cache.meta) return cache.meta
  const res = await fetch('/data/meta.json')
  if (!res.ok) throw new Error('Failed to load meta.json')
  cache.meta = await res.json()
  return cache.meta
}

function decodeGzBuffer(buffer) {
  const bytes = new Uint8Array(buffer)
  const isGzip = bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b
  if (isGzip) {
    const inflated = pako.inflate(bytes)
    return JSON.parse(new TextDecoder().decode(inflated))
  }
  return JSON.parse(new TextDecoder().decode(bytes))
}

async function loadGzFile(filename) {
  if (cache[filename]) return cache[filename]
  try {
    const res = await fetch(`/data/${filename}`)
    if (!res.ok) throw new Error(`HTTP ${res.status} loading ${filename}`)
    const buffer = await res.arrayBuffer()
    if (buffer.byteLength === 0) {
      cache[filename] = { squads: [] }
      return cache[filename]
    }
    cache[filename] = decodeGzBuffer(buffer)
    return cache[filename]
  } catch (e) {
    console.error(`Error loading ${filename}:`, e.name, e.message)
    cache[filename] = { squads: [] }
    return cache[filename]
  }
}

const POSITION_MAP = { GK: 'GK', DF: 'DEF', MF: 'MID', FW: 'FWD' }

// Returns all players for a country across all World Cup decades.
export async function getPlayersByCountry(countryName) {
  const meta = await loadMeta()
  const players = []
  for (const decade of meta.decades) {
    if (decade.playerCount === 0) continue
    const data = await loadGzFile(decade.filename)
    if (!data?.squads) continue
    for (const squad of data.squads) {
      if (squad.c === countryName || squad.cn === countryName) {
        for (const p of squad.p || []) {
          players.push({
            name: p.n,
            position: POSITION_MAP[p.pos] || p.pos,
            number: p.num,
            rating: typeof p.r === 'number' ? p.r : 70,
            year: squad.y,
            country: squad.cn || squad.c,
          })
        }
      }
    }
  }
  return players
}

// Returns sorted list of World Cup years a country has data for.
export async function getAvailableYearsForCountry(countryName) {
  const players = await getPlayersByCountry(countryName)
  const years = [...new Set(players.map(p => p.year))].sort((a, b) => a - b)
  return years
}

// Returns all historical squad objects with pre-computed avgRating.
// Used to populate AI opponents with real historical teams.
export async function getAllHistoricalTeamStats() {
  if (cache.__allTeamStats) return cache.__allTeamStats
  const meta = await loadMeta()
  const teams = []
  for (const decade of meta.decades) {
    if (decade.playerCount === 0) continue
    const data = await loadGzFile(decade.filename)
    if (!data?.squads) continue
    for (const squad of data.squads) {
      const players = squad.p || []
      if (players.length === 0) continue
      const avgRating = players.reduce((s, p) => s + (typeof p.r === 'number' ? p.r : 70), 0) / players.length
      teams.push({
        country: squad.cn || squad.c,
        year: squad.y,
        avgRating: Math.round(avgRating * 10) / 10,
        isUser: false,
      })
    }
  }
  cache.__allTeamStats = teams
  return teams
}

export async function getCoachesByCountry(countryName) {
  if (!cache.coaches) {
    try {
      const res = await fetch('/data/coaches.json.gz')
      if (!res.ok) throw new Error('Failed to load coaches')
      const buffer = await res.arrayBuffer()
      cache.coaches = decodeGzBuffer(buffer)
    } catch (e) {
      console.error('Error loading coaches:', e.message)
      cache.coaches = {}
    }
  }
  return cache.coaches[countryName] || []
}

// Players for a position + specific year. Falls back to any year if none found.
export async function getRandomPlayersForPositionAndYear(countryName, position, year, count = 3) {
  try {
    const players = await getPlayersByCountry(countryName)
    const yearPool = players.filter(p => p.position === position && p.year === year)
    const pool = yearPool.length ? yearPool : players.filter(p => p.position === position)

    if (pool.length === 0) {
      return Array.from({ length: count }, (_, i) => ({
        name: `Player ${i + 1}`, position, number: i + 1,
        rating: 70, year, country: countryName,
      }))
    }
    return pool.sort(() => Math.random() - 0.5).slice(0, count)
  } catch (e) {
    console.error(`Error loading players for ${countryName}/${position}/${year}:`, e)
    return Array.from({ length: count }, (_, i) => ({
      name: `Player ${i + 1}`, position, number: i + 1,
      rating: 70, year, country: countryName,
    }))
  }
}

// Legacy — still used by CoachPicker
export async function getRandomPlayersForPosition(countryName, position, count = 3) {
  return getRandomPlayersForPositionAndYear(countryName, position, null, count)
}

export function clearCache() {
  Object.keys(cache).forEach(k => delete cache[k])
}
