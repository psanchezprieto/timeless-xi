import React, { useState, useMemo } from 'react'
import { C, S, cardHoverIn, cardHoverOut } from '../styles/theme'

const COUNTRIES_DATA = [
  { name: 'Algeria', code: 'dz' },
  { name: 'Angola', code: 'ao' },
  { name: 'Argentina', code: 'ar' },
  { name: 'Australia', code: 'au' },
  { name: 'Austria', code: 'at' },
  { name: 'Belgium', code: 'be' },
  { name: 'Bolivia', code: 'bo' },
  { name: 'Bosnia and Herzegovina', code: 'ba' },
  { name: 'Brazil', code: 'br' },
  { name: 'Bulgaria', code: 'bg' },
  { name: 'Cameroon', code: 'cm' },
  { name: 'Canada', code: 'ca' },
  { name: 'Chile', code: 'cl' },
  { name: 'China PR', code: 'cn' },
  { name: 'Colombia', code: 'co' },
  { name: 'Costa Rica', code: 'cr' },
  { name: 'Croatia', code: 'hr' },
  { name: 'Czech Republic', code: 'cz' },
  { name: 'Czechoslovakia', code: 'cz' },
  { name: 'Denmark', code: 'dk' },
  { name: 'East Germany', flagSrc: '/flags/dd.svg' },
  { name: 'Ecuador', code: 'ec' },
  { name: 'Egypt', code: 'eg' },
  { name: 'El Salvador', code: 'sv' },
  { name: 'England', code: 'gb-eng' },
  { name: 'France', code: 'fr' },
  { name: 'Germany', code: 'de' },
  { name: 'Ghana', code: 'gh' },
  { name: 'Greece', code: 'gr' },
  { name: 'Haiti', code: 'ht' },
  { name: 'Honduras', code: 'hn' },
  { name: 'Hungary', code: 'hu' },
  { name: 'Iceland', code: 'is' },
  { name: 'Iran', code: 'ir' },
  { name: 'Iraq', code: 'iq' },
  { name: 'Israel', code: 'il' },
  { name: 'Italy', code: 'it' },
  { name: 'Ivory Coast', code: 'ci' },
  { name: 'Jamaica', code: 'jm' },
  { name: 'Japan', code: 'jp' },
  { name: 'Jordan', code: 'jo' },
  { name: 'Kuwait', code: 'kw' },
  { name: 'Mexico', code: 'mx' },
  { name: 'Morocco', code: 'ma' },
  { name: 'Netherlands', code: 'nl' },
  { name: 'New Zealand', code: 'nz' },
  { name: 'Nigeria', code: 'ng' },
  { name: 'North Korea', code: 'kp' },
  { name: 'Northern Ireland', code: 'gb-nir' },
  { name: 'Norway', code: 'no' },
  { name: 'Panama', code: 'pa' },
  { name: 'Paraguay', code: 'py' },
  { name: 'Peru', code: 'pe' },
  { name: 'Poland', code: 'pl' },
  { name: 'Portugal', code: 'pt' },
  { name: 'Qatar', code: 'qa' },
  { name: 'Republic of Ireland', code: 'ie' },
  { name: 'Romania', code: 'ro' },
  { name: 'Russia', code: 'ru' },
  { name: 'Saudi Arabia', code: 'sa' },
  { name: 'Scotland', code: 'gb-sct' },
  { name: 'Senegal', code: 'sn' },
  { name: 'Serbia', code: 'rs' },
  { name: 'Slovakia', code: 'sk' },
  { name: 'Slovenia', code: 'si' },
  { name: 'South Africa', code: 'za' },
  { name: 'South Korea', code: 'kr' },
  { name: 'Soviet Union', flagSrc: '/flags/su.svg' },
  { name: 'Spain', code: 'es' },
  { name: 'Sweden', code: 'se' },
  { name: 'Switzerland', code: 'ch' },
  { name: 'Togo', code: 'tg' },
  { name: 'Trinidad and Tobago', code: 'tt' },
  { name: 'Tunisia', code: 'tn' },
  { name: 'Turkey', code: 'tr' },
  { name: 'Ukraine', code: 'ua' },
  { name: 'United Arab Emirates', code: 'ae' },
  { name: 'United States', code: 'us' },
  { name: 'Uruguay', code: 'uy' },
  { name: 'Uzbekistan', code: 'uz' },
  { name: 'Wales', code: 'gb-wls' },
  { name: 'West Germany', code: 'de' },
  { name: 'Yugoslavia', flagSrc: '/flags/yu.svg' },
  { name: 'Zaire', code: 'cd' },
]

function getFlagUrl(country) {
  if (country.flagSrc) return country.flagSrc
  // Try local copy first, then fall back to CDN
  return `/flags/${country.code}.png`
}

function getCdnFlagUrl(country) {
  if (!country.code) return getFlagUrl(country)
  return `https://flagcdn.com/w160/${country.code}.png`
}

function stickerHoverIn(e) {
  e.currentTarget.style.borderColor = C.gold
  e.currentTarget.style.transform = 'translateY(-4px) rotate(0.6deg)'
  e.currentTarget.style.boxShadow = `4px 6px 16px rgba(0,0,0,0.55), 0 0 0 1px ${C.gold}55`
}
function stickerHoverOut(e) {
  e.currentTarget.style.borderColor = C.border
  e.currentTarget.style.transform = 'translateY(0) rotate(0deg)'
  e.currentTarget.style.boxShadow = '2px 3px 8px rgba(0,0,0,0.35)'
}

export default function CountryPicker({ onSelect }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return COUNTRIES_DATA
    const q = search.toLowerCase()
    return COUNTRIES_DATA.filter(c => c.name.toLowerCase().includes(q))
  }, [search])

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <h1 style={S.h1}>Choose Your Nation</h1>
      <p style={{ color: C.textSub, textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Build an all-time dream squad from your country's entire World Cup history
      </p>

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search nations…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...S.input, paddingLeft: '2.5rem' }}
          autoFocus
        />
        <span style={{
          position: 'absolute', left: '0.85rem', top: '50%',
          transform: 'translateY(-50%)', color: C.textDim, pointerEvents: 'none', fontSize: '1rem',
        }}>⌕</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: '0.9rem',
      }}>
        {filtered.map(country => (
          <button
            key={country.name}
            onClick={() => onSelect(country.name)}
            style={{
              cursor: 'pointer',
              padding: 0,
              border: `2px solid ${C.border}`,
              borderRadius: '3px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: C.surface,
              boxShadow: '2px 3px 8px rgba(0,0,0,0.35)',
              transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
              textAlign: 'center',
            }}
            onMouseEnter={stickerHoverIn}
            onMouseLeave={stickerHoverOut}
          >
            {/* Flag edge-to-edge */}
            <div className="flag-emboss" style={{ width: '100%', borderRadius: 0 }}>
              <img
                src={getCdnFlagUrl(country)}
                alt={`${country.name} flag`}
                onError={(e) => {
                  e.currentTarget.src = getFlagUrl(country)
                }}
                style={{
                  width: '100%',
                  aspectRatio: '3/2',
                  objectFit: 'cover',
                  display: 'block',
                  imageRendering: 'crisp-edges',
                }}
              />
            </div>
            {/* Name label strip */}
            <div style={{
              background: C.bg,
              borderTop: `1px solid ${C.border}`,
              padding: '0.32rem 0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '2rem',
              flex: 1,
            }}>
              <span style={{
                color: C.gold,
                fontSize: '0.58rem',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: "'Oswald', sans-serif",
                lineHeight: 1.25,
              }}>
                {country.name}
              </span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '3rem', color: C.textDim }}>
          No results for &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  )
}
