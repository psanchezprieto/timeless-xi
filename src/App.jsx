import React, { useState, useEffect } from 'react'
import Game from './components/Game'
import { C } from './styles/theme'

export default function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/data/meta.json')
      .then(r => { if (!r.ok) throw new Error(`meta.json: ${r.status}`); return r.json() })
      .then(() => setReady(true))
      .catch(e => setError(e.message))
  }, [])

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.pink}`, borderRadius: '4px', padding: '2rem', maxWidth: '28rem', textAlign: 'center' }}>
          <p style={{ color: C.gold, fontSize: '1.25rem', marginBottom: '1rem' }}>⚠️ Failed to load game data</p>
          <p style={{ color: C.text, fontSize: '0.875rem' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: C.pink, fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
          TIMELESS XI
        </h1>
        <p style={{ color: C.cyan, marginBottom: '2rem' }}>⚽ Build Your Dream Team. Win the Cup. ⚽</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 12, backgroundColor: C.pink, borderRadius: '50%', animation: 'pulse-neon 2s infinite' }} />
          <div style={{ width: 12, height: 12, backgroundColor: C.cyan, borderRadius: '50%', animation: 'pulse-neon 2s infinite 0.3s' }} />
          <div style={{ width: 12, height: 12, backgroundColor: C.gold, borderRadius: '50%', animation: 'pulse-neon 2s infinite 0.6s' }} />
        </div>
      </div>
    )
  }

  return <Game />
}
