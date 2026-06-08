import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  generateHistoricalAITeams, generateAITeams,
  calcTeamRating, createGroups, simulateGroup, simulateKnockoutMatch,
} from '../utils/simulator'
import { C, useTheme } from '../styles/theme'

const ROUNDS = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final']

function teamLabel(team) {
  if (team.isUser) return team.country
  return team.year ? `${team.country} (${team.year})` : team.country
}

function buildResult(campaign, champion, exitRound, autoPlay) {
  const scorerCount = {}
  for (const s of campaign.results.flatMap(r => r.awayIsUser ? (r.awayScorers || []) : (r.homeScorers || []))) {
    scorerCount[s] = (scorerCount[s] || 0) + 1
  }
  const mvpEntry = Object.entries(scorerCount).sort((a, b) => b[1] - a[1])[0]
  return {
    champion, exitRound, autoPlay: autoPlay ?? false,
    mvp: mvpEntry ? mvpEntry[0] : '—',
    matches: campaign.results.length,
    goalsFor: campaign.gf,
    goalsAgainst: campaign.ga,
    results: campaign.results,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────

function Btn({ children, onClick, color, disabled = false }) {
  const { C, S } = useTheme()
  const bg = color || C.accent
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...S.btn,
        background: bg,
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

function ScoreBox({ result, userCountry, isGroupStage = false }) {
  const { C } = useTheme()
  const userIsHome = result.home === userCountry
  const userGoals = userIsHome ? result.homeGoals : result.awayGoals
  const oppGoals  = userIsHome ? result.awayGoals : result.homeGoals
  const oppLabel  = userIsHome ? result.awayLabel : result.homeLabel
  const userScorers = userIsHome ? result.homeScorers : result.awayScorers
  const oppScorers  = userIsHome ? result.awayScorers : result.homeScorers
  const won  = userGoals > oppGoals || (result.penalties && result.penHome > result.penAway && userIsHome) || (result.penalties && result.penAway > result.penHome && !userIsHome)
  const drew = !won && result.draw && !result.penalties

  const badgeText  = won ? 'Victory' : drew ? 'Draw' : isGroupStage ? 'Defeat' : 'Eliminated'
  const badgeColor = won ? C.gold : drew ? C.cyan : C.danger
  const badgeBg    = won ? C.goldGlow : drew ? C.cyanGlow : C.dangerGlow
  const borderColor = won ? C.gold : drew ? C.cyan : C.danger

  return (
    <div style={{
      backgroundColor: C.surface,
      border: `1px solid ${borderColor}`,
      borderRadius: '10px',
      padding: '1.5rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textDim, marginBottom: '1.25rem' }}>
        {userCountry} vs {oppLabel}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: '700', fontSize: '0.95rem', color: C.text }}>{userCountry}</div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.25rem', fontWeight: '800', color: C.gold, minWidth: '90px', textAlign: 'center', letterSpacing: '-0.03em' }}>
          {userGoals}–{oppGoals}
        </div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: '600', fontSize: '0.9rem', color: C.textSub }}>{oppLabel}</div>
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
        color: badgeColor,
        backgroundColor: badgeBg,
        padding: '0.25rem 0.75rem', borderRadius: '99px',
      }}>
        {badgeText}
      </div>
    </div>
  )
}

const POS_ORDER_T = { GK: 0, DEF: 1, MID: 2, FWD: 3 }

function SquadOverlay({ team: t, onClose }) {
  const { C } = useTheme()
  const POS_COLORS_T = { GK: C.gold, DEF: C.cyan, MID: C.accent, FWD: C.fwd }
  if (!t) return null
  const players = [...(t.players || [])].sort(
    (a, b) => (POS_ORDER_T[a.position] ?? 9) - (POS_ORDER_T[b.position] ?? 9)
  )
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.borderLight}`,
          borderRadius: '12px',
          width: '100%', maxWidth: '420px',
          maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: C.surfaceHi,
        }}>
          <div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: '700', fontSize: '1.1rem', color: C.text }}>
              {teamLabel(t)}
            </div>
            <div style={{ fontSize: '0.72rem', color: C.textDim, marginTop: '0.15rem' }}>
              Avg rating: <span style={{ color: C.gold, fontWeight: '700' }}>{t.avgRating?.toFixed(0)}</span>
              {players.length > 0 && <span> · {players.length} players</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: C.textDim,
              fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1,
              padding: '0.25rem 0.4rem', borderRadius: '6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.backgroundColor = C.border }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textDim; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            ✕
          </button>
        </div>

        {/* Player list */}
        <div style={{ overflowY: 'auto', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {players.length === 0 ? (
            <p style={{ color: C.textDim, fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>No squad data available</p>
          ) : players.map((p, i) => {
            const color = POS_COLORS_T[p.position] || C.accent
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.4rem 0.65rem',
                backgroundColor: C.surfaceHi,
                borderRadius: '7px',
                fontSize: '0.82rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{
                    fontSize: '0.56rem', fontWeight: '700',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    color, backgroundColor: `${color}18`,
                    padding: '0.12rem 0.4rem', borderRadius: '4px',
                    minWidth: '2.4rem', textAlign: 'center',
                  }}>
                    {p.position}
                  </span>
                  <span style={{ color: C.text, fontWeight: '500' }}>{p.name}</span>
                </div>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: '700', color: C.gold, fontSize: '0.95rem' }}>
                  {p.rating}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MatchLog({ results, userCountry }) {
  const { C } = useTheme()
  if (!results || results.length === 0) return null
  return (
    <div style={{
      backgroundColor: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: '10px',
      overflow: 'hidden',
      marginTop: '1.5rem',
      maxHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        backgroundColor: C.surfaceHi,
        padding: '0.6rem 1rem',
        fontFamily: "'Oswald', sans-serif",
        fontSize: '0.7rem',
        fontWeight: '700',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: C.textSub,
        borderBottom: `1px solid ${C.border}`,
      }}>
        Match Log
      </div>
      <div style={{ overflowY: 'auto', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {results.map((m, i) => {
          const userIsHome = m.home === userCountry
          const userGoals = userIsHome ? m.homeGoals : m.awayGoals
          const oppGoals = userIsHome ? m.awayGoals : m.homeGoals
          const oppLabel = userIsHome ? m.awayLabel : m.homeLabel
          const won = userGoals > oppGoals || (m.penalties && ((userIsHome && m.penHome > m.penAway) || (!userIsHome && m.penAway > m.penHome)))
          const drew = !won && m.draw && !m.penalties
          const badgeBg = won ? C.goldGlow : drew ? C.cyanGlow : C.dangerGlow
          const badgeColor = won ? C.gold : drew ? C.cyan : C.danger

          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              backgroundColor: C.surfaceHi,
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: C.textDim,
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ color: C.text, fontWeight: '500' }}>{userCountry}</span>
                <span style={{ color: C.textDim }}> vs </span>
                <span style={{ color: C.text, fontWeight: '500' }}>{oppLabel}</span>
              </div>
              <div style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: '700',
                color: badgeColor,
                fontSize: '0.8rem',
                minWidth: '32px',
                textAlign: 'center',
              }}>
                {userGoals}–{oppGoals}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GroupTable({ group, userCountry, onTeamClick }) {
  const { C, S } = useTheme()
  const isUser = t => t.isUser
  return (
    <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{
        backgroundColor: C.surfaceHi, padding: '0.5rem 1rem',
        fontFamily: "'Oswald', sans-serif",
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
            <tr
              key={t.country + t.year}
              onClick={() => onTeamClick(t)}
              style={{
                borderTop: `1px solid ${C.border}`,
                backgroundColor: isUser(t) ? 'rgba(124,92,252,0.08)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isUser(t) ? 'rgba(124,92,252,0.16)' : C.surfaceHi }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = isUser(t) ? 'rgba(124,92,252,0.08)' : 'transparent' }}
            >
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
export default function TournamentSim({ team, coach, country, onComplete, onNewGame, analytics, campaignId }) {
  const { C, S } = useTheme()
  const userTeam = useMemo(() => ({
    country,
    year: null,
    avgRating: calcTeamRating(team, coach),
    players: team,
    isUser: true,
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  const [allTeams, setAllTeams] = useState(null)
  const [loadingTeams, setLoadingTeams] = useState(true)

  useEffect(() => {
    generateHistoricalAITeams(country, null, 31)
      .then(aiTeams => {
        setAllTeams([userTeam, ...aiTeams])
        setLoadingTeams(false)
      })
      .catch(() => {
        setAllTeams([userTeam, ...generateAITeams(country, 31)])
        setLoadingTeams(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const rawGroups = useMemo(() => allTeams ? createGroups(allTeams) : null, [allTeams])

  const [phase, setPhase] = useState('groups')
  const [simGroups, setSimGroups] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [autoPlay, setAutoPlay] = useState(false)

  // Group stage playback
  const [groupMatches, setGroupMatches] = useState([])
  const [groupMatchIdx, setGroupMatchIdx] = useState(0)
  const [groupMatchResult, setGroupMatchResult] = useState(null)

  // Knockout stage
  const [roundIdx, setRoundIdx] = useState(0)
  const [pendingMatch, setPendingMatch] = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [campaign, setCampaign] = useState({ gf: 0, ga: 0, results: [], wins: 0 })

  // Refs to keep latest callbacks accessible inside the auto-play effect
  const simulateGroupStageRef = useRef(null)
  const revealGroupMatchRef    = useRef(null)
  const nextGroupMatchRef      = useRef(null)
  const advanceToKnockoutRef   = useRef(null)
  const playMatchRef           = useRef(null)
  const afterMatchRef          = useRef(null)

  const userGroupRaw = rawGroups?.find(g => g.teams.some(t => t.isUser))

  // ── Auto-play effect ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoPlay) return
    const PREVIEW_DELAY = 900
    const RESULT_DELAY  = 2200

    const delays = {
      groups:              PREVIEW_DELAY,
      group_match_preview: PREVIEW_DELAY,
      group_match_result:  RESULT_DELAY,
      group_results:       RESULT_DELAY,
      match_preview:       PREVIEW_DELAY,
      match_result:        RESULT_DELAY,
    }
    const actions = {
      groups:              () => simulateGroupStageRef.current?.(),
      group_match_preview: () => revealGroupMatchRef.current?.(),
      group_match_result:  () => nextGroupMatchRef.current?.(),
      group_results:       () => advanceToKnockoutRef.current?.(),
      match_preview:       () => playMatchRef.current?.(),
      match_result:        () => afterMatchRef.current?.(),
    }
    if (!actions[phase]) return
    const id = setTimeout(actions[phase], delays[phase])
    return () => clearTimeout(id)
  }, [autoPlay, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Group stage ──────────────────────────────────────────────────────────
  const simulateGroupStage = () => {
    const simmed = rawGroups.map(simulateGroup)
    setSimGroups(simmed)

    const ug = simmed.find(g => g.teams.some(t => t.isUser))
    const userMatches = (ug.matches || []).map(m => {
      const homeTeam = ug.teams.find(t => t.country === m.home)
      const awayTeam = ug.teams.find(t => t.country === m.away)
      return {
        ...m,
        homeLabel: homeTeam ? teamLabel(homeTeam) : m.home,
        awayLabel: awayTeam ? teamLabel(awayTeam) : m.away,
        homeRating: homeTeam?.avgRating,
        awayRating: awayTeam?.avgRating,
      }
    }).filter(m => m.homeIsUser || m.awayIsUser)

    let gf = 0, ga = 0, wins = 0
    for (const m of userMatches) {
      const myGoals = m.home === country ? m.homeGoals : m.awayGoals
      const theirGoals = m.home === country ? m.awayGoals : m.homeGoals
      gf += myGoals; ga += theirGoals
      if (myGoals > theirGoals) wins++
    }
    setCampaign(c => ({ ...c, gf: c.gf + gf, ga: c.ga + ga, wins: c.wins + wins, results: [...c.results, ...userMatches] }))

    setGroupMatches(userMatches)
    setGroupMatchIdx(0)
    setGroupMatchResult(null)
    setPhase('group_match_preview')
  }

  const revealGroupMatch = () => {
    setGroupMatchResult(groupMatches[groupMatchIdx])
    setPhase('group_match_result')
  }

  const nextGroupMatch = () => {
    if (groupMatchIdx + 1 < groupMatches.length) {
      setGroupMatchIdx(i => i + 1)
      setGroupMatchResult(null)
      setPhase('group_match_preview')
    } else {
      setPhase('group_results')
    }
  }

  const advanceToKnockout = () => {
    const qualifiers = simGroups.flatMap(g => [g.teams[0], g.teams[1]])
    if (!qualifiers.some(t => t.isUser)) {
      onComplete(buildResult(campaign, false, 'Group Stage', autoPlay))
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
    const result = simulateKnockoutMatch(pendingMatch.home, pendingMatch.away)
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
      onComplete(buildResult(campaign, false, ROUNDS[roundIdx], autoPlay))
      return
    }
    const newRemaining = [matchResult.winner, ...pendingMatch.otherWinners]
    if (roundIdx + 1 >= ROUNDS.length) {
      onComplete(buildResult(campaign, true, 'Final', autoPlay))
      return
    }
    startRound(newRemaining, roundIdx + 1)
  }

  // Keep refs in sync so the auto-play effect always calls the latest closures
  simulateGroupStageRef.current = simulateGroupStage
  revealGroupMatchRef.current   = revealGroupMatch
  nextGroupMatchRef.current     = nextGroupMatch
  advanceToKnockoutRef.current  = advanceToKnockout
  playMatchRef.current          = playMatch
  afterMatchRef.current         = afterMatch

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
    <>
    <SquadOverlay team={selectedTeam} onClose={() => setSelectedTeam(null)} />
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

        {/* Auto-play toggle */}
        <button
          onClick={() => setAutoPlay(v => {
            const next = !v
            if (analytics && campaignId) analytics.trackAutoPlayToggled(next, campaignId)
            return next
          })}
          style={{
            marginTop: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.4rem 1rem',
            borderRadius: '99px',
            border: `1.5px solid ${autoPlay ? C.cyan : C.border}`,
            background: autoPlay ? `${C.cyan}18` : 'transparent',
            color: autoPlay ? C.cyan : C.textDim,
            fontSize: '0.75rem',
            fontWeight: '600',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <span style={{
            display: 'inline-block',
            width: '7px', height: '7px',
            borderRadius: '50%',
            background: autoPlay ? C.cyan : C.textDim,
            boxShadow: autoPlay ? `0 0 6px ${C.cyan}` : 'none',
            transition: 'all 0.15s',
          }} />
          {autoPlay ? 'Auto ·  playing' : 'Auto · off'}
        </button>
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
              <strong style={{ color: C.accent, fontFamily: "'Oswald', sans-serif" }}>
                Group {userGroupRaw?.name ?? '?'}
              </strong>
            </p>
            <p style={{ color: C.textDim, fontSize: '0.8rem', marginBottom: '1.75rem' }}>
              {userGroupRaw?.teams.map(teamLabel).join(' · ')}
            </p>
            <Btn onClick={simulateGroupStage}>Simulate Group Stage →</Btn>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {rawGroups.map(g => <GroupTable key={g.name} group={g} userCountry={country} onTeamClick={setSelectedTeam} />)}
          </div>
        </>
      )}

      {/* ── Phase: group_match_preview ── */}
      {phase === 'group_match_preview' && groupMatches[groupMatchIdx] && (() => {
        const m = groupMatches[groupMatchIdx]
        const oppLabel = m.home === country ? m.awayLabel : m.homeLabel
        const oppRating = m.home === country ? m.awayRating : m.homeRating
        return (
          <div style={{ textAlign: 'center' }}>
            <p style={S.label}>Group Stage — Match {groupMatchIdx + 1} of {groupMatches.length}</p>
            <div style={{
              maxWidth: '440px', margin: '1.5rem auto 0',
            }}>
              <div style={{
                ...S.card,
                padding: '2.5rem 2rem',
                borderColor: C.borderLight,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: '800', fontSize: '1.1rem', color: C.text }}>
                      {country}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: C.textDim, marginTop: '0.2rem' }}>
                      {userTeam.avgRating.toFixed(0)} rating
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: '1.6rem', fontWeight: '800', color: C.border, letterSpacing: '-0.02em',
                  }}>vs</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: '700', fontSize: '1.05rem', color: C.textSub }}>
                      {oppLabel}
                    </div>
                    {oppRating != null && (
                      <div style={{ fontSize: '0.73rem', color: C.textDim, marginTop: '0.2rem' }}>
                        {oppRating.toFixed(0)} rating
                      </div>
                    )}
                  </div>
                </div>
                <Btn onClick={revealGroupMatch}>▶ Reveal Result</Btn>
              </div>
              {groupMatchIdx > 0 && <MatchLog results={groupMatches.slice(0, groupMatchIdx)} userCountry={country} />}
            </div>
          </div>
        )
      })()}

      {/* ── Phase: group_match_result ── */}
      {phase === 'group_match_result' && groupMatchResult && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ ...S.label, marginBottom: '1.25rem' }}>
            Group Stage — Match {groupMatchIdx + 1} of {groupMatches.length} — Result
          </p>
          <div style={{ maxWidth: '440px', margin: '0 auto 0' }}>
            <ScoreBox result={groupMatchResult} userCountry={country} isGroupStage />
            {groupMatchIdx > 0 && <MatchLog results={groupMatches.slice(0, groupMatchIdx)} userCountry={country} />}
          </div>
          <div style={{ marginTop: '2rem' }}>
            <Btn onClick={nextGroupMatch} color={C.gold}>
              {groupMatchIdx + 1 < groupMatches.length ? 'Next Match →' : 'See Group Standings →'}
            </Btn>
          </div>
        </div>
      )}

      {/* ── Phase: group_results ── */}
      {phase === 'group_results' && simGroups && (() => {
        const ug = simGroups.find(g => g.teams.some(t => t.isUser))
        const qualified = ug.teams.findIndex(t => t.isUser) < 2
        return (
          <>
            <div style={{
              ...S.card,
              textAlign: 'center', marginBottom: '1.75rem', padding: '2rem',
              borderColor: qualified ? C.gold : C.danger,
            }}>
              <div style={{
                fontFamily: "'Oswald', sans-serif",
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
              {groupMatches.map((m, i) => <ScoreBox key={i} result={m} userCountry={country} isGroupStage />)}
            </div>

            <p style={{ ...S.label, marginBottom: '0.75rem' }}>All Group Standings</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {simGroups.map(g => <GroupTable key={g.name} group={g} userCountry={country} onTeamClick={setSelectedTeam} />)}
            </div>
          </>
        )
      })()}

      {/* ── Phase: match_preview ── */}
      {phase === 'match_preview' && pendingMatch && (
        <div style={{ textAlign: 'center' }}>
          <p style={S.label}>{ROUNDS[roundIdx]}</p>

          <div style={{
            maxWidth: '440px', margin: '1.5rem auto 0',
          }}>
            <div style={{
              ...S.card,
              padding: '2.5rem 2rem',
              borderColor: C.borderLight,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: '800', fontSize: '1.1rem', color: C.text }}>
                    {country}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: C.textDim, marginTop: '0.2rem' }}>
                    {userTeam.avgRating.toFixed(0)} rating
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '1.6rem', fontWeight: '800', color: C.border, letterSpacing: '-0.02em',
                }}>vs</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: '700', fontSize: '1.05rem', color: C.textSub }}>
                    {teamLabel(pendingMatch.away)}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: C.textDim, marginTop: '0.2rem' }}>
                    {pendingMatch.away.avgRating.toFixed(0)} rating
                  </div>
                </div>
              </div>
              <Btn onClick={playMatch}>▶ Play Match</Btn>
            </div>
            {campaign.results.length > 0 && <MatchLog results={campaign.results} userCountry={country} />}
          </div>

          {pendingMatch.otherWinners.length > 0 && (
            <p style={{ color: C.textDim, fontSize: '0.8rem', marginTop: '1.5rem' }}>
              {pendingMatch.otherWinners.length} other {ROUNDS[roundIdx].toLowerCase()} matches simulated simultaneously
            </p>
          )}
        </div>
      )}

      {/* ── Phase: match_result ── */}
      {phase === 'match_result' && matchResult && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ ...S.label, marginBottom: '1.25rem' }}>{ROUNDS[roundIdx]} — Result</p>
          <div style={{ maxWidth: '440px', margin: '0 auto 0' }}>
            <ScoreBox result={matchResult} userCountry={country} />
            {campaign.results.length > 0 && <MatchLog results={campaign.results} userCountry={country} />}
          </div>
          <div style={{ marginTop: '2rem' }}>
            <Btn onClick={afterMatch} color={matchResult.userWon ? C.gold : C.accent}>
              {matchResult.userWon
                ? roundIdx + 1 < ROUNDS.length ? `Continue to ${ROUNDS[roundIdx + 1]} →` : '🏆 Claim the trophy!'
                : 'See Final Results'}
            </Btn>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
