export const C = {
  pink: '#d97fb6',
  cyan: '#5eb3c6',
  gold: '#e8c547',
  bg: '#1a1a2e',
  card: '#16213e',
  cardHover: '#1f2f4e',
  text: '#e0e0e0',
  muted: '#a0a0a0',
  deep: '#0a0e27',
}

export const S = {
  page: { maxWidth: '64rem', margin: '0 auto' },
  h1: {
    color: C.pink,
    fontSize: '2.5rem',
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: C.card,
    border: `1px solid ${C.pink}`,
    borderRadius: '4px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    padding: '1.5rem',
  },
  cardCyan: {
    backgroundColor: C.card,
    border: `1px solid ${C.cyan}`,
    borderRadius: '4px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    padding: '1.5rem',
  },
  btn: {
    background: C.pink,
    border: `1px solid ${C.pink}`,
    color: '#fff',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    textTransform: 'uppercase',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    fontSize: '1rem',
  },
}

export function cardHoverIn(e) {
  e.currentTarget.style.backgroundColor = C.cardHover
  e.currentTarget.style.boxShadow = `0 8px 24px rgba(217,127,182,0.3)`
  e.currentTarget.style.transform = 'translateY(-4px)'
}

export function cardHoverOut(e) {
  e.currentTarget.style.backgroundColor = C.card
  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
  e.currentTarget.style.transform = 'translateY(0)'
}

export function btnHoverIn(e) {
  e.currentTarget.style.background = C.cyan
  e.currentTarget.style.borderColor = C.cyan
  e.currentTarget.style.transform = 'translateY(-2px)'
  e.currentTarget.style.boxShadow = '0 4px 12px rgba(94,179,198,0.15)'
}

export function btnHoverOut(e) {
  e.currentTarget.style.background = C.pink
  e.currentTarget.style.borderColor = C.pink
  e.currentTarget.style.transform = 'translateY(0)'
  e.currentTarget.style.boxShadow = 'none'
}
