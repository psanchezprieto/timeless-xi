import pako from 'pako'

const cache = {}

export async function loadMeta() {
  if (cache.meta) return cache.meta
  const res = await fetch('/data/meta.json')
  if (!res.ok) throw new Error('Failed to load meta.json')
  cache.meta = await res.json()
  return cache.meta
}

// The dev server may serve .gz files with Content-Encoding: gzip, in which case
// the browser auto-decompresses and we receive plain JSON. In production (or when
// served as raw bytes) we need to inflate with pako. Handle both transparently.
function decodeGzBuffer(buffer) {
  const bytes = new Uint8Array(buffer)

  // gzip magic number is 0x1f 0x8b. If absent, it's already plain text.
  const isGzip = bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b

  if (isGzip) {
    const inflated = pako.inflate(bytes)
    return JSON.parse(new TextDecoder().decode(inflated))
  }

  // Already decompressed by the server/browser — parse directly.
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
    console.error(`Error loading ${filename}:`, e.name, e.message, e)
    cache[filename] = { squads: [] }
    return cache[filename]
  }
}

// Map raw data position codes to the game's position groups.
// Data uses GK/DF/MF/FW; the game (formations) uses GK/DEF/MID/FWD.
const POSITION_MAP = { GK: 'GK', DF: 'DEF', MF: 'MID', FW: 'FWD' }

// Returns all players for a country across all World Cup decades.
// Squad data uses abbreviated keys: c=countryCode, cn=countryName, y=year, p=players array
// Player keys: n=name, num=number, pos=position, r=rating (0-100), conf=confidence
export async function getPlayersByCountry(countryName) {
  const meta = await loadMeta()
  const players = []

  for (const decade of meta.decades) {
    if (decade.playerCount === 0) continue

    const data = await loadGzFile(decade.filename)
    if (!data || !data.squads) continue

    for (const squad of data.squads) {
      // Match on full country name (cn) or country code (c)
      if (squad.c === countryName || squad.cn === countryName) {
        for (const p of squad.p || []) {
          players.push({
            name: p.n,
            position: POSITION_MAP[p.pos] || p.pos,
            number: p.num,
            rating: typeof p.r === 'number' ? p.r : 70, // already 0-100
            year: squad.y,
            country: squad.cn || squad.c,
          })
        }
      }
    }
  }

  return players
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

export async function getRandomPlayersForPosition(countryName, position, count = 3) {
  try {
    const players = await getPlayersByCountry(countryName)
    const pool = players.filter(p => p.position === position)

    if (pool.length === 0) {
      console.warn(`No ${position} players found for ${countryName}`)
      // Return mock players if no real ones found
      return Array(count).fill(null).map((_, i) => ({
        name: `Player ${i + 1}`,
        position,
        number: i + 1,
        rating: 70,
        year: 2020,
        country: countryName,
      }))
    }

    const shuffled = pool.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  } catch (e) {
    console.error(`Error loading players for ${countryName}/${position}:`, e)
    // Return fallback mock players
    return Array(count).fill(null).map((_, i) => ({
      name: `Player ${i + 1}`,
      position,
      number: i + 1,
      rating: 70,
      year: 2020,
      country: countryName,
    }))
  }
}

export function clearCache() {
  Object.keys(cache).forEach(k => delete cache[k])
}
