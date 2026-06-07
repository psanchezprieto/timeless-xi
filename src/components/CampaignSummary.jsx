import React from 'react'
import { C, S, btnHoverIn, btnHoverOut } from '../styles/theme'

export default function CampaignSummary({ result, onNewGame }) {
  const stats = [
    { label: 'Result', value: result.champion ? '🏆 CHAMPIONS' : `Out in ${result.exitRound}` },
    { label: 'MVP', value: result.mvp },
    { label: 'Matches Played', value: result.matches },
    { label: 'Goals For', value: result.goalsFor },
    { label: 'Goals Against', value: result.goalsAgainst },
  ]

  return (
    <div style={S.page}>
      <h1 style={{ ...S.h1, color: result.champion ? C.gold : C.pink }}>
        {result.champion ? '🏆 Champions!' : '⚽ Tournament Complete'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: C.muted, marginBottom: '0.5rem' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: C.gold }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onNewGame}
        style={{ ...S.btn, width: '100%', padding: '1rem' }}
        onMouseEnter={btnHoverIn}
        onMouseLeave={btnHoverOut}
      >
        Play Again
      </button>
    </div>
  )
}
