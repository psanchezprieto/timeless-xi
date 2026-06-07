import React, { useState, useEffect } from 'react'
import { FORMATIONS } from '../constants'
import { getRandomPlayersForPosition } from '../utils/db'
import { C, S, cardHoverIn, cardHoverOut } from '../styles/theme'

function buildSlots(formation) {
  const slots = []
  const def = FORMATIONS[formation]
  if (!def) return slots
  Object.entries(def.positions).forEach(([pos, count]) => {
    for (let i = 0; i < count; i++) slots.push(pos)
  })
  return slots
}

export default function DiceRoller({ country, formation, onComplete }) {
  const slots = buildSlots(formation)
  const [team, setTeam] = useState([])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [rerolls, setRerolls] = useState(3)

  const slotIndex = team.length
  const currentPos = slots[slotIndex]

  const rollDice = async () => {
    setLoading(true)
    const players = await getRandomPlayersForPosition(country, currentPos, 3)
    setCandidates(players)
    setLoading(false)
  }

  useEffect(() => {
    if (slotIndex >= slots.length) return
    rollDice()
    setRerolls(3)
  }, [team.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (player) => {
    const next = [...team, { ...player, position: currentPos }]
    if (next.length === slots.length) {
      onComplete(next)
    } else {
      setTeam(next)
    }
  }

  const handleReroll = async () => {
    if (rerolls <= 0) return
    setRerolls(r => r - 1)
    await rollDice()
  }

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Build Your Squad</h1>
      <p style={{ color: C.cyan, textAlign: 'center', marginBottom: '0.25rem' }}>
        {country} • {formation}
      </p>
      <p style={{ color: C.muted, textAlign: 'center', marginBottom: '2rem' }}>
        Pick your {currentPos} — slot {slotIndex + 1} of {slots.length}
      </p>

      {loading ? (
        <p style={{ color: C.cyan, textAlign: 'center', fontSize: '1.125rem', marginBottom: '2rem' }}>
          🎲 Rolling...
        </p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {candidates.map((player, i) => (
              <button
                key={i}
                onClick={() => pick(player)}
                style={{ ...S.card, cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' }}
                onMouseEnter={cardHoverIn}
                onMouseLeave={cardHoverOut}
              >
                <div style={{ color: C.cyan, fontSize: '0.7rem', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  {currentPos}
                </div>
                <div style={{ color: C.text, fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  {player.name}
                </div>
                <div style={{ color: C.muted, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  {player.year}
                </div>
                <div style={{ color: C.gold, fontWeight: '700', fontSize: '1.5rem' }}>
                  {player.rating}
                </div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button
              onClick={handleReroll}
              disabled={rerolls <= 0 || loading}
              style={{
                background: rerolls > 0 ? C.pink : '#555',
                border: `1px solid ${rerolls > 0 ? C.pink : '#555'}`,
                color: '#fff',
                fontWeight: '600',
                padding: '0.75rem 1.5rem',
                cursor: rerolls > 0 ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase',
                borderRadius: '4px',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (rerolls > 0) {
                  e.target.style.background = C.cyan
                  e.target.style.borderColor = C.cyan
                }
              }}
              onMouseLeave={(e) => {
                if (rerolls > 0) {
                  e.target.style.background = C.pink
                  e.target.style.borderColor = C.pink
                }
              }}
            >
              🎲 Reroll ({rerolls} left)
            </button>
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '0.4rem' }}>
        {slots.map((pos, i) => (
          <div
            key={i}
            style={{
              border: `1px solid ${i === slotIndex ? C.cyan : i < team.length ? C.pink : C.muted}`,
              borderRadius: '4px',
              padding: '0.4rem',
              fontSize: '0.7rem',
              textAlign: 'center',
              color: i === slotIndex ? C.cyan : i < team.length ? C.pink : C.muted,
              backgroundColor: i < team.length ? C.card : 'transparent',
            }}
          >
            <div>{pos}</div>
            {i < team.length && (
              <div style={{ fontSize: '0.6rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {team[i].name.split(' ').pop()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
