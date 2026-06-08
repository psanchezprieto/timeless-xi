import posthog from 'posthog-js'

export function useGameAnalytics() {
  const generateCampaignId = () => `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const trackCampaignStart = (country) => {
    const campaignId = generateCampaignId()
    posthog.identify(posthog.get_distinct_id())
    posthog.capture('campaign_started', {
      country: country.name,
      country_code: country.code,
      campaign_id: campaignId,
    })
    return campaignId
  }

  const trackFormationSelected = (formation, campaignId) => {
    posthog.capture('formation_selected', {
      formation,
      campaign_id: campaignId,
    })
  }

  const trackPlayerPicked = (player, position, campaignId) => {
    posthog.capture('player_picked', {
      player_name: player.name,
      player_position: position,
      player_rating: player.rating,
      campaign_id: campaignId,
    })
  }

  const trackRerollUsed = (rerollsRemaining, campaignId) => {
    posthog.capture('reroll_used', {
      rerolls_remaining: rerollsRemaining,
      campaign_id: campaignId,
    })
  }

  const trackCoachSelected = (coach, campaignId) => {
    posthog.capture('coach_selected', {
      coach_name: coach.name,
      coach_morale_boost: coach.moraleMod,
      campaign_id: campaignId,
    })
  }

  const trackCampaignCompleted = (result, campaignId) => {
    posthog.capture('campaign_completed', {
      placement: result.placement,
      matches_played: result.matches.length,
      wins: result.wins,
      draws: result.draws,
      losses: result.losses,
      goals_for: result.goalsFor,
      goals_against: result.goalsAgainst,
      top_scorer: result.topScorer?.name || null,
      campaign_id: campaignId,
    })
  }

  return {
    generateCampaignId,
    trackCampaignStart,
    trackFormationSelected,
    trackPlayerPicked,
    trackRerollUsed,
    trackCoachSelected,
    trackCampaignCompleted,
  }
}
