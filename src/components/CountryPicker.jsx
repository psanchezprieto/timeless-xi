import React, { useState, useMemo } from 'react'
import { C, S, cardHoverIn, cardHoverOut } from '../styles/theme'

const COUNTRIES_DATA = [
  { name: 'Algeria', flag: '🇩🇿' },
  { name: 'Angola', flag: '🇦🇴' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Austria', flag: '🇦🇹' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'Bolivia', flag: '🇧🇴' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Bulgaria', flag: '🇧🇬' },
  { name: 'Cameroon', flag: '🇨🇲' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Chile', flag: '🇨🇱' },
  { name: 'China PR', flag: '🇨🇳' },
  { name: 'Colombia', flag: '🇨🇴' },
  { name: 'Costa Rica', flag: '🇨🇷' },
  { name: 'Croatia', flag: '🇭🇷' },
  { name: 'Czech Republic', flag: '🇨🇿' },
  { name: 'Czechoslovakia', flag: '🇨🇿' },
  { name: 'Denmark', flag: '🇩🇰' },
  { name: 'East Germany', flag: '🇩🇪' },
  { name: 'Ecuador', flag: '🇪🇨' },
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'El Salvador', flag: '🇸🇻' },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Greece', flag: '🇬🇷' },
  { name: 'Haiti', flag: '🇭🇹' },
  { name: 'Honduras', flag: '🇭🇳' },
  { name: 'Hungary', flag: '🇭🇺' },
  { name: 'Iceland', flag: '🇮🇸' },
  { name: 'Iran', flag: '🇮🇷' },
  { name: 'Iraq', flag: '🇮🇶' },
  { name: 'Israel', flag: '🇮🇱' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Ivory Coast', flag: '🇨🇮' },
  { name: 'Jamaica', flag: '🇯🇲' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Jordan', flag: '🇯🇴' },
  { name: 'Kuwait', flag: '🇰🇼' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'New Zealand', flag: '🇳🇿' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'North Korea', flag: '🇰🇵' },
  { name: 'Northern Ireland', flag: '🇬🇧' },
  { name: 'Norway', flag: '🇳🇴' },
  { name: 'Panama', flag: '🇵🇦' },
  { name: 'Paraguay', flag: '🇵🇾' },
  { name: 'Peru', flag: '🇵🇪' },
  { name: 'Poland', flag: '🇵🇱' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Republic of Ireland', flag: '🇮🇪' },
  { name: 'Romania', flag: '🇷🇴' },
  { name: 'Russia', flag: '🇷🇺' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Serbia', flag: '🇷🇸' },
  { name: 'Slovakia', flag: '🇸🇰' },
  { name: 'Slovenia', flag: '🇸🇮' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Soviet Union', flag: '🇷🇺' },
  { name: 'Sweden', flag: '🇸🇪' },
  { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'Togo', flag: '🇹🇬' },
  { name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { name: 'Tunisia', flag: '🇹🇳' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Ukraine', flag: '🇺🇦' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Uruguay', flag: '🇺🇾' },
  { name: 'Uzbekistan', flag: '🇺🇿' },
  { name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { name: 'West Germany', flag: '🇩🇪' },
  { name: 'Yugoslavia', flag: '🇷🇸' },
  { name: 'Zaire', flag: '🇨🇩' },
]

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
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '0.65rem',
      }}>
        {filtered.map(country => (
          <button
            key={country.name}
            onClick={() => onSelect(country.name)}
            style={{
              ...S.card,
              cursor: 'pointer',
              textAlign: 'center',
              padding: '1rem 0.75rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
            }}
            onMouseEnter={cardHoverIn}
            onMouseLeave={cardHoverOut}
          >
            <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{country.flag}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: C.text, lineHeight: 1.3 }}>
              {country.name}
            </span>
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
