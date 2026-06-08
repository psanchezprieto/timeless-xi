import React, { useState, useEffect } from 'react'
import { getCoachesByCountry } from '../utils/db'
import { getCountryFlagUrl } from '../constants'
import { useTheme } from '../styles/theme'

export default function CoachPicker({ country, onSelect, onNewGame }) {
  const { C, S, cardHoverIn, cardHoverOut, btnHoverIn, btnHoverOut } = useTheme()
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
    <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
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
      <p style={{ ...S.label, textAlign: 'center', marginBottom: '0.75rem' }}>Manager</p>
      <h1 style={S.h1}>Choose Your Coach</h1>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '2.5rem' }}>
        {getCountryFlagUrl(country) && (
          <img
            src={getCountryFlagUrl(country)}
            alt={`${country} flag`}
            style={{ height: '20px', width: 'auto', borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', flexShrink: 0 }}
          />
        )}
        <span style={{ color: C.text, fontSize: '0.95rem', fontWeight: '700', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {country}
        </span>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: C.textDim, fontSize: '0.875rem' }}>Loading legendary managers…</p>
        </div>
      )}

      {!loading && coaches.length === 0 && (
        <div style={{ ...S.card, textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: C.textSub, marginBottom: '1.5rem' }}>No coach data found for {country}.</p>
          <button onClick={() => onSelect({ name: 'Unknown', moraleBoost: 0 })} style={S.btn} onMouseEnter={btnHoverIn} onMouseLeave={btnHoverOut}>
            Continue without coach
          </button>
        </div>
      )}

      {!loading && coaches.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {coaches.map(coach => (
            <button
              key={coach.name}
              onClick={() => onSelect(coach)}
              style={{ ...S.card, cursor: 'pointer', textAlign: 'center', padding: '1.75rem 1.5rem' }}
              onMouseEnter={cardHoverIn}
              onMouseLeave={cardHoverOut}
            >
              <div style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.05rem', fontWeight: '700',
                color: C.text, marginBottom: '0.3rem',
              }}>
                {coach.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: C.textDim, marginBottom: '1.25rem' }}>
                {coach.era}
              </div>

              {/* Morale pips */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{
                    width: 7, height: 7,
                    borderRadius: '50%',
                    backgroundColor: i < coach.moraleBoost ? C.gold : C.border,
                    transition: 'background 0.15s',
                  }} />
                ))}
              </div>
              <div style={{
                fontSize: '0.7rem', fontWeight: '600',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: C.gold,
              }}>
                +{coach.moraleBoost} morale
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
