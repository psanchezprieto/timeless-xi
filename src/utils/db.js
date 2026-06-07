import pako from 'pako'

const cache = {}

export async function loadMeta() {
  if (cache.meta) return cache.meta
  const res = await fetch('/data/meta.json')
  if (!res.ok) throw new Error('Failed to load meta.json')
  cache.meta = await res.json()
  return cache.meta
}

async function loadGzFile(filename) {
  if (cache[filename]) return cache[filename]

  try {
    const res = await fetch(`/data/${filename}`)
    if (!res.ok) throw new Error(`HTTP ${res.status} loading ${filename}`)

    const buffer = await res.arrayBuffer()
    if (buffer.byteLength === 0) {
      console.warn(`Empty file: ${filename}`)
      cache[filename] = { squads: [] }
      return cache[filename]
    }

    const inflated = pako.inflate(new Uint8Array(buffer), { to: 'string' })
    cache[filename] = JSON.parse(inflated)
    return cache[filename]
  } catch (e) {
    console.error(`Error loading ${filename}:`, e.message)
    cache[filename] = { squads: [] }
    return cache[filename]
  }
}

// Returns all players for a country across all World Cup decades.
// Squad data uses abbreviated keys: c=country, cn=countryName, y=year, p=players array
// Player keys: n=name, num=number, pos=position, r=rating (1-10), conf=confidence
export async function getPlayersByCountry(countryName) {
  const meta = await loadMeta()
  const players = []

  console.log(`🔍 Loading players for ${countryName}...`)

  for (const decade of meta.decades) {
    if (decade.playerCount === 0) {
      console.log(`⏭️  Skipping ${decade.name} (no players)`)
      continue
    }

    console.log(`📦 Loading ${decade.filename}...`)
    const data = await loadGzFile(decade.filename)

    if (!data || !data.squads) {
      console.warn(`⚠️  No squads in ${decade.filename}`)
      continue
    }

    console.log(`  Found ${data.squads.length} squads`)

    // Debug: Show first few countries
    const uniqueCountries = [...new Set(data.squads.map(s => s.cn || s.c))]
    console.log(`  Countries in this decade: ${uniqueCountries.slice(0, 5).join(', ')}...`)

    for (const squad of data.squads) {
      const matchesCountry = squad.c === countryName || squad.cn === countryName
      if (matchesCountry) {
        console.log(`  ✓ Found squad for ${squad.cn || squad.c}: ${squad.p?.length || 0} players`)
        for (const p of squad.p || []) {
          players.push({
            name: p.n,
            position: p.pos,
            number: p.num,
            rating: typeof p.r === 'number' ? Math.round(p.r * 10) : 70, // Convert 1-10 scale to 0-100
            year: squad.y,
            country: squad.c || squad.cn,
          })
        }
      }
    }
  }

  console.log(`✅ Total players for ${countryName}: ${players.length}`)
  return players
}

export async function getCoachesByCountry(countryName) {
  if (!cache.coaches) {
    const res = await fetch('/data/coaches.json.gz')
    if (!res.ok) throw new Error('Failed to load coaches')
    const buffer = await res.arrayBuffer()
    const inflated = pako.inflate(new Uint8Array(buffer), { to: 'string' })
    cache.coaches = JSON.parse(inflated)
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
