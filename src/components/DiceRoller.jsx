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

const POS_COLORS = { GK: C.gold, DEF: C.cyan, MID: C.accent, FWD: '#EF4444' }

export default function DiceRoller({ country, formation, team: initialTeam, rerolls, onReroll, onComplete, onNewGame }) {
  const slots = buildSlots(formation)
  const [team, setTeam] = useState(initialTeam || [])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

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
  }, [slotIndex]) // eslint-disable-line react-hooks/exhaustive-deps

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
    onReroll()
    await rollDice()
  }

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
      {onNewGame && (
        <button
          onClick={onNewGame}
          style={{ ...S.btnGhost, marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.text }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub }}
        >
          ← Start over
        </button>
      )}
      <h1 style={S.h1}>Build Your Squad</h1>
      <p style={{ color: C.textSub, textAlign: 'center', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
        {country} <span style={{ color: C.textDim }}>·</span> {formation}
      </p>
      <p style={{ color: C.textDim, textAlign: 'center', marginBottom: '2rem', fontSize: '0.82rem' }}>
        Slot {Math.min(slotIndex + 1, slots.length)} of {slots.length}
        {currentPos && (
          <> — pick your{' '}
            <strong style={{ color: POS_COLORS[currentPos] || C.text }}>
              {currentPos === 'GK' ? 'goalkeeper' : currentPos === 'DEF' ? 'defender' : currentPos === 'MID' ? 'midfielder' : 'forward'}
            </strong>
          </>
        )}
      </p>

      {/* Slot tracker */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
        {slots.map((pos, i) => (
          <div key={i} style={{
            width: '2.25rem', height: '2.25rem',
            borderRadius: '6px',
            border: `1px solid ${i === slotIndex ? (POS_COLORS[pos] || C.accent) : i < team.length ? C.borderLight : C.border}`,
            backgroundColor: i < team.length ? C.surfaceHi : 'transparent',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '0.52rem', fontWeight: '700',
            color: i === slotIndex ? (POS_COLORS[pos] || C.accent) : i < team.length ? C.accent : C.textDim,
          }}>
            <span>{pos}</span>
            {i < team.length && <span style={{ fontSize: '0.48rem', marginTop: '1px' }}>✓</span>}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: C.textDim, fontSize: '0.875rem' }}>Rolling…</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            {candidates.map((player, i) => (
              <button
                key={i}
                onClick={() => pick(player)}
                style={{ ...S.card, cursor: 'pointer', textAlign: 'center', padding: '1.5rem 1rem' }}
                onMouseEnter={cardHoverIn}
                onMouseLeave={cardHoverOut}
              >
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.62rem', fontWeight: '700',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: POS_COLORS[currentPos] || C.accent,
                  backgroundColor: `${POS_COLORS[currentPos] || C.accent}18`,
                  padding: '0.18rem 0.55rem', borderRadius: '99px',
                  marginBottom: '0.85rem',
                }}>
                  {currentPos}
                </span>

                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1rem', fontWeight: '700',
                  color: C.text, marginBottom: '0.2rem', lineHeight: 1.25,
                }}>
                  {player.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: C.textDim, marginBottom: '1rem' }}>
                  {player.year}
                </div>

                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '2.2rem', fontWeight: '800', color: C.gold,
                  letterSpacing: '-0.02em',
                }}>
                  {player.rating}
                </div>
                <div style={{ fontSize: '0.6rem', color: C.textDim, marginTop: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  rating
                </div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleReroll}
              disabled={rerolls <= 0}
              style={{
                ...S.btnGhost,
                opacity: rerolls > 0 ? 1 : 0.4,
                cursor: rerolls > 0 ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={e => {
                if (rerolls > 0) { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.text }
              }}
              onMouseLeave={e => {
                if (rerolls > 0) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub }
              }}
            >
              🎲 Reroll ({rerolls} left)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
