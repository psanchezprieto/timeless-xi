import React from 'react'
import { C } from '../styles/theme'

export default function Banner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 16, 240, 0.08) 0%, rgba(0, 240, 255, 0.08) 100%)',
      borderTop: `4px solid ${C.accent}`,
      borderBottom: `4px solid ${C.accent}`,
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Scanlines overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15) 0, rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
        pointerEvents: 'none',
      }} />

      {/* Accent bars */}
      <div style={{
        height: '3px',
        background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
        marginBottom: '1.5rem',
        position: 'relative',
        zIndex: 1,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
      }}>
        {/* Main title */}
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 900,
          letterSpacing: '0.15em',
          margin: 0,
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #c0c0c0)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(255, 16, 240, 0.5)) drop-shadow(0 0 10px rgba(0, 240, 255, 0.3))',
          transform: 'skewX(-12deg)',
          textShadow: 'none',
          fontFamily: '"Arial Black", sans-serif',
        }}>
          TIMELESS XI
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          margin: 0,
          color: C.cyan,
          textShadow: `0 0 10px ${C.cyan}, 0 0 20px rgba(0, 240, 255, 0.5)`,
          textTransform: 'uppercase',
          fontFamily: '"Arial", sans-serif',
        }}>
          WORLD CUP DREAM TEAM SIMULATOR
        </p>
      </div>

      {/* Bottom accent bar */}
      <div style={{
        height: '3px',
        background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
        marginTop: '1.5rem',
        position: 'relative',
        zIndex: 1,
      }} />
    </div>
  )
}
