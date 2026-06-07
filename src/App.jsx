import React, { useState, useEffect } from 'react'

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await fetch('/data/meta.json')
        if (!res.ok) throw new Error('Failed to load meta.json')
        const meta = await res.json()
        console.log('✅ Meta loaded:', meta)
        setDataLoaded(true)
      } catch (e) {
        console.error('❌ Error loading data:', e)
        setError(e.message)
      }
    }
    loadMeta()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <style jsx>{`
        .scanline {
          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.15) 0px,
              rgba(0, 0, 0, 0.15) 1px,
              transparent 1px,
              transparent 2px
            );
          pointer-events: none;
        }
      `}</style>

      <div className="scanline fixed inset-0"></div>

      <h1 className="neon-text-pink text-5xl md:text-6xl font-bold mb-4 text-center drop-shadow-lg">
        TIMELESS XI
      </h1>

      <p className="neon-text-cyan text-lg md:text-xl mb-8 text-center max-w-2xl">
        ⚽ Build Your Dream Team. Win the Cup. ⚽
      </p>

      {error ? (
        <div className="card-retro p-8 max-w-md text-center">
          <p className="neon-text-yellow text-xl mb-4">⚠️ ERROR</p>
          <p className="text-white">{error}</p>
        </div>
      ) : dataLoaded ? (
        <div className="card-retro p-8 max-w-md text-center">
          <p className="neon-text-cyan text-xl mb-6">Data Ready!</p>
          <p className="text-white mb-6">Game components coming soon...</p>
          <button className="glow-button">
            Start Game
          </button>
        </div>
      ) : (
        <div className="card-retro p-8 max-w-md text-center">
          <p className="neon-text-cyan text-xl mb-4 flicker">Loading...</p>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-neon-pink rounded-full pulse-neon"></div>
            <div className="w-3 h-3 bg-neon-cyan rounded-full pulse-neon" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-3 h-3 bg-neon-yellow rounded-full pulse-neon" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
      )}

      <p className="text-center text-gray-400 mt-12 text-sm max-w-2xl">
        Assemble players from 23 World Cup tournaments • Master 4 formations • Challenge AI opponents • Win glory
      </p>
    </div>
  )
}
