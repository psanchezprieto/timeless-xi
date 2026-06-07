import React, { useState, useEffect } from 'react'

export default function TournamentSim({ team, coach, onComplete }) {
  const [stage, setStage] = useState('simulating')

  useEffect(() => {
    // Simulate tournament after 2 seconds
    const timer = setTimeout(() => {
      const mockResult = {
        champion: true,
        finalScore: '2-1',
        mvp: team[0]?.name || 'Unknown Player',
        matches: 7,
        goalsFor: 12,
        goalsAgainst: 4,
      }
      onComplete(mockResult)
    }, 2000)

    return () => clearTimeout(timer)
  }, [team, coach, onComplete])

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: '#d97fb6', fontSize: '2.5rem', fontWeight: '900', marginBottom: '2rem', textTransform: 'uppercase' }}>
        Tournament Simulation
      </h1>

      {stage === 'simulating' && (
        <div style={{
          backgroundColor: '#16213e',
          border: '1px solid #d97fb6',
          borderRadius: '4px',
          padding: '3rem 2rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        }}>
          <p style={{ color: '#5eb3c6', fontSize: '1.5rem', marginBottom: '2rem', animation: 'pulse 1.5s ease-in-out infinite' }}>
            Simulating your tournament...
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
          }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#e8c547',
                  borderRadius: '50%',
                  animation: `pulse 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.2); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
