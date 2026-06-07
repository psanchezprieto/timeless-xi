import React, { useState, useCallback } from 'react'
import CountryPicker from './CountryPicker'
import FormationPicker from './FormationPicker'
import DiceRoller from './DiceRoller'
import CoachPicker from './CoachPicker'
import TournamentSim from './TournamentSim'
import CampaignSummary from './CampaignSummary'
import { C } from '../styles/theme'

export default function Game() {
  const [stage, setStage] = useState('country')
  const [country, setCountry] = useState(null)
  const [formation, setFormation] = useState(null)
  const [team, setTeam] = useState([])
  const [coach, setCoach] = useState(null)
  const [result, setResult] = useState(null)

  const onCountry = useCallback(c => { setCountry(c); setStage('formation') }, [])
  const onFormation = useCallback(f => { setFormation(f); setStage('dice') }, [])
  const onTeam = useCallback(t => { setTeam(t); setStage('coach') }, [])
  const onCoach = useCallback(c => { setCoach(c); setStage('tournament') }, [])
  const onTournament = useCallback(r => { setResult(r); setStage('summary') }, [])
  const onNewGame = useCallback(() => {
    setStage('country'); setCountry(null); setFormation(null); setTeam([]); setCoach(null); setResult(null)
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, color: C.text, padding: '2rem' }}>
      {stage === 'country' && <CountryPicker onSelect={onCountry} />}
      {stage === 'formation' && <FormationPicker country={country} onSelect={onFormation} />}
      {stage === 'dice' && <DiceRoller country={country} formation={formation} onComplete={onTeam} />}
      {stage === 'coach' && <CoachPicker country={country} onSelect={onCoach} />}
      {stage === 'tournament' && <TournamentSim team={team} coach={coach} country={country} onComplete={onTournament} />}
      {stage === 'summary' && result && <CampaignSummary result={result} onNewGame={onNewGame} />}
    </div>
  )
}
