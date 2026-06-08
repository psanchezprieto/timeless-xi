import React from 'react'
import { useTheme } from '../styles/theme'

export default function Header({ onHome }) {
  const { C, S, dark, toggle, btnHoverIn, btnHoverOut } = useTheme()

  return (
    <header
      style={{
        backgroundColor: C.surface,
        borderBottom: `3px solid ${C.accent}`,
        boxShadow: `0 4px 0 ${C.accent}55`,
        padding: '1rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '72rem',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Logo/Home Button */}
        <button
          onClick={onHome}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem 0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.8'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          <span
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
              fontWeight: '800',
              color: C.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textShadow: `2px 2px 0 ${C.accentGlow}`,
            }}
          >
            ⚽ Timeless XI
          </span>
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Theme Toggle */}
        <button
          onClick={toggle}
          style={{
            ...S.btn,
            background: dark ? C.cyan : C.gold,
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
          onMouseEnter={btnHoverIn}
          onMouseLeave={btnHoverOut}
          title={dark ? 'Light Mode' : 'Dark Mode'}
        >
          {dark ? '☀️' : '🌙'}
          <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>
            {dark ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>
    </header>
  )
}
