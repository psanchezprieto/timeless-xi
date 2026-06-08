import React, { useRef } from 'react'
import { useTheme } from '../styles/theme'

const POS_ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 }

export default function CampaignSummary({ result, team, onNewGame, country }) {
  const { C, S, btnHoverIn, btnHoverOut } = useTheme()
  const POS_COLORS = { GK: C.gold, DEF: C.cyan, MID: C.accent, FWD: C.fwd }
  const summaryRef = useRef(null)

  const calculateWins = () => {
    let wins = 0
    for (const match of result.results || []) {
      const userIsHome = match.home === country
      const userGoals = userIsHome ? match.homeGoals : match.awayGoals
      const oppGoals = userIsHome ? match.awayGoals : match.homeGoals
      if (userGoals > oppGoals || (match.penalties && ((userIsHome && match.penHome > match.penAway) || (!userIsHome && match.penAway > match.penHome)))) {
        wins++
      }
    }
    return wins
  }

  const wins = calculateWins()

  const stats = [
    { label: 'Result', value: result.champion ? 'Champions' : `Out — ${result.exitRound}`, accent: result.champion },
    { label: 'MVP', value: result.mvp },
    { label: 'Matches', value: result.matches },
    { label: 'Wins', value: wins },
    { label: 'Goals scored', value: result.goalsFor },
    { label: 'Goals conceded', value: result.goalsAgainst },
  ]

  const handleSharePNG = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: C.bg,
        scale: 2,
        allowTaint: true,
        useCORS: true,
      })
      canvas.toBlob(async blob => {
        if (navigator.share) {
          const file = new File([blob], 'timeless-xi-campaign.png', { type: 'image/png' })
          await navigator.share({
            files: [file],
            title: 'Timeless XI Campaign',
            text: `Check out my ${country} campaign!`,
          })
        } else {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'timeless-xi-campaign.png'
          a.click()
          URL.revokeObjectURL(url)
        }
      })
    } catch (err) {
      console.error('Failed to share:', err)
    }
  }

  const handleReplaySameSquad = () => {
    onNewGame?.({ reuseSquad: true })
  }

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
      {/* Shareable content */}
      <div ref={summaryRef} style={{
        backgroundColor: C.bg,
        padding: '2rem 1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
      }}>
      {/* Trophy / banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        {result.champion && (
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🏆</div>
        )}
        <h1 style={{
          ...S.h1,
          color: result.champion ? C.gold : C.text,
        }}>
          {result.champion ? `${country} — World Champions` : `${country} — Tournament Complete`}
        </h1>
        {!result.champion && (
          <p style={{ color: C.textSub, marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Eliminated in the {result.exitRound}
          </p>
        )}
      </div>

      {/* Stats grid — single row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: '0.5rem',
        marginBottom: '2rem',
      }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            ...S.card,
            textAlign: 'center',
            padding: '0.6rem 0.4rem',
            borderColor: stat.accent ? C.gold : C.border,
          }}>
            <div style={{
              fontSize: '0.55rem', fontWeight: '600',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              color: C.textDim, marginBottom: '0.25rem',
              lineHeight: 1.1,
            }}>
              {stat.label}
            </div>
            <div style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '1rem', fontWeight: '800',
              color: stat.accent ? C.gold : C.text,
              lineHeight: 1.2,
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Play Again button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={onNewGame}
          style={{ ...S.btn, width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
          onMouseEnter={btnHoverIn}
          onMouseLeave={btnHoverOut}
        >
          Play Again
        </button>
      </div>

      {/* Squad */}
      {team?.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ ...S.label, marginBottom: '0.75rem' }}>Your Squad</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {[...team]
              .sort((a, b) => (POS_ORDER[a.position] ?? 9) - (POS_ORDER[b.position] ?? 9))
              .map((player, i) => {
                const color = POS_COLORS[player.position] || C.accent
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.85rem',
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{
                        fontSize: '0.58rem', fontWeight: '700',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        color, backgroundColor: `${color}18`,
                        padding: '0.15rem 0.45rem', borderRadius: '4px',
                        minWidth: '2.6rem', textAlign: 'center',
                      }}>
                        {player.position}
                      </span>
                      <span style={{ color: C.text, fontWeight: '600' }}>{player.name}</span>
                      <span style={{ color: C.textDim, fontSize: '0.75rem' }}>{player.year}</span>
                    </div>
                    <span style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontWeight: '700', color: C.gold, fontSize: '1rem',
                    }}>
                      {player.rating}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Match log */}
      {result.results?.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ ...S.label, marginBottom: '0.75rem' }}>Match Log</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {result.results.map((m, i) => {
              const label = m.homeLabel || m.home
              const oppLabel = m.awayLabel || m.away
              const isHome = m.home !== 'opponent'
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.5rem 0.85rem',
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                }}>
                  <span style={{ color: C.textSub }}>{m.homeLabel || m.home} vs {m.awayLabel || m.away}</span>
                  <span style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: '700', color: C.text,
                  }}>
                    {m.homeGoals}–{m.awayGoals}
                    {m.penalties && <span style={{ color: C.textDim, fontSize: '0.7rem' }}> (P)</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <button
          onClick={handleSharePNG}
          style={{ ...S.btn, padding: '0.75rem', fontSize: '0.9rem', background: C.accent }}
          onMouseEnter={btnHoverIn}
          onMouseLeave={btnHoverOut}
        >
          📸 Share Results
        </button>
        <button
          onClick={handleReplaySameSquad}
          style={{ ...S.btn, padding: '0.75rem', fontSize: '0.9rem', background: C.gold }}
          onMouseEnter={btnHoverIn}
          onMouseLeave={btnHoverOut}
        >
          🔄 Replay Squad
        </button>
      </div>
    </div>
  )
}
