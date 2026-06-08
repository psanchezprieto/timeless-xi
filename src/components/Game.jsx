import React, { useState, useCallback, useEffect } from 'react'
import CountryPicker from './CountryPicker'
import FormationPicker from './FormationPicker'
import DiceRoller from './DiceRoller'
import CoachPicker from './CoachPicker'
import TournamentSim from './TournamentSim'
import CampaignSummary from './CampaignSummary'
import Header from './Header'
import { useTheme } from '../styles/theme'
import { useGameAnalytics } from '../utils/analytics'
import { preloadTournamentData } from '../utils/db'

const STAGES = ['country', 'formation', 'subst', 'coach', 'tournament', 'summary']
const STORAGE_KEY = 'timeless_xi_game_state'

export default function Game({ onBack }) {
  const { C, dark, toggle } = useTheme()
  const analytics = useGameAnalytics()

  // Load persisted state on mount
  const [stage, setStage] = useState('country')
  const [country, setCountry] = useState(null)
  const [formation, setFormation] = useState(null)
  const [team, setTeam] = useState([])
  const [coach, setCoach] = useState(null)
  const [result, setResult] = useState(null)
  const [rerolls, setRerolls] = useState(3)
  const [hydrated, setHydrated] = useState(false)
  const [campaignId, setCampaignId] = useState(null)

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

  // Scroll to top when stage changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [stage])

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
    const newCampaignId = analytics.trackCampaignStart(c)
    setCampaignId(newCampaignId)
    setStage('formation')
    preloadTournamentData() // Warm up cache while user picks formation
  }, [analytics])

  const onFormation = useCallback(f => {
    setFormation(f)
    setTeam([])
    if (campaignId) analytics.trackFormationSelected(f, campaignId)
    setStage('subst')
  }, [campaignId, analytics])

  const onTeam = useCallback(t => {
    setTeam(t)
    setStage('coach')
  }, [])

  const onCoach = useCallback(c => {
    setCoach(c)
    if (campaignId) analytics.trackCoachSelected(c, campaignId)
    setStage('tournament')
  }, [campaignId, analytics])

  const onTournament = useCallback(r => {
    setResult(r)
    if (campaignId) analytics.trackCampaignCompleted(r, { team, country, formation, coach }, campaignId)
    setStage('summary')
  }, [campaignId, analytics, team, country, formation, coach])

  const onNewGame = useCallback((options = {}) => {
    if (options.reuseSquad && team.length > 0) {
      // Keep team, formation, and country; go to coach stage
      setCoach(null)
      setResult(null)
      setStage('coach')
    } else {
      // Full reset
      setStage('country')
      setCountry(null)
      setFormation(null)
      setTeam([])
      setCoach(null)
      setResult(null)
      setRerolls(3)
      setCampaignId(null)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [team])

  const onReroll = useCallback(() => {
    setRerolls(r => Math.max(0, r - 1))
  }, [])

  const stepIdx = STAGES.indexOf(stage)
  const totalSteps = STAGES.length - 2

  if (!hydrated) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, color: C.text }}>
      <Header onHome={onBack || (() => {})} />

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
        {stage === 'subst' && (
          <DiceRoller
            country={country}
            formation={formation}
            team={team}
            rerolls={rerolls}
            onReroll={onReroll}
            onComplete={onTeam}
            onNewGame={onNewGame}
            campaignId={campaignId}
            analytics={analytics}
          />
        )}
        {stage === 'coach' && <CoachPicker country={country} onSelect={onCoach} onNewGame={onNewGame} />}
        {stage === 'tournament' && <TournamentSim team={team} coach={coach} country={country} onComplete={onTournament} onNewGame={onNewGame} />}
        {stage === 'summary' && result && <CampaignSummary result={result} team={team} country={country} onNewGame={onNewGame} />}
      </div>
    </div>
  )
}
