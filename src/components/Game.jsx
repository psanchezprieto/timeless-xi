import React, { useState } from 'react'
import CountryPicker from './CountryPicker'
import FormationPicker from './FormationPicker'
import DiceRoller from './DiceRoller'
import CoachPicker from './CoachPicker'
import TournamentSim from './TournamentSim'
import CampaignSummary from './CampaignSummary'

export default function Game() {
  const [gameStage, setGameStage] = useState('country') // country → formation → dice → coach → tournament → summary
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedFormation, setSelectedFormation] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState([]) // Array of 11 players
  const [selectedCoach, setSelectedCoach] = useState(null)
  const [tournamentResult, setTournamentResult] = useState(null)

  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
    setGameStage('formation')
  }

  const handleFormationSelect = (formation) => {
    setSelectedFormation(formation)
    setGameStage('dice')
  }

  const handleTeamComplete = (team) => {
    setSelectedTeam(team)
    setGameStage('coach')
  }

  const handleCoachSelect = (coach) => {
    setSelectedCoach(coach)
    setGameStage('tournament')
  }

  const handleTournamentComplete = (result) => {
    setTournamentResult(result)
    setGameStage('summary')
  }

  const handleNewGame = () => {
    setGameStage('country')
    setSelectedCountry(null)
    setSelectedFormation(null)
    setSelectedTeam([])
    setSelectedCoach(null)
    setTournamentResult(null)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: '#e0e0e0', padding: '2rem' }}>
      {gameStage === 'country' && <CountryPicker onSelect={handleCountrySelect} />}
      {gameStage === 'formation' && selectedCountry && (
        <FormationPicker country={selectedCountry} onSelect={handleFormationSelect} />
      )}
      {gameStage === 'dice' && selectedCountry && selectedFormation && (
        <DiceRoller country={selectedCountry} formation={selectedFormation} onComplete={handleTeamComplete} />
      )}
      {gameStage === 'coach' && selectedCountry && (
        <CoachPicker country={selectedCountry} onSelect={handleCoachSelect} />
      )}
      {gameStage === 'tournament' && selectedTeam.length === 11 && selectedCoach && (
        <TournamentSim team={selectedTeam} coach={selectedCoach} onComplete={handleTournamentComplete} />
      )}
      {gameStage === 'summary' && tournamentResult && (
        <CampaignSummary result={tournamentResult} onNewGame={handleNewGame} />
      )}
    </div>
  )
}
