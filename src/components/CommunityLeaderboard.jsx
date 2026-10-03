import React, { useEffect, useState } from 'react'
import { getCountryFlagUrl } from '../constants'
import { useTheme } from '../styles/theme'

export default function CommunityLeaderboard() {
  const { C, S } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetch('/data/community-stats.json')
      .then(res => {
        if (!res.ok) throw new Error(`community-stats missing (${res.status})`)
        return res.json()
      })
      .then(json => {
        if (active) setData(json)
      })
      .catch(() => {
        if (active) setData({ topNations: [], topFormations: [], topFormationsPicked: [], topCoaches: [] })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <section style={{ ...S.card, marginBottom: '2rem', borderColor: C.cyan }}>
        <h2 style={{ ...S.h1, marginBottom: '1rem' }}>Community Leaderboards</h2>
        <p style={{ color: C.textSub }}>Loading the latest picks from the community…</p>
      </section>
    )
  }

  const topNations = (data?.topNations || []).slice(0, 5)
  const topFormations = data?.topFormations || []
  const topFormationsPicked = data?.topFormationsPicked || []
  const topPlayersOverall = data?.topPlayersOverall || []
  const topCoaches = data?.topCoaches || []
  const topWinningTeam = data?.topWinningTeam || null
  const topWinningFormation = data?.topWinningFormation || null
  const totalStarts = Number(data?.totalStarts || 0)
  const totalWins = Number(data?.totalWins || 0)
  const winRate = Number(data?.winRate || 0)
  const sinceDate = data?.sinceDate ? new Date(data.sinceDate) : null
  const windowLabel = data?.periodDays && data.periodDays > 0
    ? `${data.periodDays}-day window`
    : sinceDate
      ? `Since ${sinceDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
      : 'Since project start'

  return (
    <section style={{ marginBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ ...S.h1, margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
          Community Leaderboards
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ ...S.label, color: C.textSub, letterSpacing: '0.06em' }}>
            {windowLabel}
          </span>
          <span style={{ ...S.label, color: C.cyan, letterSpacing: '0.06em', opacity: 0.8 }}>
            Updated daily
          </span>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {topFormations.length === 0 ? (
          <div style={{ ...S.card, borderColor: C.gold }}>
            <h3 style={{ ...S.label, color: C.gold, marginBottom: '1rem' }}>Community's Dream Team</h3>
            <p style={{ color: C.textSub, margin: 0 }}>No formation snapshots available yet.</p>
          </div>
        ) : (
          (() => {
            const dreamTeamSelection = topFormationsPicked[0]
            const dreamTeam = topFormations.find(item => item.formation === dreamTeamSelection?.formation) || topFormations[0]

            return (
              <div style={{ ...S.card, borderColor: C.gold, background: 'linear-gradient(180deg, rgba(255,177,0,0.04), rgba(0,0,0,0))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '1rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ ...S.label, color: C.gold }}>Community's Dream Team</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text }}>{dreamTeam.formation}</div>
                  </div>
                  <span style={{ color: C.textSub, fontSize: '0.8rem' }}>{dreamTeamSelection?.count ?? dreamTeam.totalVotes} picks</span>
                </div>

                <div style={{ display: 'grid', gap: '0.35rem' }}>
                  {(dreamTeam.team || []).map(player => {
                    const flagUrl = getCountryFlagUrl(player.country)
                    return (
                      <div key={`${dreamTeam.formation}-list-${player.position || 'MID'}-${player.name}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', padding: '0.5rem 0.4rem', borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ color: C.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong>{player.position || 'MID'}</strong>
                          {flagUrl ? (
                            <img src={flagUrl} alt={player.country} style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 2, border: `1px solid ${C.border}` }} />
                          ) : null}
                          <span>{player.name}</span>
                        </span>
                        <span style={{ color: C.textSub }}>{player.count} picks</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()
        )}

        <div style={{ ...S.card, borderColor: C.cyan, background: 'linear-gradient(180deg, rgba(0,240,255,0.04), rgba(0,0,0,0))' }}>
          <h3 style={{ ...S.label, color: C.accent, marginBottom: '1rem' }}>Top 11 players</h3>
          {topPlayersOverall.length === 0 ? (
            <p style={{ color: C.textSub, margin: 0 }}>No player rankings yet.</p>
          ) : (
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
              {topPlayersOverall.map((player, index) => {
                const flagUrl = getCountryFlagUrl(player.country)
                return (
                  <li key={`${player.name}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.6rem 0.75rem', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.text, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                      <span>#{index + 1}</span>
                      {flagUrl ? (
                        <img src={flagUrl} alt={player.country} style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 2, border: `1px solid ${C.border}` }} />
                      ) : null}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.name}</span>
                      {player.positions && player.positions.length > 0 ? <span style={{ color: C.textSub, fontWeight: 400 }}> · {player.positions.join(', ')}</span> : null}
                    </span>
                    <span style={{ color: C.textSub }}>{player.count} picks</span>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ ...S.card, borderColor: C.cyan }}>
          <div style={{ ...S.label, color: C.cyan, marginBottom: '0.4rem' }}>Starts</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2rem', color: C.text, lineHeight: 1 }}>{totalStarts}</div>
        </div>
        <div style={{ ...S.card, borderColor: C.gold }}>
          <div style={{ ...S.label, color: C.gold, marginBottom: '0.4rem' }}>Wins</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2rem', color: C.text, lineHeight: 1 }}>{totalWins}</div>
        </div>
        <div style={{ ...S.card, borderColor: C.accent }}>
          <div style={{ ...S.label, color: C.accent, marginBottom: '0.4rem' }}>Win rate</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2rem', color: C.text, lineHeight: 1 }}>{winRate}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem' }}>
        <div style={{ ...S.card, borderColor: C.accent }}>
          <h3 style={{ ...S.label, color: C.accent, marginBottom: '1rem' }}>Most selected coaches</h3>
          {topCoaches.length === 0 ? (
            <p style={{ color: C.textSub, margin: 0 }}>No coach picks yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.65rem' }}>
              {topCoaches.map((coach, index) => {
                const flagUrl = getCountryFlagUrl(coach.country)
                return (
                  <li key={`${coach.coach}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.6rem 0.75rem', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.text, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, flex: 1 }}>
                      <span>#{index + 1}</span>
                      {flagUrl ? (
                        <img src={flagUrl} alt={coach.country} style={{ width: 14, height: 10, objectFit: 'cover', borderRadius: 2, border: `1px solid ${C.border}` }} />
                      ) : null}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{coach.coach}</span>
                    </span>
                    <span style={{ color: C.textSub }}>{coach.count} picks</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div style={{ ...S.card, borderColor: C.gold }}>
          <h3 style={{ ...S.label, color: C.gold, marginBottom: '1rem' }}>Top formations picked</h3>
          {topFormationsPicked.length === 0 ? (
            <p style={{ color: C.textSub, margin: 0 }}>No formation selections yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.65rem' }}>
              {topFormationsPicked.map(item => (
                <li key={item.formation} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.6rem 0.75rem', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.text, fontWeight: 700 }}>
                    #{item.rank} {item.formation}
                  </span>
                  <span style={{ color: C.textSub }}>{item.count} picks</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ ...S.card, borderColor: C.accent }}>
          <h3 style={{ ...S.label, color: C.accent, marginBottom: '1rem' }}>Winning nation + formation</h3>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            <div style={{ padding: '0.75rem 0.9rem', border: `1px solid ${C.border}`, backgroundColor: C.bg }}>
              <div style={{ ...S.label, color: C.textSub, marginBottom: '0.25rem' }}>Top winning team</div>
              {topWinningTeam ? (
                <div style={{ color: C.text, fontWeight: 700 }}>{topWinningTeam.country} · {topWinningTeam.count} wins</div>
              ) : (
                <div style={{ color: C.textSub }}>No winners yet</div>
              )}
            </div>
            <div style={{ padding: '0.75rem 0.9rem', border: `1px solid ${C.border}`, backgroundColor: C.bg }}>
              <div style={{ ...S.label, color: C.textSub, marginBottom: '0.25rem' }}>Top winning formation</div>
              {topWinningFormation ? (
                <div style={{ color: C.text, fontWeight: 700 }}>{topWinningFormation.formation} · {topWinningFormation.count} wins</div>
              ) : (
                <div style={{ color: C.textSub }}>No winning patterns yet</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ ...S.card, borderColor: C.cyan }}>
          <h3 style={{ ...S.label, color: C.accent, marginBottom: '1rem' }}>Top countries playing</h3>
          {topNations.length === 0 ? (
            <p style={{ color: C.textSub, margin: 0 }}>No analytics yet. Daily updates will arrive from PostHog.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.65rem' }}>
              {topNations.map(nation => (
                <li key={nation.country} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.6rem 0.75rem', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.text, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ ...S.label, color: C.textSub }}>#{nation.rank}</span>
                    {getCountryFlagUrl(nation.country) ? (
                      <img src={getCountryFlagUrl(nation.country)} alt={nation.country} style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 2, border: `1px solid ${C.border}` }} />
                    ) : null}
                    {nation.country}
                  </span>
                  <span style={{ color: C.textSub }}>{nation.count} starts</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </section>
  )
}
