export const FORMATIONS = {
  '4-4-2': {
    name: '4-4-2 Classic',
    positions: { GK: 1, DEF: 4, MID: 4, FWD: 2 },
    slots: ['GK', 'CB', 'CB', 'LB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'],
    description: 'Balanced defense and attack',
  },
  '4-3-3': {
    name: '4-3-3 Modern',
    positions: { GK: 1, DEF: 4, MID: 3, FWD: 3 },
    slots: ['GK', 'CB', 'CB', 'LB', 'RB', 'CM', 'CM', 'CM', 'LW', 'ST', 'RW'],
    description: 'Flexible midfield with wing play',
  },
  '3-5-2': {
    name: '3-5-2 Attacking',
    positions: { GK: 1, DEF: 3, MID: 5, FWD: 2 },
    slots: ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'CM', 'RM', 'ST', 'ST'],
    description: 'Midfield dominance and width',
  },
  '5-3-2': {
    name: '5-3-2 Defensive',
    positions: { GK: 1, DEF: 5, MID: 3, FWD: 2 },
    slots: ['GK', 'CB', 'CB', 'CB', 'LB', 'RB', 'CM', 'CM', 'CM', 'ST', 'ST'],
    description: 'Solid defense, quick counterattacks',
  },
  '4-2-4': {
    name: '4-2-4 Vintage',
    positions: { GK: 1, DEF: 4, MID: 2, FWD: 4 },
    slots: ['GK', 'CB', 'CB', 'LB', 'RB', 'CM', 'CM', 'LW', 'ST', 'ST', 'RW'],
    description: 'Ultra-aggressive, classic 80s style',
  },
}

export const POSITIONS = {
  GK:  { name: 'Goalkeeper',  abbr: 'GK' },
  DEF: { name: 'Defender',    abbr: 'DEF' },
  MID: { name: 'Midfielder',  abbr: 'MID' },
  FWD: { name: 'Forward',     abbr: 'FWD' },
  // Specific positions (used after enrichment)
  CB:  { name: 'Center Back',  abbr: 'CB' },
  LB:  { name: 'Left Back',    abbr: 'LB' },
  RB:  { name: 'Right Back',   abbr: 'RB' },
  CM:  { name: 'Central Mid',  abbr: 'CM' },
  LM:  { name: 'Left Mid',     abbr: 'LM' },
  RM:  { name: 'Right Mid',    abbr: 'RM' },
  ST:  { name: 'Striker',      abbr: 'ST' },
  LW:  { name: 'Left Wing',    abbr: 'LW' },
  RW:  { name: 'Right Wing',   abbr: 'RW' },
}

const COUNTRY_CODES = {
  'Algeria': 'dz', 'Angola': 'ao', 'Argentina': 'ar', 'Australia': 'au',
  'Austria': 'at', 'Belgium': 'be', 'Bolivia': 'bo', 'Bosnia and Herzegovina': 'ba',
  'Brazil': 'br', 'Bulgaria': 'bg', 'Cameroon': 'cm', 'Canada': 'ca',
  'Chile': 'cl', 'China PR': 'cn', 'Colombia': 'co', 'Costa Rica': 'cr',
  'Croatia': 'hr', 'Czech Republic': 'cz', 'Czechoslovakia': 'cz', 'Denmark': 'dk',
  'Ecuador': 'ec', 'Egypt': 'eg', 'El Salvador': 'sv', 'England': 'gb-eng',
  'France': 'fr', 'Germany': 'de', 'Ghana': 'gh', 'Greece': 'gr',
  'Haiti': 'ht', 'Honduras': 'hn', 'Hungary': 'hu', 'Iceland': 'is',
  'Iran': 'ir', 'Iraq': 'iq', 'Israel': 'il', 'Italy': 'it',
  'Ivory Coast': 'ci', 'Jamaica': 'jm', 'Japan': 'jp', 'Jordan': 'jo',
  'Kuwait': 'kw', 'Mexico': 'mx', 'Morocco': 'ma', 'Netherlands': 'nl',
  'New Zealand': 'nz', 'Nigeria': 'ng', 'North Korea': 'kp', 'Northern Ireland': 'gb-nir',
  'Norway': 'no', 'Panama': 'pa', 'Paraguay': 'py', 'Peru': 'pe',
  'Poland': 'pl', 'Portugal': 'pt', 'Qatar': 'qa', 'Republic of Ireland': 'ie',
  'Romania': 'ro', 'Russia': 'ru', 'Saudi Arabia': 'sa', 'Scotland': 'gb-sct',
  'Senegal': 'sn', 'Serbia': 'rs', 'Slovakia': 'sk', 'Slovenia': 'si',
  'South Africa': 'za', 'South Korea': 'kr', 'Spain': 'es', 'Sweden': 'se',
  'Switzerland': 'ch', 'Togo': 'tg', 'Trinidad and Tobago': 'tt', 'Tunisia': 'tn',
  'Turkey': 'tr', 'Ukraine': 'ua', 'United Arab Emirates': 'ae', 'United States': 'us',
  'Uruguay': 'uy', 'Uzbekistan': 'uz', 'Wales': 'gb-wls', 'West Germany': 'de',
  'Zaire': 'cd',
}

export function getCountryFlagUrl(countryName) {
  const code = COUNTRY_CODES[countryName]
  if (!code) return null
  return `https://flagcdn.com/w80/${code}.png`
}

export const TOURNAMENT_STRUCTURE = {
  GROUPS: 8,
  TEAMS_PER_GROUP: 4,
  TOTAL_TEAMS: 32,
  ROUNDS: ['Group', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final'],
}
