import React, { useState } from 'react'
import { FORMATIONS } from '../constants'

export default function DiceRoller({ country, formation, onComplete }) {
  const [team, setTeam] = useState([])
  const [currentPosition, setCurrentPosition] = useState('GK')

  const positions = FORMATIONS[formation].positions
  const positionOrder = ['GK', 'DEF', 'MID', 'FWD']
  const neededPositions = []

  Object.entries(positions).forEach(([pos, count]) => {
    for (let i = 0; i < count; i++) {
      neededPositions.push(pos)
    }
  })

  const handleSelectPlayer = () => {
    // Placeholder: In Phase 2c, this will load real player data
    const newTeam = [...team, { position: currentPosition, name: `${currentPosition} #${team.length + 1}` }]
    setTeam(newTeam)

    if (newTeam.length === 11) {
      onComplete(newTeam)
    } else {
      // Move to next position
      const nextIdx = positionOrder.indexOf(currentPosition) + 1
      if (nextIdx < positionOrder.length) {
        setCurrentPosition(positionOrder[nextIdx])
      }
    }
  }

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: '#d97fb6', fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', textTransform: 'uppercase' }}>
        Build Your Team
      </h1>
      <p style={{ color: '#5eb3c6', marginBottom: '2rem', fontSize: '1.125rem' }}>
        {country} • {formation}
      </p>

      <div style={{
        backgroundColor: '#16213e',
        border: '1px solid #d97fb6',
        borderRadius: '4px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ fontSize: '3rem', color: '#e8c547', marginBottom: '1rem' }}>
          {currentPosition}
        </div>
        <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>
          Position {team.length + 1} of 11
        </p>

        <button
          onClick={handleSelectPlayer}
          style={{
            background: '#d97fb6',
            border: '1px solid #d97fb6',
            color: '#fff',
            fontWeight: '600',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            fontSize: '1rem',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#5eb3c6'
            e.target.style.borderColor = '#5eb3c6'
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 4px 12px rgba(94, 179, 198, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#d97fb6'
            e.target.style.borderColor = '#d97fb6'
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}
        >
          🎲 Roll Dice
        </button>
      </div>

      {/* Team preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        gap: '0.5rem',
      }}>
        {team.map((player, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#16213e',
              border: '1px solid #5eb3c6',
              padding: '0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#5eb3c6',
            }}
          >
            {player.position}
          </div>
        ))}
      </div>
    </div>
  )
}
