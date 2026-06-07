import React, { useState, useMemo } from 'react'
import { generateAITeams, calcTeamRating, createGroups, simulateGroup, simulateKnockoutMatch } from '../utils/simulator'
import { C } from '../styles/theme'

const ROUNDS = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final']

function buildResult(campaign, champion, exitRound) {
  const allScorers = campaign.results.flatMap(r => r.homeScorers || [])
  const scorerCount = {}
  for (const s of allScorers) scorerCount[s] = (scorerCount[s] || 0) + 1
  const mvpEntry = Object.entries(scorerCount).sort((a, b) => b[1] - a[1])[0]
  const mvp = mvpEntry ? mvpEntry[0] : '—'
  return {
    champion,
    exitRound,
    mvp,
    matches: campaign.results.length,
    goalsFor: campaign.gf,
    goalsAgainst: campaign.ga,
    results: campaign.results,
  }
}

const btn = (color = C.pink) => ({
  background: color,
  border: `1px solid ${color}`,
  color: '#fff',
  fontWeight: '700',
  padding: '0.75rem 1.75rem',
  cursor: 'pointer',
  textTransform: 'uppercase',
  borderRadius: '4px',
  fontSize: '0.9rem',
  letterSpacing: '0.05em',
})

function ScoreBox({ result, country }) {
  const userIsHome = result.home === country
  const userGoals = userIsHome ? result.homeGoals : result.awayGoals
  const oppGoals = userIsHome ? result.awayGoals : result.homeGoals
  const opp = userIsHome ? result.away : result.home
  const scorers = result.homeScorers || []
  const won = userGoals > oppGoals || (result.penalties && result.penHome > result.penAway)

  return (
    <div style={{ backgroundColor: C.card, border: `2px solid ${won ? C.gold : C.pink}`, borderRadius: '8px', padding: '1.5rem', textAlign: 'center', boxShadow: `0 0 20px ${won ? C.gold : C.pink}33` }}>
      <div style={{ color: C.cyan, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
        {country} vs {opp}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#e0e0e0', fontWeight: '700', fontSize: '0.95rem' }}>{country}</div>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: C.gold, minWidth: '100px', textAlign: 'center' }}>
          {userGoals} – {oppGoals}
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ color: '#a0a0a0', fontWeight: '600', fontSize: '0.95rem' }}>{opp}</div>
        </div>
      </div>
      {result.penalties && (
        <div style={{ color: C.cyan, fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          (Penalties: {result.penHome} – {result.penAway})
        </div>
      )}
      {scorers.length > 0 && (
        <div style={{ color: '#a0a0a0', fontSize: '0.78rem' }}>
          ⚽ {scorers.join(', ')}
        </div>
      )}
      <div style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: '800', color: won ? C.gold : C.pink }}>
        {won ? '✓ WIN' : '✗ LOSS'}
      </div>
    </div>
  )
}

function GroupTable({ group, country }) {
  const isUser = (t) => t.country === country || t.isUser
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid #333`, borderRadius: '4px', overflow: 'hidden', fontSize: '0.8rem' }}>
      <div style={{ backgroundColor: C.deep, padding: '0.4rem 0.75rem', color: C.cyan, fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
        GROUP {group.name}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#666', fontSize: '0.7rem' }}>
            <th style={{ padding: '0.3rem 0.75rem', textAlign: 'left' }}>Team</th>
            <th style={{ padding: '0.3rem', textAlign: 'center' }}>P</th>
            <th style={{ padding: '0.3rem', textAlign: 'center' }}>W</th>
            <th style={{ padding: '0.3rem', textAlign: 'center' }}>D</th>
            <th style={{ padding: '0.3rem', textAlign: 'center' }}>L</th>
            <th style={{ padding: '0.3rem 0.75rem', textAlign: 'center' }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.teams.map((t, i) => (
            <tr key={t.country} style={{ borderTop: '1px solid #222', backgroundColor: isUser(t) ? '#1a2a1a' : 'transparent' }}>
              <td style={{ padding: '0.35rem 0.75rem', color: isUser(t) ? C.gold : i < 2 ? '#e0e0e0' : '#a0a0a0', fontWeight: isUser(t) ? '700' : '400' }}>
                {isUser(t) ? '★ ' : ''}{t.country}
              </td>
              <td style={{ padding: '0.35rem', textAlign: 'center', color: '#a0a0a0' }}>{(t.w || 0) + (t.d || 0) + (t.l || 0)}</td>
              <td style={{ padding: '0.35rem', textAlign: 'center', color: '#a0a0a0' }}>{t.w || 0}</td>
              <td style={{ padding: '0.35rem', textAlign: 'center', color: '#a0a0a0' }}>{t.d || 0}</td>
              <td style={{ padding: '0.35rem', textAlign: 'center', color: '#a0a0a0' }}>{t.l || 0}</td>
              <td style={{ padding: '0.35rem 0.75rem', textAlign: 'center', color: C.gold, fontWeight: '700' }}>{t.pts || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TournamentSim({ team, coach, country, onComplete }) {
  const userTeam = useMemo(() => ({
    country,
    avgRating: calcTeamRating(team, coach),
    players: team,
    isUser: true,
  }), [])

  const allTeams = useMemo(() => [userTeam, ...generateAITeams(country)], [])
  const rawGroups = useMemo(() => createGroups(allTeams), [])

  const [phase, setPhase] = useState('groups')
  const [simGroups, setSimGroups] = useState(null)
  const [remaining, setRemaining] = useState([])
  const [roundIdx, setRoundIdx] = useState(0)
  const [pendingMatch, setPendingMatch] = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [campaign, setCampaign] = useState({ gf: 0, ga: 0, results: [], wins: 0 })

  const userGroupRaw = rawGroups.find(g => g.teams.some(t => t.isUser))

  // ── Phase: groups ──────────────────────────────────────────────
  const simulateGroupStage = () => {
    const simmed = rawGroups.map(simulateGroup)
    setSimGroups(simmed)
    const ug = simmed.find(g => g.teams.some(t => t.isUser))
    const userMatches = (ug.matches || []).filter(m => m.home === country || m.away === country)
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

  // ── Phase: advance to knockout ──────────────────────────────────
  const advanceToKnockout = () => {
    const qualifiers = simGroups.flatMap(g => [g.teams[0], g.teams[1]])
    if (!qualifiers.some(t => t.isUser)) {
      onComplete(buildResult(campaign, false, 'Group Stage'))
      return
    }
    setRemaining(qualifiers)
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

  // ── Phase: play the match ───────────────────────────────────────
  const playMatch = () => {
    const result = simulateKnockoutMatch(pendingMatch.home, pendingMatch.away, team)
    const userWon = result.winner.isUser
    const myGoals = result.home === country ? result.homeGoals : result.awayGoals
    const theirGoals = result.home === country ? result.awayGoals : result.homeGoals
    setCampaign(c => ({ ...c, gf: c.gf + myGoals, ga: c.ga + theirGoals, wins: c.wins + (userWon ? 1 : 0), results: [...c.results, result] }))
    const newRemaining = userWon ? [result.winner, ...pendingMatch.otherWinners] : pendingMatch.otherWinners
    setRemaining(newRemaining)
    setMatchResult({ ...result, userWon })
    setPhase('match_result')
  }

  const afterMatch = () => {
    if (!matchResult.userWon) {
      onComplete(buildResult(campaign, false, ROUNDS[roundIdx]))
      return
    }
    if (roundIdx + 1 >= ROUNDS.length) {
      onComplete(buildResult(campaign, true, 'Final'))
      return
    }
    startRound(remaining, roundIdx + 1)
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

      {/* Header */}
      <h1 style={{ color: C.pink, fontSize: '2.5rem', fontWeight: '900', textAlign: 'center', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
        World Cup Tournament
      </h1>
      <p style={{ color: C.cyan, textAlign: 'center', marginBottom: '2rem' }}>
        {country} • Rating: {userTeam.avgRating.toFixed(0)}/100
      </p>

      {/* ── Phase: groups ── */}
      {phase === 'groups' && (
        <>
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.pink}`, borderRadius: '4px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#e0e0e0', marginBottom: '0.5rem' }}>Your group: <strong style={{ color: C.gold }}>Group {userGroupRaw ? userGroupRaw.name : '?'}</strong></p>
            <p style={{ color: '#a0a0a0', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {userGroupRaw ? userGroupRaw.teams.map(t => t.country).join(' • ') : ''}
            </p>
            <button style={btn(C.pink)} onClick={simulateGroupStage}>Simulate Group Stage</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {rawGroups.map(g => (
              <GroupTable key={g.name} group={g} country={country} />
            ))}
          </div>
        </>
      )}

      {/* ── Phase: group_results ── */}
      {phase === 'group_results' && simGroups && (
        <>
          {/* User's group results */}
          {(() => {
            const ug = simGroups.find(g => g.teams.some(t => t.isUser))
            const qualified = ug.teams.findIndex(t => t.isUser) < 2
            const userMatches = (ug.matches || []).filter(m => m.home === country || m.away === country)
            return (
              <>
                <div style={{ backgroundColor: C.card, border: `1px solid ${qualified ? C.gold : C.pink}`, borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: qualified ? C.gold : C.pink, marginBottom: '0.5rem' }}>
                    {qualified ? '✓ QUALIFIED!' : '✗ Eliminated in Group Stage'}
                  </div>
                  <p style={{ color: '#a0a0a0', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    {qualified ? 'Your team advanced to the Round of 16!' : 'Better luck next time.'}
                  </p>
                  <button style={btn(qualified ? C.gold : C.pink)} onClick={advanceToKnockout}>
                    {qualified ? 'Continue to Round of 16 →' : 'See Final Results'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {userMatches.map((m, i) => <ScoreBox key={i} result={m} country={country} />)}
                </div>

                <h3 style={{ color: C.cyan, fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.1em' }}>All Group Standings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {simGroups.map(g => <GroupTable key={g.name} group={g} country={country} />)}
                </div>
              </>
            )
          })()}
        </>
      )}

      {/* ── Phase: match_preview ── */}
      {phase === 'match_preview' && pendingMatch && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: C.gold, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            {ROUNDS[roundIdx]}
          </div>
          <div style={{ backgroundColor: C.card, border: `2px solid ${C.gold}`, borderRadius: '8px', padding: '2.5rem 2rem', maxWidth: '480px', margin: '0 auto 2rem', boxShadow: `0 0 30px ${C.gold}20` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#e0e0e0' }}>{country}</div>
                <div style={{ fontSize: '0.75rem', color: C.cyan, marginTop: '0.25rem' }}>
                  {userTeam.avgRating.toFixed(0)} rating
                </div>
              </div>
              <div style={{ fontSize: '2rem', color: '#555', fontWeight: '900' }}>vs</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#a0a0a0' }}>{pendingMatch.away.country}</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                  {pendingMatch.away.avgRating.toFixed(0)} rating
                </div>
              </div>
            </div>
            <button style={{ ...btn(C.pink), fontSize: '1rem', padding: '1rem 2.5rem' }} onClick={playMatch}>
              ▶ Play Match
            </button>
          </div>
          {pendingMatch.otherWinners.length > 0 && (
            <p style={{ color: '#555', fontSize: '0.8rem' }}>
              {pendingMatch.otherWinners.length} other {ROUNDS[roundIdx]} matches will be simulated simultaneously.
            </p>
          )}
        </div>
      )}

      {/* ── Phase: match_result ── */}
      {phase === 'match_result' && matchResult && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: C.gold, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            {ROUNDS[roundIdx]} Result
          </div>
          <div style={{ maxWidth: '480px', margin: '0 auto 2rem' }}>
            <ScoreBox result={matchResult} country={country} />
          </div>
          <button style={btn(matchResult.userWon ? C.gold : C.pink)} onClick={afterMatch}>
            {matchResult.userWon
              ? roundIdx + 1 < ROUNDS.length ? `Continue to ${ROUNDS[roundIdx + 1]} →` : '🏆 Victory!'
              : 'See Final Results'}
          </button>
        </div>
      )}
    </div>
  )
}
