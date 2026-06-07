import React, { useState, useMemo } from 'react'

// Country data with flags (using country codes)
const COUNTRIES_DATA = [
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

  const filteredCountries = useMemo(() => {
    if (!search) return COUNTRIES_DATA
    return COUNTRIES_DATA.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <h1 style={{ color: '#d97fb6', fontSize: '2.5rem', fontWeight: '900', textAlign: 'center', marginBottom: '2rem', textTransform: 'uppercase' }}>
        Select Your Team
      </h1>

      <input
        type="text"
        placeholder="Search countries..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          marginBottom: '2rem',
          backgroundColor: '#16213e',
          border: '1px solid #d97fb6',
          color: '#e0e0e0',
          fontSize: '1rem',
          borderRadius: '4px',
          boxShadow: '0 0 8px rgba(217, 127, 182, 0.2)',
        }}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '1rem',
      }}>
        {filteredCountries.map(country => (
          <button
            key={country.name}
            onClick={() => onSelect(country.name)}
            style={{
              backgroundColor: '#16213e',
              border: '1px solid #5eb3c6',
              color: '#e0e0e0',
              padding: '1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1.25rem',
              fontWeight: '600',
              boxShadow: '0 0 8px rgba(94, 179, 198, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5eb3c6'
              e.target.style.color = '#1a1a2e'
              e.target.style.transform = 'scale(1.05)'
              e.target.style.boxShadow = '0 4px 12px rgba(94, 179, 198, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#16213e'
              e.target.style.color = '#e0e0e0'
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = '0 0 8px rgba(94, 179, 198, 0.2)'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{country.flag}</div>
            <div style={{ fontSize: '0.9rem' }}>{country.name}</div>
          </button>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#a0a0a0' }}>
          No countries found matching "{search}"
        </div>
      )}
    </div>
  )
}
