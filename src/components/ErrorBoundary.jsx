import React from 'react'

const GAME_STORAGE_KEY = 'timeless_xi_game_state'

// Last-resort safety net: if a render crashes (e.g. stale/incompatible
// localStorage state, unexpected data shape), show a recoverable screen
// instead of leaving the user with a blank page.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Timeless XI crashed:', error, info)
  }

  handleReset = () => {
    try {
      localStorage.removeItem(GAME_STORAGE_KEY)
    } catch (e) {
      // ignore
    }
    window.location.href = window.location.pathname
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ backgroundColor: '#15151f', border: '1px solid #FF10F0', borderRadius: '12px', padding: '2.5rem', maxWidth: '28rem', textAlign: 'center' }}>
            <p style={{ color: '#FF10F0', fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Something went wrong
            </p>
            <p style={{ color: '#a0a0b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Your saved game may be out of date. Resetting it should fix this.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #00F0FF',
                color: '#00F0FF',
                fontFamily: "'Oswald', sans-serif",
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Reset &amp; Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
