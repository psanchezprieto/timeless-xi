import React from 'react'
import { C, S, btnHoverIn, btnHoverOut } from '../styles/theme'

export default function CampaignSummary({ result, onNewGame }) {
  const stats = [
    { label: 'Result', value: result.champion ? 'Champions' : `Out — ${result.exitRound}`, accent: result.champion },
    { label: 'MVP', value: result.mvp },
    { label: 'Matches', value: result.matches },
    { label: 'Goals scored', value: result.goalsFor },
    { label: 'Goals conceded', value: result.goalsAgainst },
  ]

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
      {/* Trophy / banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        {result.champion && (
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🏆</div>
        )}
        <h1 style={{
          ...S.h1,
          color: result.champion ? C.gold : C.text,
        }}>
          {result.champion ? 'World Champions' : 'Tournament Complete'}
        </h1>
        {!result.champion && (
          <p style={{ color: C.textSub, marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Eliminated in the {result.exitRound}
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            ...S.card,
            textAlign: 'center',
            padding: '1.25rem',
            borderColor: stat.accent ? C.gold : C.border,
          }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: '600',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: C.textDim, marginBottom: '0.5rem',
            }}>
              {stat.label}
            </div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.4rem', fontWeight: '800',
              color: stat.accent ? C.gold : C.text,
              lineHeight: 1.2,
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

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
                  <span style={{ color: C.textSub }}>{m.home} vs {m.away}</span>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
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

      <button
        onClick={onNewGame}
        style={{ ...S.btn, width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
        onMouseEnter={btnHoverIn}
        onMouseLeave={btnHoverOut}
      >
        Play Again
      </button>
    </div>
  )
}
