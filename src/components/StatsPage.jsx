import React from 'react'
import Header from './Header'
import CommunityLeaderboard from './CommunityLeaderboard'
import { useTheme } from '../styles/theme'

export default function StatsPage({ onHome }) {
  const { C, S } = useTheme()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, color: C.text }}>
      <Header onHome={onHome} />
      <main style={{ ...S.page, paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.cyan, fontWeight: 700, fontSize: '0.72rem' }}>
            Community pulse
          </p>
          <h1 style={{ ...S.h1, textAlign: 'left', marginTop: '0.5rem', marginBottom: 0, color: C.text }}>
            Top picks & dream XI
          </h1>
        </div>
        <CommunityLeaderboard />
      </main>
    </div>
  )
}
