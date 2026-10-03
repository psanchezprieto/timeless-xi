import fs from 'node:fs/promises'
import path from 'node:path'
import { execSync } from 'node:child_process'
import dotenv from 'dotenv'

dotenv.config()

const FORMATIONS = {
  '4-4-2': ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST', 'ST'],
  '4-3-3': ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'AM', 'RW', 'ST', 'LW'],
  '3-5-2': ['GK', 'CB', 'CB', 'CB', 'RWB', 'CM', 'CM', 'CM', 'LWB', 'ST', 'ST'],
  '5-3-2': ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'ST', 'ST'],
  '4-2-4': ['GK', 'RB', 'CB', 'CB', 'LB', 'DM', 'DM', 'RW', 'ST', 'ST', 'LW'],
}

const DEFAULT_OUTPUT = 'public/data/community-stats.json'

function resolveProjectStartDate() {
  try {
    const output = execSync(
      "git --no-pager log --reverse --date=iso-strict --format=%cd | head -n 1",
      { stdio: ['ignore', 'pipe', 'pipe'] }
    ).toString().trim()

    if (!output) return null
    const date = new Date(output)
    if (Number.isNaN(date.getTime())) return null
    return date.toISOString()
  } catch {
    return null
  }
}

const PROJECT_START_DATE = process.env.POSTHOG_START_DATE || resolveProjectStartDate() || '2026-06-07T16:17:16Z'
const LOOKBACK_DAYS = Number(process.env.POSTHOG_LOOKBACK_DAYS || 0)
const START_DATE = LOOKBACK_DAYS > 0
  ? new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()
  : PROJECT_START_DATE
const API_HOST = process.env.POSTHOG_API_HOST || 'https://eu.i.posthog.com'
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID
const PERSONAL_KEY = process.env.POSTHOG_PERSONAL_KEY
const OUTPUT_PATH = process.env.COMMUNITY_STATS_OUTPUT_PATH || DEFAULT_OUTPUT

function toTitleCase(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeCountry(value) {
  const country = toTitleCase(value)
  if (!country) return 'Unknown'
  return country
}

function normalizePlayerName(value) {
  return toTitleCase(value || 'Unknown player')
}

function normalizePosition(value) {
  const raw = String(value || '').toUpperCase().replace(/\s+/g, '')
  if (!raw) return 'MID'
  if (raw.includes('GK')) return 'GK'
  if (raw.includes('LB') || raw.includes('RB') || raw.includes('WB')) return raw.includes('L') ? 'LB' : 'RB'
  if (raw.includes('CB')) return 'CB'
  if (raw.includes('CM') || raw.includes('DM') || raw.includes('AM') || raw.includes('CAM')) return raw.includes('DM') ? 'DM' : raw.includes('AM') ? 'AM' : 'CM'
  if (raw.includes('RW') || raw.includes('LW')) return raw.includes('RW') ? 'RW' : 'LW'
  if (raw.includes('ST')) return 'ST'
  if (raw.includes('CF')) return 'ST'
  return 'MID'
}

function normalizeFormation(value) {
  const next = String(value || '').trim()
  return FORMATIONS[next] ? next : Object.keys(FORMATIONS).find(key => key.replace(/-/g, '') === next.replace(/-/g, '')) || null
}

function normalizeQueryRows(payload) {
  if (Array.isArray(payload)) return payload
  if (!Array.isArray(payload?.results) || !Array.isArray(payload?.columns)) return []

  return payload.results.map((row) => {
    const record = {}
    payload.columns.forEach((column, index) => {
      record[column] = row[index]
    })
    return record
  })
}

function getResults(payload) {
  const rows = normalizeQueryRows(payload)
  if (!rows.length) return []

  return rows.map((row) => ({
    event: row.event,
    properties: Object.fromEntries(
      Object.entries(row).filter(([key]) => key !== 'event')
    ),
  }))
}

function getValue(record, ...keys) {
  if (!record || typeof record !== 'object') return undefined

  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key]
  }

  for (const key of keys) {
    const nested = record.properties && record.properties[key]
    if (nested !== undefined && nested !== null) return nested
  }

  return undefined
}

function toEventProps(event) {
  if (!event || typeof event !== 'object') return {}
  const nested = event.properties && typeof event.properties === 'object' ? event.properties : {}
  return { ...nested, ...event }
}

async function fetchEvents() {
  if (!PROJECT_ID || !PERSONAL_KEY) {
    return []
  }

  const after = START_DATE
  const before = new Date().toISOString()

  const query = `
    SELECT
      event,
      properties.country AS country,
      properties.country_name AS country_name,
      properties.formation AS formation,
      properties.player_name AS player_name,
      properties.player_position AS player_position,
      properties.campaign_id AS campaign_id,
      properties.coach_name AS coach_name,
      properties.coach_morale_boost AS coach_morale_boost,
      properties.outcome AS outcome,
      properties.exit_stage AS exit_stage,
      properties.auto_play AS auto_play
    FROM events
    WHERE timestamp >= toDateTime('${after}')
      AND timestamp <= toDateTime('${before}')
      AND event IN ('campaign_started', 'formation_selected', 'player_picked', 'coach_selected', 'campaign_completed')
    LIMIT 20000
  `

  const url = `${API_HOST}/api/projects/${PROJECT_ID}/query`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PERSONAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query,
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`PostHog query API request failed (${response.status}): ${text.slice(0, 250)}`)
  }

  const payload = await response.json()
  return getResults(payload)
}

function buildTopNations(events) {
  const counts = new Map()

  for (const event of events) {
    const props = toEventProps(event)
    const eventName = getValue(props, 'event')
    if (eventName !== 'campaign_started') continue

    const country = normalizeCountry(getValue(props, 'country', 'country_name'))
    if (!country || country === 'Unknown') continue

    counts.set(country, (counts.get(country) || 0) + 1)
  }

  return [...counts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item, index) => ({ rank: index + 1, ...item }))
}

function buildTopFormationsPicked(events) {
  const counts = new Map()

  for (const event of events) {
    const props = toEventProps(event)
    const eventName = getValue(props, 'event')
    if (eventName !== 'formation_selected') continue

    const formation = normalizeFormation(getValue(props, 'formation'))
    if (!formation) continue

    counts.set(formation, (counts.get(formation) || 0) + 1)
  }

  return [...counts.entries()]
    .map(([formation, count]) => ({ formation, count }))
    .sort((a, b) => b.count - a.count || a.formation.localeCompare(b.formation))
    .slice(0, 5)
    .map((item, index) => ({ rank: index + 1, ...item }))
}

function buildTopPlayersOverall(events) {
  const counts = new Map()
  const countryByCampaign = new Map()

  for (const event of events) {
    const props = toEventProps(event)
    const eventName = getValue(props, 'event')
    const campaignId = getValue(props, 'campaign_id')

    if (eventName === 'campaign_started' && campaignId) {
      const country = normalizeCountry(getValue(props, 'country', 'country_name'))
      if (country && country !== 'Unknown') countryByCampaign.set(campaignId, country)
    }
  }

  for (const event of events) {
    const props = toEventProps(event)
    if (getValue(props, 'event') !== 'player_picked') continue

    const name = normalizePlayerName(getValue(props, 'player_name'))
    const position = normalizePosition(getValue(props, 'player_position'))
    const campaignId = getValue(props, 'campaign_id')
    const country = normalizeCountry(countryByCampaign.get(campaignId) || getValue(props, 'country', 'country_name'))

    if (!name || name === 'Unknown player') continue

    const current = counts.get(name) || { name, count: 0, country: country !== 'Unknown' ? country : 'Unknown', positions: new Set() }
    current.count += 1
    current.positions.add(position)
    if (country && country !== 'Unknown') current.country = country
    counts.set(name, current)
  }

  return [...counts.values()]
    .map(player => ({
      name: player.name,
      count: player.count,
      country: player.country || 'Unknown',
      positions: [...player.positions].sort(),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 11)
}

function buildTopCoaches(events) {
  const counts = new Map()
  const countryByCampaign = new Map()

  for (const event of events) {
    const props = toEventProps(event)
    const eventName = getValue(props, 'event')
    const campaignId = getValue(props, 'campaign_id')

    if (eventName === 'campaign_started' && campaignId) {
      const country = normalizeCountry(getValue(props, 'country', 'country_name'))
      if (country && country !== 'Unknown') countryByCampaign.set(campaignId, country)
    }
  }

  for (const event of events) {
    const props = toEventProps(event)
    const eventName = getValue(props, 'event')
    const coachName = normalizePlayerName(getValue(props, 'coach_name'))
    const campaignId = getValue(props, 'campaign_id')
    const country = normalizeCountry(countryByCampaign.get(campaignId) || getValue(props, 'country', 'country_name'))

    if ((eventName === 'coach_selected' || eventName === 'campaign_completed') && coachName && coachName !== 'Unknown player') {
      const current = counts.get(coachName) || { coach: coachName, count: 0, country: country !== 'Unknown' ? country : 'Unknown' }
      current.count += 1
      if (country && country !== 'Unknown') current.country = country
      counts.set(coachName, current)
    }
  }

  return [...counts.values()]
    .map(item => ({ coach: item.coach, count: item.count, country: item.country || 'Unknown' }))
    .sort((a, b) => b.count - a.count || a.coach.localeCompare(b.coach))
    .slice(0, 5)
}

function buildCampaignSummary(events) {
  let totalStarts = 0
  let totalWins = 0
  const countryWins = new Map()
  const formationWins = new Map()

  for (const event of events) {
    const props = toEventProps(event)
    const eventName = getValue(props, 'event')

    if (eventName === 'campaign_started') {
      totalStarts += 1
    }

    if (eventName === 'campaign_completed') {
      const outcome = String(getValue(props, 'outcome') || '').toLowerCase()
      if (outcome !== 'winner') continue

      totalWins += 1

      const country = normalizeCountry(getValue(props, 'country', 'country_name'))
      if (country && country !== 'Unknown') {
        countryWins.set(country, (countryWins.get(country) || 0) + 1)
      }

      const formation = normalizeFormation(getValue(props, 'formation'))
      if (formation) {
        formationWins.set(formation, (formationWins.get(formation) || 0) + 1)
      }
    }
  }

  const topWinningTeam = [...countryWins.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country))[0] || null

  const topWinningFormation = [...formationWins.entries()]
    .map(([formation, count]) => ({ formation, count }))
    .sort((a, b) => b.count - a.count || a.formation.localeCompare(b.formation))[0] || null

  return {
    totalStarts,
    totalWins,
    winRate: totalStarts ? Number(((totalWins / totalStarts) * 100).toFixed(1)) : 0,
    topWinningTeam,
    topWinningFormation,
    topCoaches: buildTopCoaches(events),
  }
}

function buildTopFormations(events) {
  const countryByCampaign = new Map()
  const formationByCampaign = new Map()
  const votesByFormation = new Map()

  for (const event of events) {
    const props = toEventProps(event)
    const eventName = getValue(props, 'event')
    const campaignId = getValue(props, 'campaign_id')
    if (!campaignId) continue

    if (eventName === 'campaign_started') {
      const country = normalizeCountry(getValue(props, 'country', 'country_name'))
      if (country && country !== 'Unknown') countryByCampaign.set(campaignId, country)
    }

    if (eventName === 'formation_selected' || eventName === 'campaign_completed') {
      const formation = normalizeFormation(getValue(props, 'formation'))
      if (formation) formationByCampaign.set(campaignId, formation)
    }
  }

  for (const event of events) {
    const props = toEventProps(event)
    if (getValue(props, 'event') !== 'player_picked') continue

    const campaignId = getValue(props, 'campaign_id')
    const formation = normalizeFormation(getValue(props, 'formation') || formationByCampaign.get(campaignId))
    if (!formation) continue

    const slot = normalizePosition(getValue(props, 'player_position'))
    const name = normalizePlayerName(getValue(props, 'player_name'))
    const country = countryByCampaign.get(campaignId) || 'Unknown'

    if (!votesByFormation.has(formation)) {
      votesByFormation.set(formation, new Map())
    }

    const formationBucket = votesByFormation.get(formation)
    if (!formationBucket.has(slot)) {
      formationBucket.set(slot, new Map())
    }

    const slotBucket = formationBucket.get(slot)
    const current = slotBucket.get(name) || { count: 0, country, positions: new Set() }
    current.count += 1
    current.positions.add(slot)
    if (country && country !== 'Unknown') current.country = country
    slotBucket.set(name, current)
  }

  return [...votesByFormation.entries()]
    .map(([formation, slotMap]) => {
      const usedPlayers = new Set()
      const aggregatePlayerMap = new Map()
      const team = FORMATIONS[formation]
        .map(slot => {
          const entries = [...(slotMap.get(slot) || new Map()).entries()]
            .filter(([name]) => !usedPlayers.has(name))
            .map(([name, data]) => ({
              name,
              count: data.count,
              country: data.country || 'Unknown',
              positions: [...data.positions] || [slot],
            }))

          const best = entries.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))[0]
          if (!best) return null

          usedPlayers.add(best.name)

          const aggregate = aggregatePlayerMap.get(best.name) || { name: best.name, count: 0, country: best.country, positions: new Set() }
          aggregate.count += best.count
          aggregate.positions.add(slot)
          if (best.country && best.country !== 'Unknown') aggregate.country = best.country
          aggregatePlayerMap.set(best.name, aggregate)

          return {
            position: slot,
            ...best,
          }
        })
        .filter(Boolean)

      for (const [slot, bucket] of slotMap.entries()) {
        for (const [name, data] of bucket.entries()) {
          if (usedPlayers.has(name)) continue
          const aggregate = aggregatePlayerMap.get(name) || { name, count: 0, country: data.country || 'Unknown', positions: new Set() }
          aggregate.count += data.count
          for (const position of data.positions || [slot]) aggregate.positions.add(position)
          if (data.country && data.country !== 'Unknown') aggregate.country = data.country
          aggregatePlayerMap.set(name, aggregate)
        }
      }

      const topPlayers = [...aggregatePlayerMap.values()]
        .map(player => ({
          name: player.name,
          count: player.count,
          country: player.country || 'Unknown',
          positions: [...player.positions].sort(),
        }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .slice(0, 5)

      const usedTeamNames = new Set(team.map(player => player.name))
      for (const player of topPlayers) {
        if (usedTeamNames.has(player.name)) continue
        if (team.length >= 11) break

        const fallbackPosition = player.positions[0] || FORMATIONS[formation][team.length] || 'MID'
        team.push({
          name: player.name,
          position: fallbackPosition,
          count: player.count,
          country: player.country || 'Unknown',
          positions: player.positions,
        })
        usedTeamNames.add(player.name)
      }

      return {
        formation,
        totalVotes: team.reduce((sum, player) => sum + player.count, 0),
        team: team.slice(0, 11),
        topPlayers,
      }
    })
    .sort((a, b) => b.totalVotes - a.totalVotes || a.formation.localeCompare(b.formation))
    .slice(0, 3)
}

function buildEmptyPayload() {
  return {
    updatedAt: new Date().toISOString(),
    periodDays: LOOKBACK_DAYS || null,
    sinceDate: START_DATE,
    totalStarts: 0,
    totalWins: 0,
    winRate: 0,
    topCountriesPlaying: [],
    topNations: [],
    topFormations: [],
    topFormationsPicked: [],
    topPlayersOverall: [],
    topWinningTeam: null,
    topWinningFormation: null,
    topCoaches: [],
    message: 'No PostHog events available yet. The scheduled job will populate this file daily.',
  }
}

async function main() {
  const events = await fetchEvents()

  const topNations = buildTopNations(events)
  const summary = buildCampaignSummary(events)
  const topFormationsPicked = buildTopFormationsPicked(events)
  const topPlayersOverall = buildTopPlayersOverall(events)

  const output = {
    updatedAt: new Date().toISOString(),
    periodDays: LOOKBACK_DAYS || null,
    sinceDate: START_DATE,
    totalStarts: summary.totalStarts,
    totalWins: summary.totalWins,
    winRate: summary.winRate,
    topCountriesPlaying: topNations,
    topNations,
    topFormations: buildTopFormations(events),
    topFormationsPicked,
    topPlayersOverall,
    topWinningTeam: summary.topWinningTeam,
    topWinningFormation: summary.topWinningFormation,
    topCoaches: summary.topCoaches,
  }

  if (!output.topNations.length && !output.topFormations.length && !output.topFormationsPicked.length && !output.totalStarts) {
    const empty = buildEmptyPayload()
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
    await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(empty, null, 2)}\n`)
    console.log(`Community stats file written with placeholder data: ${OUTPUT_PATH}`)
    return
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`)
  console.log(`Community stats generated: ${output.topNations.length} nations, ${output.topFormations.length} formations`)
}

try {
  await main()
} catch (error) {
  const fallback = buildEmptyPayload()
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify({ ...fallback, error: error.message }, null, 2)}\n`)
  console.error(error.message)
  process.exitCode = 1
}
