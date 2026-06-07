import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const flagsDir = path.join(__dirname, '../public/flags')

// Country codes to download
const COUNTRIES = [
  'dz', 'ao', 'ar', 'au', 'at', 'be', 'bo', 'ba', 'br', 'bg',
  'cm', 'ca', 'cl', 'cn', 'co', 'cr', 'hr', 'cz', 'dk', 'ec',
  'eg', 'sv', 'gb-eng', 'fr', 'de', 'gh', 'gr', 'ht', 'hn', 'hu',
  'is', 'ir', 'iq', 'il', 'it', 'ci', 'jm', 'jp', 'jo', 'kw',
  'mx', 'ma', 'nl', 'nz', 'ng', 'kp', 'gb-nir', 'no', 'pa', 'py',
  'pe', 'pl', 'pt', 'qa', 'ie', 'ro', 'ru', 'sa', 'gb-sct', 'sn',
  'rs', 'sk', 'si', 'za', 'kr', 'es', 'se', 'ch', 'tg', 'tt',
  'tn', 'tr', 'ua', 'ae', 'us', 'uy', 'uz', 'gb-wls'
]

// Create flags directory
if (!fs.existsSync(flagsDir)) {
  fs.mkdirSync(flagsDir, { recursive: true })
  console.log(`✓ Created ${flagsDir}`)
}

// Download flags in parallel (max 5 at a time)
const downloadFlag = async (code) => {
  const url = `https://flagcdn.com/w160/${code}.png`
  const filepath = path.join(flagsDir, `${code}.png`)

  try {
    if (fs.existsSync(filepath)) {
      return { code, status: 'exists' }
    }

    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 })
    fs.writeFileSync(filepath, response.data)
    return { code, status: 'downloaded' }
  } catch (err) {
    return { code, status: 'failed', error: err.message }
  }
}

const pLimit = (limit) => {
  let running = 0
  const queue = []

  return async (fn) => {
    while (running >= limit) {
      await new Promise(resolve => queue.push(resolve))
    }
    running++
    try {
      return await fn()
    } finally {
      running--
      const resolve = queue.shift()
      if (resolve) resolve()
    }
  }
}

(async () => {
  console.log(`Fetching ${COUNTRIES.length} flags from flagcdn.com...`)
  const limiter = pLimit(5)
  const results = await Promise.all(
    COUNTRIES.map(code => limiter(() => downloadFlag(code)))
  )

  const summary = {
    downloaded: results.filter(r => r.status === 'downloaded').length,
    existing: results.filter(r => r.status === 'exists').length,
    failed: results.filter(r => r.status === 'failed').length,
  }

  console.log(`\n✓ Fetch complete:`)
  console.log(`  Downloaded: ${summary.downloaded}`)
  console.log(`  Already existed: ${summary.existing}`)
  console.log(`  Failed: ${summary.failed}`)

  if (summary.failed > 0) {
    console.log(`\nFailed flags:`)
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`  ${r.code}: ${r.error}`)
    })
  }
})()
