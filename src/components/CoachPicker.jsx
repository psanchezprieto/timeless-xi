import React, { useState, useEffect } from 'react'
import { getCoachesByCountry } from '../utils/db'
import { C, S, cardHoverIn, cardHoverOut } from '../styles/theme'

export default function CoachPicker({ country, onSelect }) {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getCoachesByCountry(country)
      .then(list => setCoaches(list || []))
      .catch(() => setCoaches([]))
      .finally(() => setLoading(false))
  }, [country])

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Select Your Coach</h1>
      <p style={{ color: C.cyan, textAlign: 'center', marginBottom: '2rem', fontSize: '1.125rem' }}>
        {country}
      </p>

      {loading && (
        <p style={{ color: C.cyan, textAlign: 'center' }}>Loading legendary managers...</p>
      )}

      {!loading && coaches.length === 0 && (
        <p style={{ color: C.muted, textAlign: 'center' }}>No coach data found for {country}.</p>
      )}

      {!loading && coaches.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {coaches.map(coach => (
            <button
              key={coach.name}
              onClick={() => onSelect(coach)}
              style={{ ...S.card, cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' }}
              onMouseEnter={cardHoverIn}
              onMouseLeave={cardHoverOut}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: C.text, marginBottom: '0.5rem' }}>
                {coach.name}
              </div>
              <div style={{ fontSize: '0.875rem', color: C.muted, marginBottom: '1rem' }}>
                {coach.era}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {Array.from({ length: coach.moraleBoost }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, backgroundColor: C.gold, borderRadius: '50%' }} />
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', color: C.gold, fontWeight: '600' }}>
                +{coach.moraleBoost}% Morale
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
