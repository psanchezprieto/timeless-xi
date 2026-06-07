import React, { useState, useEffect } from 'react'
import { FORMATIONS } from '../constants'
import { getRandomPlayersForPosition } from '../utils/db'

export default function DiceRoller({ country, formation, onComplete }) {
  const [team, setTeam] = useState([])
  const [currentPosition, setCurrentPosition] = useState('GK')
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [strikes, setStrikes] = useState(0)

  const positions = FORMATIONS[formation].positions
  const positionOrder = ['GK', 'DEF', 'MID', 'FWD']

  // Load initial candidates for current position
  useEffect(() => {
    loadCandidates()
  }, [currentPosition])

  const loadCandidates = async () => {
    setLoading(true)
    try {
      const players = await getRandomPlayersForPosition(country, currentPosition, 3)
      setCandidates(players)
    } catch (e) {
      console.error('Error loading players:', e)
      setCandidates([])
    }
    setLoading(false)
  }

  const handleSelectPlayer = (player) => {
    const newTeam = [...team, { ...player, selected: true }]
    setTeam(newTeam)

    if (newTeam.length === 11) {
      onComplete(newTeam)
    } else {
      // Move to next position
      const nextIdx = positionOrder.indexOf(currentPosition) + 1
      if (nextIdx < positionOrder.length) {
        setCurrentPosition(positionOrder[nextIdx])
        setStrikes(0)
      }
    }
  }

  const handleReroll = () => {
    if (strikes < 2) {
      setStrikes(strikes + 1)
      loadCandidates()
    }
  }

  const positionLabel = {
    GK: 'Goalkeeper',
    DEF: 'Defender',
    MID: 'Midfielder',
    FWD: 'Forward',
  }[currentPosition]

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <h1 style={{ color: '#d97fb6', fontSize: '2.5rem', fontWeight: '900', textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase' }}>
        Build Your Team
      </h1>
      <p style={{ color: '#5eb3c6', textAlign: 'center', marginBottom: '2rem', fontSize: '1.125rem' }}>
        {country} • {formation}
      </p>

      <div style={{
        backgroundColor: '#16213e',
        border: '1px solid #d97fb6',
        borderRadius: '4px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', color: '#e8c547', marginBottom: '0.5rem', fontWeight: '900' }}>
          {currentPosition}
        </div>
        <div style={{ color: '#a0a0a0', marginBottom: '2rem' }}>
          {positionLabel} • Position {team.length + 1} of 11
        </div>

        {/* Candidates */}
        {loading ? (
          <p style={{ color: '#5eb3c6' }}>Rolling dice...</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            {candidates.map(player => (
              <button
                key={`${player.name}-${player.year}`}
                onClick={() => handleSelectPlayer(player)}
                style={{
                  backgroundColor: '#0a0e27',
                  border: '1px solid #5eb3c6',
                  borderRadius: '4px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#e0e0e0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#e8c547'
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(232, 197, 71, 0.3)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#5eb3c6'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  {player.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>
                  #{player.number} • {player.year}
                </div>
                <div style={{ fontSize: '1.25rem', color: '#e8c547', fontWeight: '900' }}>
                  {player.rating}
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={handleReroll}
            disabled={strikes >= 3}
            style={{
              background: strikes >= 3 ? '#666' : '#d97fb6',
              border: `1px solid ${strikes >= 3 ? '#666' : '#d97fb6'}`,
              color: '#fff',
              fontWeight: '600',
              padding: '0.75rem 1.5rem',
              cursor: strikes >= 3 ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              marginRight: '0.5rem',
            }}
            onMouseEnter={(e) => {
              if (strikes < 3) {
                e.target.style.background = '#5eb3c6'
                e.target.style.borderColor = '#5eb3c6'
              }
            }}
            onMouseLeave={(e) => {
              if (strikes < 3) {
                e.target.style.background = '#d97fb6'
                e.target.style.borderColor = '#d97fb6'
              }
            }}
          >
            🎲 Reroll ({3 - strikes} left)
          </button>
        </div>
      </div>

      {/* Team preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '0.5rem',
      }}>
        {team.map((player, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#16213e',
              border: '1px solid #5eb3c6',
              padding: '0.75rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#5eb3c6',
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{player.position}</div>
            <div style={{ fontSize: '0.7rem', color: '#a0a0a0' }}>{player.name}</div>
            <div style={{ color: '#e8c547', fontWeight: '700' }}>{player.rating}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
