import React, { useState, useCallback, useEffect } from 'react'
import CountryPicker from './CountryPicker'
import FormationPicker from './FormationPicker'
import DiceRoller from './DiceRoller'
import CoachPicker from './CoachPicker'
import TournamentSim from './TournamentSim'
import CampaignSummary from './CampaignSummary'
import { C } from '../styles/theme'

const STAGES = ['country', 'formation', 'dice', 'coach', 'tournament', 'summary']
const STORAGE_KEY = 'timeless_xi_game_state'

export default function Game() {
  // Load persisted state on mount
  const [stage, setStage] = useState('country')
  const [country, setCountry] = useState(null)
  const [formation, setFormation] = useState(null)
  const [team, setTeam] = useState([])
  const [coach, setCoach] = useState(null)
  const [result, setResult] = useState(null)
  const [rerolls, setRerolls] = useState(3)
  const [hydrated, setHydrated] = useState(false)

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const state = JSON.parse(saved)
        setStage(state.stage || 'country')
        setCountry(state.country || null)
        setFormation(state.formation || null)
        setTeam(state.team || [])
        setCoach(state.coach || null)
        setRerolls(state.rerolls !== undefined ? state.rerolls : 3)
      } catch (e) {
        console.warn('Failed to restore game state:', e)
      }
    }
    setHydrated(true)
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!hydrated) return
    const state = { stage, country, formation, team, coach, rerolls }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [stage, country, formation, team, coach, rerolls, hydrated])

  const onCountry = useCallback(c => {
    setCountry(c)
    setFormation(null)
    setTeam([])
    setCoach(null)
    setRerolls(3) // Reset rerolls when starting a new squad
    setStage('formation')
  }, [])

  const onFormation = useCallback(f => {
    setFormation(f)
    setTeam([])
    setStage('dice')
  }, [])

  const onTeam = useCallback(t => {
    setTeam(t)
    setStage('coach')
  }, [])

  const onCoach = useCallback(c => {
    setCoach(c)
    setStage('tournament')
  }, [])

  const onTournament = useCallback(r => {
    setResult(r)
    setStage('summary')
  }, [])

  const onNewGame = useCallback(() => {
    setStage('country')
    setCountry(null)
    setFormation(null)
    setTeam([])
    setCoach(null)
    setResult(null)
    setRerolls(3)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const onReroll = useCallback(() => {
    setRerolls(r => Math.max(0, r - 1))
  }, [])

  const stepIdx = STAGES.indexOf(stage)
  const totalSteps = STAGES.length - 2

  if (!hydrated) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, color: C.text }}>
      {stage !== 'summary' && (
        <div style={{ height: '2px', backgroundColor: C.border }}>
          <div style={{
            height: '100%',
            width: `${(stepIdx / totalSteps) * 100}%`,
            background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      )}

      <div style={{ padding: '2.5rem 1.5rem' }}>
        {stage === 'country' && <CountryPicker onSelect={onCountry} />}
        {stage === 'formation' && <FormationPicker country={country} onSelect={onFormation} onNewGame={onNewGame} />}
        {stage === 'dice' && (
          <DiceRoller
            country={country}
            formation={formation}
            team={team}
            rerolls={rerolls}
            onReroll={onReroll}
            onComplete={onTeam}
            onNewGame={onNewGame}
          />
        )}
        {stage === 'coach' && <CoachPicker country={country} onSelect={onCoach} onNewGame={onNewGame} />}
        {stage === 'tournament' && <TournamentSim team={team} coach={coach} country={country} onComplete={onTournament} onNewGame={onNewGame} />}
        {stage === 'summary' && result && <CampaignSummary result={result} team={team} onNewGame={onNewGame} />}
      </div>
    </div>
  )
}
