import React, { useState, useEffect } from 'react'
import Game from './components/Game'
import Homepage from './components/Homepage'
import { LIGHT, DARK, makeS, makeHovers, ThemeContext } from './styles/theme'

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('timeless_xi_theme') === 'dark')

  const toggle = () => setDark(d => {
    const next = !d
    localStorage.setItem('timeless_xi_theme', next ? 'dark' : 'light')
    return next
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  const C = dark ? DARK : LIGHT
  const S = makeS(C)
  const hovers = makeHovers(C)

  return (
    <ThemeContext.Provider value={{ C, S, dark, toggle, ...hovers }}>
      {children}
    </ThemeContext.Provider>
  )
}

function AppInner() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const C = React.useContext(ThemeContext).C

  useEffect(() => {
    fetch('/data/meta.json')
      .then(r => { if (!r.ok) throw new Error(`meta.json: ${r.status}`); return r.json() })
      .then(() => setReady(true))
      .catch(e => setError(e.message))
  }, [])

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ backgroundColor: C.surface, border: `1px solid ${C.danger}`, borderRadius: '12px', padding: '2.5rem', maxWidth: '28rem', textAlign: 'center' }}>
          <p style={{ color: C.danger, fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            Failed to load game data
          </p>
          <p style={{ color: C.textSub, fontSize: '0.875rem' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontFamily: "'Oswald', sans-serif", color: C.text, fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
          Timeless XI
        </h1>
        <p style={{ color: C.textSub, marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          Build Your Dream Team. Win the Cup.
        </p>
        <div className="spinner" />
      </div>
    )
  }

  if (isPlaying) {
    return <Game onBack={() => setIsPlaying(false)} />
  }

  return (
    <Homepage
      onPlayClick={() => setIsPlaying(true)}
      onHomeClick={() => setIsPlaying(false)}
    />
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
