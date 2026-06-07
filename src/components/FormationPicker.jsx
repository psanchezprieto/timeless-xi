import React from 'react'
import { FORMATIONS } from '../constants'

export default function FormationPicker({ country, onSelect }) {
  const formations = Object.entries(FORMATIONS)

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <h1 style={{ color: '#d97fb6', fontSize: '2.5rem', fontWeight: '900', textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase' }}>
        Choose Your Formation
      </h1>
      <p style={{ color: '#5eb3c6', textAlign: 'center', marginBottom: '2rem', fontSize: '1.125rem' }}>
        {country}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
      }}>
        {formations.map(([key, formation]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
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
              fontSize: '2.5rem',
              fontWeight: '900',
              color: '#d97fb6',
              marginBottom: '0.5rem',
              fontFamily: 'Inter, sans-serif',
            }}>
              {key}
            </div>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#e0e0e0',
              marginBottom: '0.5rem',
            }}>
              {formation.name}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#a0a0a0',
              marginBottom: '1rem',
            }}>
              {formation.description}
            </div>

            {/* Formation breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              marginTop: '1rem',
            }}>
              {Object.entries(formation.positions).map(([pos, count]) => (
                <div
                  key={pos}
                  style={{
                    backgroundColor: '#0a0e27',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ color: '#5eb3c6', fontWeight: '600', fontSize: '0.75rem' }}>
                    {pos}
                  </div>
                  <div style={{ color: '#e8c547', fontWeight: '700', fontSize: '1.25rem' }}>
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
