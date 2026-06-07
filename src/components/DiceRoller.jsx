import React, { useState, useEffect, useMemo } from 'react'
import { FORMATIONS } from '../constants'
import { getRandomPlayersForPosition } from '../utils/db'

const POS_LABEL = { GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward' }
const POS_COLOR = { GK: '#e8c547', DEF: '#5eb3c6', MID: '#d97fb6', FWD: '#a8e063' }

export default function DiceRoller({ country, formation, onComplete }) {
  const [team, setTeam] = useState([])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [rerolls, setRerolls] = useState(3)
  const [rolling, setRolling] = useState(false)

  // Ordered list of all 11 position slots
  const slots = useMemo(() => {
    const f = FORMATIONS[formation]
    return Object.entries(f.positions).flatMap(([pos, count]) => Array(count).fill(pos))
  }, [formation])

  const slotIdx = team.length
  const currentPos = slots[slotIdx]

  // Count how many of this position we've already filled
  const posCount = slots.slice(0, slotIdx).filter(p => p === currentPos).length + 1
  const totalForPos = slots.filter(p => p === currentPos).length

  useEffect(() => {
    if (slotIdx < 11) loadCandidates(slots[slotIdx])
  }, [slotIdx])

  const loadCandidates = async (pos) => {
    setLoading(true)
    try {
      const players = await getRandomPlayersForPosition(country, pos, 3)
      setCandidates(players)
    } catch {
      setCandidates([])
    }
    setLoading(false)
  }

  const selectPlayer = (player) => {
    const newTeam = [...team, player]
    setTeam(newTeam)
    setRerolls(3)
    if (newTeam.length === 11) onComplete(newTeam)
  }

  const reroll = async () => {
    if (rerolls <= 0) return
    setRolling(true)
    setRerolls(r => r - 1)
    await loadCandidates(currentPos)
    setRolling(false)
  }

  if (slotIdx >= 11) return null

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <h1 style={{ color: '#d97fb6', fontSize: '2.5rem', fontWeight: '900', textAlign: 'center', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
        Build Your Team
      </h1>
      <p style={{ color: '#5eb3c6', textAlign: 'center', marginBottom: '2rem' }}>
        {country} • {formation} • Player {slotIdx + 1} of 11
      </p>

      {/* Current slot */}
      <div style={{ backgroundColor: '#16213e', border: `1px solid ${POS_COLOR[currentPos]}`, borderRadius: '4px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', textAlign: 'center' }}>
        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: POS_COLOR[currentPos], marginBottom: '0.25rem' }}>
          {POS_LABEL[currentPos]} {totalForPos > 1 ? `${posCount}/${totalForPos}` : ''}
        </div>
        <div style={{ color: '#a0a0a0', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Pick one from your country's World Cup history
        </div>

        {loading || rolling ? (
          <p style={{ color: '#5eb3c6', padding: '2rem' }}>🎲 Rolling...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {candidates.length > 0 ? candidates.map((player, i) => (
              <button
                key={`${player.name}-${player.year}-${i}`}
                onClick={() => selectPlayer(player)}
                style={{ backgroundColor: '#0a0e27', border: `1px solid ${POS_COLOR[currentPos]}`, borderRadius: '4px', padding: '1.25rem 1rem', cursor: 'pointer', transition: 'all 0.15s ease', color: '#e0e0e0', textAlign: 'center' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#16213e'; e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = `0 0 12px ${POS_COLOR[currentPos]}40` }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0a0e27'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.4rem', lineHeight: 1.3 }}>{player.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>{player.year} • #{player.number}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#e8c547' }}>{player.rating}</div>
              </button>
            )) : (
              <div style={{ gridColumn: '1/-1', color: '#a0a0a0', padding: '1rem' }}>No {POS_LABEL[currentPos]}s found for {country}. Try rerolling.</div>
            )}
          </div>
        )}

        <button
          onClick={reroll}
          disabled={rerolls <= 0 || loading || rolling}
          style={{ background: rerolls > 0 ? 'transparent' : '#333', border: `1px solid ${rerolls > 0 ? '#d97fb6' : '#555'}`, color: rerolls > 0 ? '#d97fb6' : '#555', fontWeight: '600', padding: '0.6rem 1.25rem', cursor: rerolls > 0 ? 'pointer' : 'not-allowed', textTransform: 'uppercase', borderRadius: '4px', fontSize: '0.85rem' }}
        >
          🎲 Reroll ({rerolls} left)
        </button>
      </div>

      {/* Team so far */}
      {team.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem' }}>
          {team.map((p, i) => (
            <div key={i} style={{ backgroundColor: '#16213e', border: `1px solid ${POS_COLOR[p.position]}40`, borderRadius: '4px', padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: POS_COLOR[p.position], fontWeight: '700', marginBottom: '0.2rem' }}>{p.position}</div>
              <div style={{ fontSize: '0.65rem', color: '#c0c0c0', lineHeight: 1.2, marginBottom: '0.2rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#e8c547', fontWeight: '700' }}>{p.rating}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
