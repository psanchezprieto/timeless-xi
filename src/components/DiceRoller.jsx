import React, { useState, useEffect } from 'react'
import { FORMATIONS } from '../constants'
import { getRandomPlayersForPosition } from '../utils/db'
import { C, S, cardHoverIn, cardHoverOut } from '../styles/theme'
import { useIsMobile } from '../utils/useIsMobile'

function buildSlots(formation) {
  const slots = []
  const def = FORMATIONS[formation]
  if (!def) return slots
  Object.entries(def.positions).forEach(([pos, count]) => {
    for (let i = 0; i < count; i++) slots.push(pos)
  })
  return slots
}

const POS_COLORS = { GK: C.gold, DEF: C.cyan, MID: C.accent, FWD: '#E8553E' }
const POS_Y = { GK: 88, DEF: 68, MID: 44, FWD: 18 }
const POS_X_MAP = {
  1: [50],
  2: [28, 72],
  3: [20, 50, 80],
  4: [17, 38, 62, 83],
  5: [12, 30, 50, 70, 88],
}

function getSlotCoords(slots) {
  const countByPos = {}
  for (const pos of slots) countByPos[pos] = (countByPos[pos] || 0) + 1
  const idxByPos = {}
  return slots.map(pos => {
    const i = idxByPos[pos] || 0
    idxByPos[pos] = i + 1
    const n = countByPos[pos]
    const xs = POS_X_MAP[n] || POS_X_MAP[1]
    return { x: xs[Math.min(i, xs.length - 1)], y: POS_Y[pos] ?? 50 }
  })
}

function FootballPitch({ slots, team }) {
  const coords = getSlotCoords(slots)

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', backgroundColor: '#0e3d1a', borderRadius: '2px', border: `2px solid #1a5c28`, overflow: 'hidden' }}>
      {/* Pitch markings */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 200 300" preserveAspectRatio="none">
        <rect x="10" y="10" width="180" height="280" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        <line x1="10" y1="150" x2="190" y2="150" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <circle cx="100" cy="150" r="28" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <circle cx="100" cy="150" r="2.5" fill="rgba(255,255,255,0.25)" />
        <rect x="50" y="10" width="100" height="52" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <rect x="50" y="238" width="100" height="52" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <rect x="72" y="10" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <rect x="72" y="268" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      </svg>

      {/* Player tokens */}
      {slots.map((pos, i) => {
        const { x, y } = coords[i]
        const player = team[i]
        const isCurrent = i === team.length
        const color = POS_COLORS[pos] || C.accent

        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '2px',
            zIndex: 1,
          }}>
            <div style={{
              width: 30, height: 30,
              borderRadius: '50%',
              backgroundColor: player ? color : isCurrent ? `${color}22` : 'rgba(255,255,255,0.04)',
              border: `2px solid ${player ? color : isCurrent ? color : 'rgba(255,255,255,0.12)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.5rem', fontWeight: '800',
              color: player ? '#fff' : isCurrent ? color : 'rgba(255,255,255,0.25)',
              boxShadow: player ? `0 0 10px ${color}55` : isCurrent ? `0 0 6px ${color}33` : 'none',
              transition: 'all 0.25s ease',
              flexShrink: 0,
            }}>
              {player ? (player.rating ?? '') : pos}
            </div>
            <div style={{
              fontSize: '0.4rem',
              fontWeight: '600',
              color: player ? '#fff' : isCurrent ? color : 'rgba(255,255,255,0.2)',
              textShadow: '0 1px 4px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
              maxWidth: '52px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'center',
              lineHeight: 1.1,
              opacity: player || isCurrent ? 1 : 0.5,
            }}>
              {player
                ? player.name
                : isCurrent ? '?' : pos}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function DiceRoller({ country, formation, team: initialTeam, rerolls, onReroll, onComplete, onNewGame }) {
  const isMobile = useIsMobile()
  const slots = buildSlots(formation)
  const [team, setTeam] = useState(initialTeam || [])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  const slotIndex = team.length
  const currentPos = slots[slotIndex]

  const rollDice = async () => {
    setLoading(true)
    const pickedNames = new Set(team.map(p => p.name))
    const players = await getRandomPlayersForPosition(country, currentPos, 3, pickedNames)
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
    <div style={{ maxWidth: '76rem', margin: '0 auto' }}>
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

      {/* Layout: side-by-side on desktop, stacked on mobile (pitch first) */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '1.5rem' : '2rem',
        alignItems: 'flex-start',
      }}>
        {/* Mobile: pitch comes first */}
        {isMobile && (
          <div style={{ width: '100%', maxWidth: '200px', margin: '0 auto' }}>
            <p style={{ ...S.label, textAlign: 'center', marginBottom: '0.75rem' }}>Your XI</p>
            <FootballPitch slots={slots} team={team} />
          </div>
        )}
        {/* Slot tracker + candidates */}
        <div style={{ flex: '1 1 0', minWidth: 0, width: '100%' }}>
          {/* Slot tracker */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
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
                gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
                gap: isMobile ? '0.5rem' : '1rem',
                marginBottom: '1.5rem',
              }}>
                {candidates.map((player, i) => (
                  <button
                    key={i}
                    onClick={() => pick(player)}
                    style={{ ...S.card, cursor: 'pointer', textAlign: 'center', padding: isMobile ? '0.75rem 0.4rem' : '1.5rem 1rem' }}
                    onMouseEnter={cardHoverIn}
                    onMouseLeave={cardHoverOut}
                  >
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.55rem', fontWeight: '700',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: POS_COLORS[currentPos] || C.accent,
                      backgroundColor: `${POS_COLORS[currentPos] || C.accent}18`,
                      padding: '0.15rem 0.4rem', borderRadius: '2px',
                      marginBottom: isMobile ? '0.4rem' : '0.85rem',
                    }}>
                      {currentPos}
                    </span>

                    <div style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: isMobile ? '0.95rem' : '1.3rem', fontWeight: '800',
                      color: C.text, marginBottom: '0.5rem', lineHeight: 1.2,
                    }}>
                      {player.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: C.textDim, marginBottom: isMobile ? '0.5rem' : '0.75rem' }}>
                      {player.year}
                    </div>

                    <div style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: isMobile ? '1rem' : '1.4rem', fontWeight: '700', color: C.gold,
                      letterSpacing: '-0.02em',
                    }}>
                      {player.rating}
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
                  ⚽ Make a Sub ({rerolls} left)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Desktop: pitch on right */}
        {!isMobile && (
          <div style={{ flex: '0 0 200px' }}>
            <p style={{ ...S.label, textAlign: 'center', marginBottom: '0.75rem' }}>Your XI</p>
            <FootballPitch slots={slots} team={team} />
          </div>
        )}
      </div>
    </div>
  )
}
