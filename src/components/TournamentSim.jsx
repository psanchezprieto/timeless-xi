import React, { useState, useMemo, useEffect } from 'react'
import {
  generateHistoricalAITeams, generateAITeams,
  calcTeamRating, createGroups, simulateGroup, simulateKnockoutMatch,
} from '../utils/simulator'
import { C, S } from '../styles/theme'

const ROUNDS = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final']

// "Spain (1982)" for AI teams, plain "Spain" for user
function teamLabel(team) {
  if (team.isUser) return team.country
  return team.year ? `${team.country} (${team.year})` : team.country
}

function buildResult(campaign, champion, exitRound) {
  const scorerCount = {}
  for (const s of campaign.results.flatMap(r => r.homeScorers || [])) {
    scorerCount[s] = (scorerCount[s] || 0) + 1
  }
  const mvpEntry = Object.entries(scorerCount).sort((a, b) => b[1] - a[1])[0]
  return {
    champion, exitRound,
    mvp: mvpEntry ? mvpEntry[0] : '—',
    matches: campaign.results.length,
    goalsFor: campaign.gf,
    goalsAgainst: campaign.ga,
    results: campaign.results,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────

function Btn({ children, onClick, color = C.accent, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...S.btn,
        background: color,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.filter = 'brightness(1.12)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.filter = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {children}
    </button>
  )
}

function ScoreBox({ result, userCountry }) {
  const userIsHome = result.home === userCountry
  const userGoals = userIsHome ? result.homeGoals : result.awayGoals
  const oppGoals  = userIsHome ? result.awayGoals : result.homeGoals
  const oppLabel  = userIsHome ? result.awayLabel : result.homeLabel
  const userScorers = userIsHome ? result.homeScorers : result.awayScorers
  const oppScorers  = userIsHome ? result.awayScorers : result.homeScorers
  const won       = userGoals > oppGoals || (result.penalties && result.penHome > result.penAway)

  return (
    <div style={{
      backgroundColor: C.surface,
      border: `1px solid ${won ? C.gold : C.danger}`,
      borderRadius: '10px',
      padding: '1.5rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textDim, marginBottom: '1.25rem' }}>
        {userCountry} vs {oppLabel}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700', fontSize: '0.95rem', color: C.text }}>{userCountry}</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.25rem', fontWeight: '800', color: C.gold, minWidth: '90px', textAlign: 'center', letterSpacing: '-0.03em' }}>
          {userGoals}–{oppGoals}
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '600', fontSize: '0.9rem', color: C.textSub }}>{oppLabel}</div>
      </div>

      {result.penalties && (
        <div style={{ fontSize: '0.78rem', color: C.cyan, marginBottom: '0.75rem' }}>
          Penalties: {result.penHome}–{result.penAway}
        </div>
      )}
      {(userScorers.length > 0 || oppScorers.length > 0) && (
        <div style={{ fontSize: '0.75rem', color: C.textDim, marginBottom: '1rem' }}>
          {userScorers.length > 0 && <div>⚽ {userScorers.join(', ')}</div>}
          {oppScorers.length > 0 && <div style={{ opacity: 0.7 }}>⚽ {oppScorers.join(', ')}</div>}
        </div>
      )}

      <div style={{
        display: 'inline-block',
        fontSize: '0.7rem', fontWeight: '700',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: won ? C.gold : C.danger,
        backgroundColor: won ? C.goldGlow : C.dangerGlow,
        padding: '0.25rem 0.75rem', borderRadius: '99px',
      }}>
        {won ? 'Victory' : 'Eliminated'}
      </div>
    </div>
  )
}

function GroupTable({ group, userCountry }) {
  const isUser = t => t.isUser
  return (
    <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{
        backgroundColor: C.surfaceHi, padding: '0.5rem 1rem',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '0.7rem', fontWeight: '700',
        letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textSub,
      }}>
        Group {group.name}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ color: C.textDim, fontSize: '0.68rem', letterSpacing: '0.05em' }}>
            <th style={{ padding: '0.4rem 1rem', textAlign: 'left', fontWeight: '500' }}>Team</th>
            {['P','W','D','L','Pts'].map(h => (
              <th key={h} style={{ padding: '0.4rem 0.5rem', textAlign: 'center', fontWeight: '500' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {group.teams.map((t, i) => (
            <tr key={t.country + t.year} style={{
              borderTop: `1px solid ${C.border}`,
              backgroundColor: isUser(t) ? 'rgba(124,92,252,0.08)' : 'transparent',
            }}>
              <td style={{ padding: '0.4rem 1rem', color: isUser(t) ? C.accent : i < 2 ? C.text : C.textSub, fontWeight: isUser(t) ? '700' : '400' }}>
                {isUser(t) ? '★ ' : ''}{teamLabel(t)}
              </td>
              <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center', color: C.textDim }}>{(t.w||0)+(t.d||0)+(t.l||0)}</td>
              <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center', color: C.textDim }}>{t.w||0}</td>
              <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center', color: C.textDim }}>{t.d||0}</td>
              <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center', color: C.textDim }}>{t.l||0}</td>
              <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center', fontWeight: '700', color: C.gold }}>{t.pts||0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
export default function TournamentSim({ team, coach, country, onComplete, onNewGame }) {
  const userTeam = useMemo(() => ({
    country,
    year: null,
    avgRating: calcTeamRating(team, coach),
    players: team,
    isUser: true,
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load historical AI teams async
  const [allTeams, setAllTeams] = useState(null)
  const [loadingTeams, setLoadingTeams] = useState(true)

  useEffect(() => {
    generateHistoricalAITeams(country, null, 31)
      .then(aiTeams => {
        setAllTeams([userTeam, ...aiTeams])
        setLoadingTeams(false)
      })
      .catch(() => {
        // Fallback to tier-based AI teams
        setAllTeams([userTeam, ...generateAITeams(country, 31)])
        setLoadingTeams(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const rawGroups = useMemo(() => allTeams ? createGroups(allTeams) : null, [allTeams])

  const [phase, setPhase] = useState('groups')
  const [simGroups, setSimGroups] = useState(null)
  const [roundIdx, setRoundIdx] = useState(0)
  const [pendingMatch, setPendingMatch] = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [campaign, setCampaign] = useState({ gf: 0, ga: 0, results: [], wins: 0 })

  const userGroupRaw = rawGroups?.find(g => g.teams.some(t => t.isUser))

  // ── Group stage ──────────────────────────────────────────────────────────
  const simulateGroupStage = () => {
    const simmed = rawGroups.map(simulateGroup)
    setSimGroups(simmed)
    const ug = simmed.find(g => g.teams.some(t => t.isUser))
    const userMatches = (ug.matches || []).map(m => {
      // Attach team labels to all results for display
      const homeTeam = ug.teams.find(t => t.country === m.home)
      const awayTeam = ug.teams.find(t => t.country === m.away)
      return {
        ...m,
        homeLabel: homeTeam ? teamLabel(homeTeam) : m.home,
        awayLabel: awayTeam ? teamLabel(awayTeam) : m.away,
      }
    }).filter(m => m.home === country || m.away === country)
    let gf = 0, ga = 0, wins = 0
    for (const m of userMatches) {
      const myGoals = m.home === country ? m.homeGoals : m.awayGoals
      const theirGoals = m.home === country ? m.awayGoals : m.homeGoals
      gf += myGoals; ga += theirGoals
      if (myGoals > theirGoals) wins++
    }
    setCampaign(c => ({ ...c, gf: c.gf + gf, ga: c.ga + ga, wins: c.wins + wins, results: [...c.results, ...userMatches] }))
    setPhase('group_results')
  }

  const advanceToKnockout = () => {
    const qualifiers = simGroups.flatMap(g => [g.teams[0], g.teams[1]])
    if (!qualifiers.some(t => t.isUser)) {
      onComplete(buildResult(campaign, false, 'Group Stage'))
      return
    }
    setPhase('knockout')
    startRound(qualifiers, 0)
  }

  const startRound = (teams, rIdx) => {
    setRoundIdx(rIdx)
    const shuffled = [...teams].sort(() => Math.random() - 0.5)
    const pairs = []
    for (let i = 0; i < shuffled.length; i += 2) pairs.push([shuffled[i], shuffled[i + 1]])

    const userPairIdx = pairs.findIndex(([h, a]) => h.isUser || a.isUser)
    const [h, a] = pairs[userPairIdx]
    const otherWinners = pairs
      .filter((_, i) => i !== userPairIdx)
      .map(([ph, pa]) => simulateKnockoutMatch(ph, pa).winner)

    setPendingMatch({ home: h.isUser ? h : a, away: h.isUser ? a : h, otherWinners })
    setMatchResult(null)
    setPhase('match_preview')
  }

  const playMatch = () => {
    const result = simulateKnockoutMatch(pendingMatch.home, pendingMatch.away, team)
    // Attach display labels to result for ScoreBox
    result.homeLabel = teamLabel(pendingMatch.home)
    result.awayLabel = teamLabel(pendingMatch.away)
    const userWon = result.winner.isUser
    const myGoals = result.home === country ? result.homeGoals : result.awayGoals
    const theirGoals = result.home === country ? result.awayGoals : result.homeGoals
    setCampaign(c => ({
      ...c, gf: c.gf + myGoals, ga: c.ga + theirGoals,
      wins: c.wins + (userWon ? 1 : 0),
      results: [...c.results, result],
    }))
    setMatchResult({ ...result, userWon })
    setPhase('match_result')
  }

  const afterMatch = () => {
    if (!matchResult.userWon) {
      onComplete(buildResult(campaign, false, ROUNDS[roundIdx]))
      return
    }
    const newRemaining = [matchResult.winner, ...pendingMatch.otherWinners]
    if (roundIdx + 1 >= ROUNDS.length) {
      onComplete(buildResult(campaign, true, 'Final'))
      return
    }
    startRound(newRemaining, roundIdx + 1)
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (loadingTeams) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div className="spinner" style={{ margin: '0 auto 1.5rem' }} />
        <p style={{ color: C.textSub, fontSize: '0.9rem' }}>Assembling the field…</p>
        <p style={{ color: C.textDim, fontSize: '0.8rem', marginTop: '0.5rem' }}>Loading historical squads</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
      {onNewGame && (
        <button
          onClick={onNewGame}
          style={{ ...S.btnGhost, marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.text }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub }}
        >
          ← Start over
        </button>
      )}
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p style={S.label}>World Cup Tournament</p>
        <h1 style={{ ...S.h1, marginTop: '0.5rem' }}>{country}</h1>
        <p style={{ color: C.textDim, fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Team rating: <span style={{ color: C.gold, fontWeight: '700' }}>{userTeam.avgRating.toFixed(0)}</span>/100
        </p>
      </div>

      {/* ── Phase: groups ── */}
      {phase === 'groups' && rawGroups && (
        <>
          <div style={{
            ...S.card,
            textAlign: 'center', marginBottom: '2rem', padding: '2rem',
            borderColor: C.borderLight,
          }}>
            <p style={{ color: C.textSub, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              Your group:{' '}
              <strong style={{ color: C.accent, fontFamily: "'Space Grotesk', sans-serif" }}>
                Group {userGroupRaw?.name ?? '?'}
              </strong>
            </p>
            <p style={{ color: C.textDim, fontSize: '0.8rem', marginBottom: '1.75rem' }}>
              {userGroupRaw?.teams.map(teamLabel).join(' · ')}
            </p>
            <Btn onClick={simulateGroupStage}>Simulate Group Stage →</Btn>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {rawGroups.map(g => <GroupTable key={g.name} group={g} userCountry={country} />)}
          </div>
        </>
      )}

      {/* ── Phase: group_results ── */}
      {phase === 'group_results' && simGroups && (() => {
        const ug = simGroups.find(g => g.teams.some(t => t.isUser))
        const qualified = ug.teams.findIndex(t => t.isUser) < 2
        const userMatches = (ug.matches || []).filter(m => m.home === country || m.away === country)
        return (
          <>
            <div style={{
              ...S.card,
              textAlign: 'center', marginBottom: '1.75rem', padding: '2rem',
              borderColor: qualified ? C.gold : C.danger,
            }}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.4rem', fontWeight: '800',
                color: qualified ? C.gold : C.danger, marginBottom: '0.5rem',
              }}>
                {qualified ? '✓ Qualified for Round of 16' : '✗ Eliminated in Group Stage'}
              </div>
              <p style={{ color: C.textSub, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {qualified ? 'Your team advances to the knockout stage.' : 'Better luck next time.'}
              </p>
              <Btn onClick={advanceToKnockout} color={qualified ? C.gold : C.accent}>
                {qualified ? 'Continue to Round of 16 →' : 'See Final Results'}
              </Btn>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
              {userMatches.map((m, i) => <ScoreBox key={i} result={m} userCountry={country} />)}
            </div>

            <p style={{ ...S.label, marginBottom: '0.75rem' }}>All Group Standings</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {simGroups.map(g => <GroupTable key={g.name} group={g} userCountry={country} />)}
            </div>
          </>
        )
      })()}

      {/* ── Phase: match_preview ── */}
      {phase === 'match_preview' && pendingMatch && (
        <div style={{ textAlign: 'center' }}>
          <p style={S.label}>{ROUNDS[roundIdx]}</p>

          <div style={{
            ...S.card,
            maxWidth: '440px', margin: '1.5rem auto 2rem',
            padding: '2.5rem 2rem',
            borderColor: C.borderLight,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '800', fontSize: '1.1rem', color: C.text }}>
                  {country}
                </div>
                <div style={{ fontSize: '0.73rem', color: C.textDim, marginTop: '0.2rem' }}>
                  {userTeam.avgRating.toFixed(0)} rating
                </div>
              </div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.6rem', fontWeight: '800', color: C.border, letterSpacing: '-0.02em',
              }}>vs</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700', fontSize: '1.05rem', color: C.textSub }}>
                  {teamLabel(pendingMatch.away)}
                </div>
                <div style={{ fontSize: '0.73rem', color: C.textDim, marginTop: '0.2rem' }}>
                  {pendingMatch.away.avgRating.toFixed(0)} rating
                </div>
              </div>
            </div>
            <Btn onClick={playMatch}>▶ Play Match</Btn>
          </div>

          {pendingMatch.otherWinners.length > 0 && (
            <p style={{ color: C.textDim, fontSize: '0.8rem' }}>
              {pendingMatch.otherWinners.length} other {ROUNDS[roundIdx].toLowerCase()} matches simulated simultaneously
            </p>
          )}
        </div>
      )}

      {/* ── Phase: match_result ── */}
      {phase === 'match_result' && matchResult && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ ...S.label, marginBottom: '1.25rem' }}>{ROUNDS[roundIdx]} — Result</p>
          <div style={{ maxWidth: '440px', margin: '0 auto 2rem' }}>
            <ScoreBox result={matchResult} userCountry={country} />
          </div>
          <Btn onClick={afterMatch} color={matchResult.userWon ? C.gold : C.accent}>
            {matchResult.userWon
              ? roundIdx + 1 < ROUNDS.length ? `Continue to ${ROUNDS[roundIdx + 1]} →` : '🏆 Claim the trophy!'
              : 'See Final Results'}
          </Btn>
        </div>
      )}
    </div>
  )
}
