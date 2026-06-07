// Design tokens
export const C = {
  bg:          '#0B0B0F',
  surface:     '#131318',
  surfaceHi:   '#1A1A24',
  border:      '#252530',
  borderLight: '#2E2E3E',

  accent:      '#7C5CFC',
  accentHover: '#9B84FD',
  accentGlow:  'rgba(124,92,252,0.18)',

  cyan:        '#06B6D4',
  cyanGlow:    'rgba(6,182,212,0.15)',

  gold:        '#F59E0B',
  goldGlow:    'rgba(245,158,11,0.15)',

  danger:      '#EF4444',
  dangerGlow:  'rgba(239,68,68,0.15)',
  success:     '#10B981',

  text:        '#EEEEF2',
  textSub:     '#8B8BA0',
  textDim:     '#4A4A60',

  // Legacy aliases kept so we don't break anything still importing them
  pink:        '#7C5CFC',
  muted:       '#8B8BA0',
  card:        '#131318',
  cardHover:   '#1A1A24',
  deep:        '#0B0B0F',
}

export const S = {
  page: { maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' },

  h1: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: C.text,
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },

  label: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '0.7rem',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: C.textDim,
  },

  card: {
    backgroundColor: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    padding: '1.5rem',
    transition: 'background 0.15s, border-color 0.15s, transform 0.15s, box-shadow 0.15s',
  },

  cardAccent: {
    backgroundColor: C.surface,
    border: `1px solid ${C.accent}`,
    borderRadius: '10px',
    padding: '1.5rem',
    boxShadow: `0 0 0 1px ${C.accentGlow}`,
  },

  btn: {
    background: C.accent,
    border: 'none',
    color: '#fff',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: '600',
    fontSize: '0.9rem',
    letterSpacing: '-0.01em',
    padding: '0.65rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s, transform 0.1s, box-shadow 0.15s',
  },

  btnGhost: {
    background: 'transparent',
    border: `1px solid ${C.border}`,
    color: C.textSub,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: '500',
    fontSize: '0.875rem',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, color 0.15s',
  },

  input: {
    width: '100%',
    padding: '0.65rem 1rem',
    backgroundColor: C.surface,
    border: `1px solid ${C.border}`,
    color: C.text,
    fontSize: '0.9rem',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.15s',
  },

  // Cardcyan kept as alias
  cardCyan: {
    backgroundColor: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    padding: '1.5rem',
    transition: 'background 0.15s, border-color 0.15s, transform 0.15s, box-shadow 0.15s',
  },
}

export function cardHoverIn(e) {
  e.currentTarget.style.backgroundColor = C.surfaceHi
  e.currentTarget.style.borderColor = C.borderLight
  e.currentTarget.style.transform = 'translateY(-3px)'
  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'
}

export function cardHoverOut(e) {
  e.currentTarget.style.backgroundColor = C.surface
  e.currentTarget.style.borderColor = C.border
  e.currentTarget.style.transform = 'translateY(0)'
  e.currentTarget.style.boxShadow = 'none'
}

export function btnHoverIn(e) {
  e.currentTarget.style.background = C.accentHover
  e.currentTarget.style.boxShadow = `0 4px 16px ${C.accentGlow}`
  e.currentTarget.style.transform = 'translateY(-1px)'
}

export function btnHoverOut(e) {
  e.currentTarget.style.background = C.accent
  e.currentTarget.style.boxShadow = 'none'
  e.currentTarget.style.transform = 'translateY(0)'
}

// Pill badge helper
export function pill(color, text) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.2rem 0.6rem',
    borderRadius: '99px',
    fontSize: '0.7rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    backgroundColor: `${color}22`,
    color,
    border: `1px solid ${color}44`,
  }
}
