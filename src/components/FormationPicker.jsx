import React from 'react'
import { FORMATIONS } from '../constants'
import { C, S, cardHoverIn, cardHoverOut } from '../styles/theme'

export default function FormationPicker({ country, onSelect }) {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>Choose Your Formation</h1>
      <p style={{ color: C.cyan, textAlign: 'center', marginBottom: '2rem', fontSize: '1.125rem' }}>
        {country}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {Object.entries(FORMATIONS).map(([key, formation]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{ ...S.card, cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' }}
            onMouseEnter={cardHoverIn}
            onMouseLeave={cardHoverOut}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: C.pink, marginBottom: '0.5rem' }}>
              {key}
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: C.text, marginBottom: '0.5rem' }}>
              {formation.name}
            </div>
            <div style={{ fontSize: '0.875rem', color: C.muted, marginBottom: '1rem' }}>
              {formation.description}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
              {Object.entries(formation.positions).map(([pos, count]) => (
                <div
                  key={pos}
                  style={{ backgroundColor: C.deep, padding: '0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}
                >
                  <div style={{ color: C.cyan, fontWeight: '600', fontSize: '0.75rem' }}>{pos}</div>
                  <div style={{ color: C.gold, fontWeight: '700', fontSize: '1.25rem' }}>{count}</div>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
