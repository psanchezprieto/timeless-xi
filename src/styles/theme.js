import React from 'react'

export const LIGHT = {
  bg:          '#F0EBE1',
  surface:     '#FFFFFF',
  surfaceHi:   '#F7F3EE',
  border:      '#CBBFB0',
  borderLight: '#DDD5C8',

  accent:      '#D44028',
  accentHover: '#E8553E',
  accentGlow:  'rgba(212,64,40,0.15)',

  cyan:        '#0A7A84',
  cyanGlow:    'rgba(10,122,132,0.15)',

  gold:        '#B06A00',
  goldGlow:    'rgba(176,106,0,0.15)',

  fwd:         '#16A34A',

  danger:      '#D44028',
  dangerGlow:  'rgba(212,64,40,0.15)',
  success:     '#1A7A4A',

  text:        '#1A3840',
  textSub:     '#4A6B75',
  textDim:     '#8AA5AE',

  pink:        '#D44028',
  muted:       '#4A6B75',
  card:        '#FFFFFF',
  cardHover:   '#F7F3EE',
  deep:        '#F0EBE1',
}

export const DARK = {
  bg:          '#0B2D35',
  surface:     '#0F3A44',
  surfaceHi:   '#174F5E',
  border:      '#1E6070',
  borderLight: '#2A7A8E',

  accent:      '#E8553E',
  accentHover: '#F26E59',
  accentGlow:  'rgba(232,85,62,0.2)',

  cyan:        '#1BB9C4',
  cyanGlow:    'rgba(27,185,196,0.18)',

  gold:        '#F0A500',
  goldGlow:    'rgba(240,165,0,0.18)',

  fwd:         '#4ADE80',

  danger:      '#E8553E',
  dangerGlow:  'rgba(232,85,62,0.18)',
  success:     '#2EC97B',

  text:        '#F5EEE6',
  textSub:     '#B8D4DA',
  textDim:     '#6B9FAD',

  pink:        '#E8553E',
  muted:       '#8AB5BE',
  card:        '#0F3A44',
  cardHover:   '#174F5E',
  deep:        '#0B2D35',
}

const FONT_HEADING = "'Oswald', sans-serif"
const FONT_BODY    = "'Source Sans 3', system-ui, sans-serif"

export function makeS(C) {
  return {
    page: { maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' },

    h1: {
      fontFamily: FONT_HEADING,
      color: C.text,
      fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
      fontWeight: '700',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      textAlign: 'center',
      marginBottom: '0.5rem',
    },

    label: {
      fontFamily: FONT_HEADING,
      fontSize: '0.65rem',
      fontWeight: '600',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color: C.cyan,
    },

    card: {
      backgroundColor: C.surface,
      border: `2px solid ${C.border}`,
      borderRadius: '2px',
      padding: '1.5rem',
      transition: 'background 0.15s, border-color 0.15s, transform 0.12s, box-shadow 0.15s',
    },

    cardAccent: {
      backgroundColor: C.surface,
      border: `2px solid ${C.accent}`,
      borderRadius: '2px',
      padding: '1.5rem',
      boxShadow: `4px 4px 0 ${C.accent}55`,
    },

    btn: {
      background: C.accent,
      border: '2px solid transparent',
      color: '#fff',
      fontFamily: FONT_HEADING,
      fontWeight: '600',
      fontSize: '0.95rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      padding: '0.6rem 1.5rem',
      borderRadius: '2px',
      cursor: 'pointer',
      transition: 'background 0.12s, transform 0.08s, box-shadow 0.12s',
    },

    btnGhost: {
      background: 'transparent',
      border: `2px solid ${C.border}`,
      color: C.textSub,
      fontFamily: FONT_HEADING,
      fontWeight: '500',
      fontSize: '0.85rem',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: '0.55rem 1.2rem',
      borderRadius: '2px',
      cursor: 'pointer',
      transition: 'border-color 0.12s, color 0.12s',
    },

    input: {
      width: '100%',
      padding: '0.65rem 1rem',
      backgroundColor: C.surface,
      border: `2px solid ${C.border}`,
      color: C.text,
      fontSize: '0.95rem',
      borderRadius: '2px',
      outline: 'none',
      fontFamily: FONT_BODY,
      transition: 'border-color 0.12s',
    },

    cardCyan: {
      backgroundColor: C.surface,
      border: `2px solid ${C.border}`,
      borderRadius: '2px',
      padding: '1.5rem',
      transition: 'background 0.15s, border-color 0.15s, transform 0.12s, box-shadow 0.15s',
    },
  }
}

export function makeHovers(C) {
  return {
    cardHoverIn(e) {
      e.currentTarget.style.backgroundColor = C.surfaceHi
      e.currentTarget.style.borderColor = C.cyan
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = `4px 4px 0 ${C.cyan}44`
    },
    cardHoverOut(e) {
      e.currentTarget.style.backgroundColor = C.surface
      e.currentTarget.style.borderColor = C.border
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    },
    btnHoverIn(e) {
      e.currentTarget.style.background = C.accentHover
      e.currentTarget.style.boxShadow = `4px 4px 0 ${C.accentGlow}`
      e.currentTarget.style.transform = 'translateY(-1px)'
    },
    btnHoverOut(e) {
      e.currentTarget.style.background = C.accent
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.transform = 'translateY(0)'
    },
  }
}

export function pill(color) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.18rem 0.55rem',
    borderRadius: '0',
    fontSize: '0.65rem',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontFamily: "'Oswald', sans-serif",
    backgroundColor: `${color}22`,
    color,
    border: `1px solid ${color}66`,
  }
}

export const ThemeContext = React.createContext(null)

export function useTheme() {
  return React.useContext(ThemeContext)
}

// Static fallbacks for any code that still imports C/S directly
export const C = LIGHT
export const S = makeS(LIGHT)
export const { cardHoverIn, cardHoverOut, btnHoverIn, btnHoverOut } = makeHovers(LIGHT)
