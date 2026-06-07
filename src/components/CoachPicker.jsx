import React from 'react'

// Placeholder coach data - will load from coaches.json in Phase 2c
const COACHES_SAMPLE = [
  { name: 'Coach A', era: '2010-2020', moraleBoost: 3 },
  { name: 'Coach B', era: '2000-2010', moraleBoost: 4 },
  { name: 'Coach C', era: '1990-2000', moraleBoost: 5 },
]

export default function CoachPicker({ country, onSelect }) {
  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <h1 style={{ color: '#d97fb6', fontSize: '2.5rem', fontWeight: '900', textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase' }}>
        Select Your Coach
      </h1>
      <p style={{ color: '#5eb3c6', textAlign: 'center', marginBottom: '2rem', fontSize: '1.125rem' }}>
        {country}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
      }}>
        {COACHES_SAMPLE.map(coach => (
          <button
            key={coach.name}
            onClick={() => onSelect(coach)}
            style={{
              backgroundColor: '#16213e',
              border: '1px solid #d97fb6',
              borderRadius: '4px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1f2f4e'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 127, 182, 0.3)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#16213e'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: '#e0e0e0',
              marginBottom: '0.5rem',
            }}>
              {coach.name}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#a0a0a0',
              marginBottom: '1rem',
            }}>
              Era: {coach.era}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.25rem',
              marginTop: '1rem',
            }}>
              {Array(coach.moraleBoost)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#e8c547',
                      borderRadius: '50%',
                    }}
                  />
                ))}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#e8c547',
              marginTop: '0.5rem',
              fontWeight: '600',
            }}>
              +{coach.moraleBoost}% Morale
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
