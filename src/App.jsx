import React, { useState, useEffect } from 'react'

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('🔄 App mounted, loading meta.json...')
    const loadMeta = async () => {
      try {
        console.log('📡 Fetching /data/meta.json...')
        const res = await fetch('/data/meta.json')
        console.log('📦 Response status:', res.status, res.statusText)
        if (!res.ok) throw new Error(`Failed to load meta.json: ${res.status}`)
        const meta = await res.json()
        console.log('✅ Meta loaded:', meta)
        setDataLoaded(true)
      } catch (e) {
        console.error('❌ Error loading data:', e.message)
        setError(e.message)
      }
    }
    loadMeta()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#1a1a2e' }}>
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0px, rgba(0, 0, 0, 0.05) 1px, transparent 1px, transparent 2px)',
          pointerEvents: 'none'
        }}
      ></div>

      <h1 style={{ color: '#d97fb6', fontSize: '3rem', fontFamily: "'Inter', sans-serif", fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', textAlign: 'center' }}>
        TIMELESS XI
      </h1>

      <p style={{ color: '#5eb3c6', fontSize: '1.125rem', marginBottom: '2rem', textAlign: 'center', maxWidth: '42rem' }}>
        ⚽ Build Your Dream Team. Win the Cup. ⚽
      </p>

      {error ? (
        <div style={{ backgroundColor: '#16213e', border: '1px solid #d97fb6', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)', borderRadius: '4px', padding: '2rem', maxWidth: '28rem', textAlign: 'center' }}>
          <p style={{ color: '#e8c547', fontSize: '1.25rem', marginBottom: '1rem' }}>⚠️ ERROR</p>
          <p style={{ color: '#e0e0e0' }}>{error}</p>
        </div>
      ) : dataLoaded ? (
        <div style={{ backgroundColor: '#16213e', border: '1px solid #d97fb6', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)', borderRadius: '4px', padding: '2rem', maxWidth: '28rem', textAlign: 'center' }}>
          <p style={{ color: '#5eb3c6', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Data Ready!</p>
          <p style={{ color: '#e0e0e0', marginBottom: '1.5rem' }}>Game components coming soon...</p>
          <button style={{ background: '#d97fb6', border: '1px solid #d97fb6', color: '#fff', fontWeight: '600', padding: '0.75rem 1.5rem', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s ease', borderRadius: '4px' }} onMouseEnter={(e) => { e.target.style.background = '#5eb3c6'; e.target.style.borderColor = '#5eb3c6'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(94, 179, 198, 0.15)'; }} onMouseLeave={(e) => { e.target.style.background = '#d97fb6'; e.target.style.borderColor = '#d97fb6'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}>
            Start Game
          </button>
        </div>
      ) : (
        <div className="card-retro p-8 max-w-md text-center" style={{ backgroundColor: '#16213e', border: '1px solid #d97fb6', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
          <p className="text-xl mb-4" style={{ color: '#5eb3c6' }}>Loading...</p>
          <div className="flex justify-center gap-2">
            <div style={{ width: '12px', height: '12px', backgroundColor: '#d97fb6', borderRadius: '50%', animation: 'pulse-neon 2s infinite' }}></div>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#5eb3c6', borderRadius: '50%', animation: 'pulse-neon 2s infinite 0.3s' }}></div>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#e8c547', borderRadius: '50%', animation: 'pulse-neon 2s infinite 0.6s' }}></div>
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', color: '#a0a0a0', marginTop: '3rem', fontSize: '0.875rem', maxWidth: '42rem' }}>
        Assemble players from 23 World Cup tournaments • Master 4 formations • Challenge AI opponents • Win glory
      </p>
    </div>
  )
}
