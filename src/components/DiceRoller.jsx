import React, { useState, useEffect } from 'react'
import { FORMATIONS, getCountryFlagUrl } from '../constants'
import { getRandomPlayersForPosition } from '../utils/db'
import { useTheme } from '../styles/theme'
import { useIsMobile } from '../utils/useIsMobile'

function buildSlots(formation) {
  const def = FORMATIONS[formation]
  if (!def) return []
  return def.slots || []
}

const POS_Y = {
  GK: 88,
  CB: 68, LB: 68, RB: 68, DEF: 68,
  CM: 44, LM: 44, RM: 44, MID: 44,
  ST: 18, LW: 18, RW: 18, FWD: 18,
}
const POS_X_MAP = {
  1: [50],
  2: [28, 72],
  3: [20, 50, 80],
  4: [17, 38, 62, 83],
  5: [12, 30, 50, 70, 88],
}

function getPosRow(pos) {
  if (pos === 'GK') return 'GK'
  if (['CB', 'LB', 'RB', 'DEF'].includes(pos)) return 'DEF'
  if (['CM', 'LM', 'RM', 'MID'].includes(pos)) return 'MID'
  return 'FWD'
}

// L* positions left, R* right, everything else center
function getLateralPriority(pos) {
  if (['LB', 'LM', 'LW'].includes(pos)) return 0
  if (['RB', 'RM', 'RW'].includes(pos)) return 2
  return 1
}

function getSlotCoords(slots) {
  // Group slots by row, preserving original index
  const rows = {}
  slots.forEach((pos, idx) => {
    const row = getPosRow(pos)
    if (!rows[row]) rows[row] = []
    rows[row].push({ pos, idx })
  })

  // Within each row sort L→center→R, then assign x from POS_X_MAP
  const result = new Array(slots.length)
  Object.values(rows).forEach(rowSlots => {
    const sorted = [...rowSlots].sort((a, b) => getLateralPriority(a.pos) - getLateralPriority(b.pos))
    const xs = POS_X_MAP[sorted.length] || POS_X_MAP[1]
    sorted.forEach(({ pos, idx }, i) => {
      result[idx] = { x: xs[Math.min(i, xs.length - 1)], y: POS_Y[pos] ?? 50 }
    })
  })
  return result
}

function lastName(fullName) {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  return parts[parts.length - 1]
}

function FootballPitch({ slots, team }) {
  const { C } = useTheme()
  const POS_COLORS = {
    GK: C.gold,
    CB: C.cyan, LB: C.cyan, RB: C.cyan, DEF: C.cyan,
    CM: C.accent, LM: C.accent, RM: C.accent, MID: C.accent,
    ST: C.fwd, LW: C.fwd, RW: C.fwd, FWD: C.fwd,
  }
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

        const dotBg    = player ? color : isCurrent ? `${color}40` : 'rgba(255,255,255,0.10)'
        const dotBorder = player ? color : isCurrent ? color : 'rgba(255,255,255,0.45)'
        const dotColor  = player ? '#fff' : isCurrent ? '#fff' : 'rgba(255,255,255,0.85)'
        const dotShadow = player
          ? `0 0 10px ${color}88`
          : isCurrent ? `0 0 0 3px ${color}40, 0 0 10px ${color}55` : 'none'

        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '3px',
            zIndex: 1,
          }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              backgroundColor: dotBg,
              border: `2px solid ${dotBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: '800',
              color: dotColor,
              boxShadow: dotShadow,
              transition: 'all 0.25s ease',
              flexShrink: 0,
            }}>
              {player ? (player.rating ?? '') : pos}
            </div>
            <div style={{
              fontSize: '0.6rem',
              fontWeight: '700',
              color: '#fff',
              background: 'rgba(0,0,0,0.55)',
              padding: '1px 5px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
              maxWidth: '68px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'center',
              lineHeight: 1.3,
              letterSpacing: '0.02em',
            }}>
              {player ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  {lastName(player.name)}
                  {player.isCaptain && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '0.75rem', height: '0.75rem', borderRadius: '50%',
                      background: C.gold, color: '#000',
                      fontSize: '0.45rem', fontWeight: '900', flexShrink: 0,
                    }}>C</span>
                  )}
                </span>
              ) : isCurrent ? '?' : pos}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function DiceRoller({ country, formation, team: initialTeam, rerolls, onReroll, onComplete, onNewGame, campaignId, analytics }) {
  const { C, S, cardHoverIn, cardHoverOut } = useTheme()
  const POS_COLORS = {
    GK: C.gold,
    CB: C.cyan, LB: C.cyan, RB: C.cyan, DEF: C.cyan,
    CM: C.accent, LM: C.accent, RM: C.accent, MID: C.accent,
    ST: C.fwd, LW: C.fwd, RW: C.fwd, FWD: C.fwd,
  }
  const isMobile = useIsMobile()
  const slots = buildSlots(formation)
  const [team, setTeam] = useState(initialTeam || [])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  const slotIndex = team.length
  const currentPos = slots[slotIndex]

  const selectSubstitutes = async () => {
    setLoading(true)
    const pickedNames = new Set(team.map(p => p.name))
    const players = await getRandomPlayersForPosition(country, currentPos, 3, pickedNames)
    setCandidates(players)
    setLoading(false)
  }

  useEffect(() => {
    if (slotIndex >= slots.length) return
    selectSubstitutes()
  }, [slotIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (player) => {
    const next = [...team, { ...player, position: currentPos }]
    if (campaignId && analytics) {
      analytics.trackPlayerPicked(player, currentPos, campaignId)
    }
    if (next.length === slots.length) {
      onComplete(next)
    } else {
      setTeam(next)
    }
  }

  const handleReroll = async () => {
    if (rerolls <= 0) return
    onReroll()
    if (campaignId && analytics) {
      analytics.trackRerollUsed(rerolls - 1, campaignId)
    }
    await selectSubstitutes()
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
        {getCountryFlagUrl(country) && (
          <img
            src={getCountryFlagUrl(country)}
            alt={`${country} flag`}
            style={{ height: '20px', width: 'auto', borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', flexShrink: 0 }}
          />
        )}
        <p style={{ color: C.text, fontSize: '0.95rem', fontWeight: '700', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
          {country}
        </p>
        <span style={{ color: C.textDim }}>·</span>
        <p style={{ color: C.textSub, fontSize: '0.9rem', margin: 0 }}>{formation}</p>
      </div>
      <p style={{ color: C.textDim, textAlign: 'center', marginBottom: '2rem', fontSize: '0.82rem' }}>
        Slot {Math.min(slotIndex + 1, slots.length)} of {slots.length}
        {currentPos && (
          <> — pick your{' '}
            <strong style={{ color: POS_COLORS[currentPos] || C.text }}>
              {currentPos === 'GK' ? 'goalkeeper'
               : currentPos === 'CB' ? 'center back'
               : currentPos === 'LB' ? 'left back'
               : currentPos === 'RB' ? 'right back'
               : currentPos === 'CM' ? 'central midfielder'
               : currentPos === 'LM' ? 'left midfielder'
               : currentPos === 'RM' ? 'right midfielder'
               : currentPos === 'ST' ? 'striker'
               : currentPos === 'LW' ? 'left winger'
               : currentPos === 'RW' ? 'right winger'
               : 'player'}
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
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {slots.map((pos, i) => {
              const color = POS_COLORS[pos] || C.accent
              const isFilled = i < team.length
              const isCurrent = i === slotIndex

              const bg = isFilled ? C.surfaceHi : isCurrent ? `${color}22` : C.surface
              const border = isCurrent ? `2px solid ${color}` : isFilled ? `1px solid ${C.borderLight}` : `1px solid ${C.border}`
              const textColor = isFilled ? C.accent : isCurrent ? color : C.textDim

              return (
                <div key={i} style={{
                  width: '2.4rem', height: '2.4rem',
                  borderRadius: '6px',
                  border,
                  backgroundColor: bg,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: '700',
                  color: textColor,
                  boxShadow: isCurrent ? `0 0 0 2px ${color}40` : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  <span>{pos}</span>
                  {isFilled && <span style={{ fontSize: '0.65rem', marginTop: '0.5px', fontWeight: '900' }}>✓</span>}
                </div>
              )
            })}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: C.textDim, fontSize: '0.875rem' }}>Finding substitutes…</p>
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
                      fontSize: '0.68rem', fontWeight: '700',
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
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    }}>
                      {player.name}
                      {player.isCaptain && (
                        <span title="Captain" style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '1.1rem', height: '1.1rem', borderRadius: '50%',
                          background: C.gold, color: '#000',
                          fontSize: '0.6rem', fontWeight: '900',
                          flexShrink: 0, lineHeight: 1,
                        }}>C</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: C.textSub, marginBottom: isMobile ? '0.5rem' : '0.75rem' }}>
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
