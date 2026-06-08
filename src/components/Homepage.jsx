import React from 'react'
import { useTheme } from '../styles/theme'
import Header from './Header'

export default function Homepage({ onPlayClick, onHomeClick }) {
  const { C, S, btnHoverIn, btnHoverOut } = useTheme()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg }}>
      <Header onHome={onHomeClick} />

      <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Hero Section */}
        <section
          style={{
            textAlign: 'center',
            marginBottom: '4rem',
            paddingTop: '2rem',
          }}
        >
          {/* Big Neon Title */}
          <div
            style={{
              marginBottom: '1.5rem',
              position: 'relative',
            }}
          >
            <h1
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                fontWeight: '900',
                color: C.accent,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                textShadow: `
                  0 0 10px ${C.accent}88,
                  4px 4px 0 ${C.accent}44
                `,
                lineHeight: 1.1,
              }}
            >
              Build Your<br />Dream Team
            </h1>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: 'clamp(1rem, 3vw, 1.3rem)',
              color: C.cyan,
              marginBottom: '0.5rem',
              fontWeight: '500',
              letterSpacing: '0.04em',
            }}
          >
            Assemble legends from World Cup history
          </p>

          <p
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: '0.95rem',
              color: C.textSub,
              marginBottom: '2.5rem',
              maxWidth: '28rem',
              margin: '0.5rem auto 2.5rem',
            }}
          >
            Select your country, pick your formation, and compete in a simulated tournament against historical rivals.
          </p>

          {/* CTA Button */}
          <button
            onClick={onPlayClick}
            style={{
              ...S.btn,
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              boxShadow: `6px 6px 0 ${C.accent}55`,
              transform: 'none',
            }}
            onMouseEnter={e => {
              btnHoverIn(e)
              e.currentTarget.style.boxShadow = `6px 6px 0 ${C.accent}88`
              e.currentTarget.style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={e => {
              btnHoverOut(e)
              e.currentTarget.style.boxShadow = `6px 6px 0 ${C.accent}55`
            }}
          >
            Play Now
          </button>
        </section>

        {/* Features Grid */}
        <section style={{ marginBottom: '3rem' }}>
          <h2
            style={{
              ...S.h1,
              marginBottom: '2rem',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            }}
          >
            How It Works
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                icon: '🌍',
                title: 'Pick Your Country',
                desc: 'Choose from historical World Cup squads across all eras',
              },
              {
                icon: '⚙️',
                title: 'Select Formation',
                desc: 'Choose your tactical setup: 4-4-2, 4-3-3, 3-5-2, 5-3-2, or 4-2-4',
              },
              {
                icon: '👥',
                title: 'Build Your Squad',
                desc: 'Select players by position with 3 substitute slots to adjust your lineup',
              },
              {
                icon: '🏆',
                title: 'Win the Cup',
                desc: 'Battle through group stage, knockouts, and finals',
              },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  ...S.card,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderColor: C.cyan,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = C.accent
                  e.currentTarget.style.backgroundColor = C.surfaceHi
                  e.currentTarget.style.boxShadow = `4px 4px 0 ${C.accent}44`
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = C.cyan
                  e.currentTarget.style.backgroundColor = C.surface
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                  {feature.icon}
                </span>
                <h3
                  style={{
                    ...S.label,
                    marginBottom: '0.5rem',
                    color: C.accent,
                    fontSize: '0.8rem',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: C.textSub,
                    lineHeight: 1.5,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Highlight */}
        <section
          style={{
            ...S.cardAccent,
            background: C.surface,
            borderColor: C.gold,
            boxShadow: `4px 4px 0 ${C.gold}55`,
            marginBottom: '3rem',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              ...S.label,
              color: C.gold,
              marginBottom: '1rem',
            }}
          >
            Why Timeless XI?
          </h3>
          <p style={{ fontSize: '0.95rem', color: C.textSub, lineHeight: 1.6 }}>
            Experience the thrill of World Cup competition with players from every era—from Pelé and Maradona to
            Ronaldo and Messi. No two games are the same. Every match is dynamically simulated with realistic odds
            based on player ratings and team chemistry.
          </p>
        </section>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={onPlayClick}
            style={{
              ...S.btn,
              padding: '0.8rem 2rem',
              fontSize: '1rem',
            }}
            onMouseEnter={btnHoverIn}
            onMouseLeave={btnHoverOut}
          >
            Start Your Campaign
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: `2px solid ${C.border}`,
          backgroundColor: C.surface,
          padding: '1.5rem',
          textAlign: 'center',
          marginTop: '3rem',
        }}
      >
        <p
          style={{
            fontSize: '0.8rem',
            color: C.textDim,
            margin: 0,
          }}
        >
          © 2026 Timeless XI • Built with passion for football history
        </p>
      </footer>
    </div>
  )
}
