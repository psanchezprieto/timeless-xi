import React, { useState } from 'react'
import { useTheme } from '../styles/theme'
import { trackKofiClicked, trackKofiDismissed } from '../utils/analytics'

const DISMISS_KEY = 'kofi-dismissed'

export default function KofiWidget() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(DISMISS_KEY))
  const { C } = useTheme()

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    trackKofiDismissed()
    setVisible(false)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      backgroundColor: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 2,
      padding: '6px 10px 6px 8px',
      boxShadow: `2px 2px 0 ${C.border}`,
      fontFamily: "'Source Sans 3', system-ui, sans-serif",
      fontSize: 12,
      color: C.textSub,
      textDecoration: 'none',
    }}>
      <a
        href="https://ko-fi.com/timelesseleven"
        target="_blank"
        rel="noopener"
        onClick={trackKofiClicked}
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'inherit', textDecoration: 'none' }}
      >
        ☕ support if you enjoyed it
      </a>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          marginLeft: 4,
          cursor: 'pointer',
          color: C.textDim,
          fontSize: 14,
          lineHeight: 1,
          padding: '0 2px',
          background: 'none',
          border: 'none',
          fontFamily: 'inherit',
        }}
      >
        ✕
      </button>
    </div>
  )
}
