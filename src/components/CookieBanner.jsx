import React, { useState } from 'react'
import posthog from 'posthog-js'
import { useTheme } from '../styles/theme'

const CONSENT_KEY = 'analytics-consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(CONSENT_KEY))
  const { C } = useTheme()

  if (!visible) return null

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    posthog.opt_in_capturing()
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10000,
      backgroundColor: C.surface,
      borderTop: `2px solid ${C.border}`,
      padding: '0.875rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      boxShadow: '0 -4px 16px rgba(0,0,0,0.15)',
    }}>
      <p style={{
        flex: 1,
        color: C.textSub,
        fontSize: '0.825rem',
        minWidth: '200px',
        margin: 0,
        lineHeight: 1.5,
      }}>
        We use analytics cookies to understand how the game is played — which squads get picked, who wins. No personal data is sold or shared.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            padding: '0.4rem 1rem',
            border: `1px solid ${C.border}`,
            backgroundColor: 'transparent',
            color: C.textSub,
            cursor: 'pointer',
            fontFamily: "'Oswald', sans-serif",
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            padding: '0.4rem 1.25rem',
            border: 'none',
            backgroundColor: C.accent,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: "'Oswald', sans-serif",
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Accept
        </button>
      </div>
    </div>
  )
}
