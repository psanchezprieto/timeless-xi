import React from 'react'

export default function CampaignSummary({ result, onNewGame }) {
  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <h1 style={{ color: '#d97fb6', fontSize: '2.5rem', fontWeight: '900', textAlign: 'center', marginBottom: '2rem', textTransform: 'uppercase' }}>
        {result.champion ? '🏆 CHAMPIONS!' : '⚽ Tournament Complete'}
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {[
          { label: 'Final Score', value: result.finalScore },
          { label: 'MVP', value: result.mvp },
          { label: 'Matches Played', value: result.matches },
          { label: 'Goals For', value: result.goalsFor },
          { label: 'Goals Against', value: result.goalsAgainst },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#16213e',
              border: '1px solid #d97fb6',
              borderRadius: '4px',
              padding: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ fontSize: '0.875rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#e8c547' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onNewGame}
        style={{
          width: '100%',
          background: '#d97fb6',
          border: '1px solid #d97fb6',
          color: '#fff',
          fontWeight: '600',
          padding: '1rem',
          cursor: 'pointer',
          textTransform: 'uppercase',
          borderRadius: '4px',
          fontSize: '1rem',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#5eb3c6'
          e.target.style.borderColor = '#5eb3c6'
          e.target.style.transform = 'translateY(-2px)'
          e.target.style.boxShadow = '0 4px 12px rgba(94, 179, 198, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#d97fb6'
          e.target.style.borderColor = '#d97fb6'
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = 'none'
        }}
      >
        Play Again
      </button>
    </div>
  )
}
