import React from 'react'
import { FORMATIONS, getCountryFlagUrl } from '../constants'
import { useTheme } from '../styles/theme'


export default function FormationPicker({ country, onSelect, onNewGame }) {
  const { C, S, cardHoverIn, cardHoverOut } = useTheme()
  const POS_COLORS = {
    GK: C.gold,
    DEF: C.cyan,
    MID: C.accent,
    FWD: C.fwd,
  }
  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
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
      <h1 style={S.h1}>Choose Your Formation</h1>
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

      <div className="formations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {Object.entries(FORMATIONS).map(([key, formation]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{ ...S.card, cursor: 'pointer', textAlign: 'center', padding: '2rem 1.5rem' }}
            onMouseEnter={cardHoverIn}
            onMouseLeave={cardHoverOut}
          >
            <div style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '2rem', fontWeight: '800',
              color: C.accent, marginBottom: '0.4rem',
              letterSpacing: '-0.02em',
            }}>
              {key}
            </div>
            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: C.text, marginBottom: '0.25rem' }}>
              {formation.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: C.textDim, marginBottom: '1.25rem' }}>
              {formation.description}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {Object.entries(formation.positions).map(([pos, count]) => (
                <div key={pos} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  backgroundColor: `${POS_COLORS[pos] || C.accent}14`,
                  border: `1px solid ${POS_COLORS[pos] || C.accent}30`,
                  borderRadius: '8px',
                  padding: '0.4rem 0.6rem',
                  minWidth: '3rem',
                }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: '600', color: POS_COLORS[pos] || C.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{pos}</span>
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.25rem', fontWeight: '700', color: C.text }}>{count}</span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
