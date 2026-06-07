#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const RAW_SQUADS_FILE = path.join(DATA_DIR, 'raw-squads.json');
const GAPS_FILE = path.join(DATA_DIR, 'fetch-gaps.json');

const API_BASE = 'https://api.zafronix.com/fifa/worldcup/v1/tournaments';
const WORLD_CUP_YEARS = [
  1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970,
  1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006,
  2010, 2014, 2018, 2022, 2026
];

const FLAGS = {
  'Argentina': '🇦🇷', 'Australia': '🇦🇺', 'Austria': '🇦🇹', 'Belgium': '🇧🇪',
  'Brazil': '🇧🇷', 'Bulgaria': '🇧🇬', 'Cameroon': '🇨🇲', 'Canada': '🇨🇦',
  'Chile': '🇨🇱', 'China': '🇨🇳', 'Colombia': '🇨🇴', 'Costa Rica': '🇨🇷',
  'Croatia': '🇭🇷', 'Czech Republic': '🇨🇿', 'Czechia': '🇨🇿', 'Denmark': '🇩🇰',
  'Ecuador': '🇪🇨', 'Egypt': '🇪🇬', 'England': '🇬🇧', 'France': '🇫🇷',
  'Germany': '🇩🇪', 'Ghana': '🇬🇭', 'Greece': '🇬🇷', 'Hungary': '🇭🇺',
  'Iran': '🇮🇷', 'Ireland': '🇮🇪', 'Italy': '🇮🇹', 'Ivory Coast': '🇨🇮',
  'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Korea': '🇰🇷', 'Mexico': '🇲🇽',
  'Morocco': '🇲🇦', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Norway': '🇳🇴',
  'Poland': '🇵🇱', 'Portugal': '🇵🇹', 'Romania': '🇷🇴', 'Russia': '🇷🇺',
  'Saudi Arabia': '🇸🇦', 'Scotland': '🇬🇧', 'Senegal': '🇸🇳', 'Serbia': '🇷🇸',
  'Slovakia': '🇸🇰', 'Slovenia': '🇸🇮', 'South Africa': '🇿🇦', 'Spain': '🇪🇸',
  'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 'Tunisia': '🇹🇳', 'Turkey': '🇹🇷',
  'Ukraine': '🇺🇦', 'United States': '🇺🇸', 'USA': '🇺🇸', 'Uruguay': '🇺🇾',
  'Wales': '🇬🇧'
};

class FetchGapsReporter {
  constructor() {
    this.missingYears = [];
    this.incompleteTournaments = {};
    this.missingPlayers = [];
    this.errors = [];
  }

  addMissingYear(year) {
    if (!this.missingYears.includes(year)) {
      this.missingYears.push(year);
    }
  }

  addIncompletePlayer(year, country, issue) {
    if (!this.incompleteTournaments[year]) {
      this.incompleteTournaments[year] = {};
    }
    if (!this.incompleteTournaments[year][country]) {
      this.incompleteTournaments[year][country] = [];
    }
    this.incompleteTournaments[year][country].push(issue);
  }

  addError(message) {
    this.errors.push(message);
  }

  report() {
    return {
      timestamp: new Date().toISOString(),
      missingYears: this.missingYears,
      incompleteTournaments: this.incompleteTournaments,
      errors: this.errors,
      summary: {
        totalMissingYears: this.missingYears.length,
        totalTournamentsWithIssues: Object.keys(this.incompleteTournaments).length,
        totalErrors: this.errors.length
      }
    };
  }
}

async function fetchTournament(year) {
  try {
    const url = `${API_BASE}/${year}`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Timeless XI Data Fetcher' }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch ${year}: ${error.message}`);
  }
}

function validatePlayer(player, country, year) {
  const issues = [];

  if (!player.name || typeof player.name !== 'string' || !player.name.trim()) {
    issues.push(`Missing/invalid name: ${JSON.stringify(player).substring(0, 50)}`);
  }
  if (typeof player.number !== 'number' || player.number < 0) {
    issues.push(`Invalid number for ${player.name}: ${player.number}`);
  }
  if (!player.position || typeof player.position !== 'string') {
    issues.push(`Missing/invalid position for ${player.name}`);
  }

  return issues;
}

function normalizePlayers(players, country, year, gapsReporter) {
  return players
    .map((player) => {
      const issues = validatePlayer(player, country, year);
      if (issues.length > 0) {
        issues.forEach(issue =>
          gapsReporter.addIncompletePlayer(year, country, issue)
        );
        return null;
      }
      return {
        name: player.name.trim(),
        number: player.number,
        position: player.position.toUpperCase(),
        country: country.code || country.name,
        year
      };
    })
    .filter(p => p !== null);
}

function extractCountryCode(countryName) {
  const codeMap = {
    'Argentina': 'ARG', 'Australia': 'AUS', 'Austria': 'AUT', 'Belgium': 'BEL',
    'Brazil': 'BRA', 'Bulgaria': 'BUL', 'Cameroon': 'CMR', 'Canada': 'CAN',
    'Chile': 'CHI', 'China': 'CHN', 'Colombia': 'COL', 'Costa Rica': 'CRC',
    'Croatia': 'CRO', 'Czech Republic': 'CZE', 'Czechia': 'CZE', 'Denmark': 'DEN',
    'Ecuador': 'ECU', 'Egypt': 'EGY', 'England': 'ENG', 'France': 'FRA',
    'Germany': 'GER', 'Ghana': 'GHA', 'Greece': 'GRE', 'Hungary': 'HUN',
    'Iran': 'IRN', 'Ireland': 'IRL', 'Italy': 'ITA', 'Ivory Coast': 'CIV',
    'Japan': 'JPN', 'South Korea': 'KOR', 'Korea': 'KOR', 'Mexico': 'MEX',
    'Morocco': 'MAR', 'Netherlands': 'NED', 'New Zealand': 'NZL', 'Norway': 'NOR',
    'Poland': 'POL', 'Portugal': 'POR', 'Romania': 'ROU', 'Russia': 'RUS',
    'Saudi Arabia': 'KSA', 'Scotland': 'SCO', 'Senegal': 'SEN', 'Serbia': 'SRB',
    'Slovakia': 'SVK', 'Slovenia': 'SVN', 'South Africa': 'RSA', 'Spain': 'ESP',
    'Sweden': 'SWE', 'Switzerland': 'SUI', 'Tunisia': 'TUN', 'Turkey': 'TUR',
    'Ukraine': 'UKR', 'United States': 'USA', 'USA': 'USA', 'Uruguay': 'URY',
    'Wales': 'WAL'
  };
  return codeMap[countryName] || countryName.substring(0, 3).toUpperCase();
}

async function fetchAll(testMode = false) {
  const gapsReporter = new FetchGapsReporter();
  const allSquads = [];
  const yearsToFetch = testMode ? [1930, 2022] : WORLD_CUP_YEARS;

  console.log(`\n📊 Fetching ${yearsToFetch.length} World Cup${yearsToFetch.length > 1 ? 's' : ''}...`);
  if (testMode) console.log('   (TEST MODE - fetching 2 years only)\n');

  for (const year of yearsToFetch) {
    try {
      console.log(`  Fetching ${year}...`);
      const tournamentData = await fetchTournament(year);

      if (!tournamentData.teams || !Array.isArray(tournamentData.teams)) {
        gapsReporter.addError(`${year}: Unexpected API structure, missing 'teams' array`);
        gapsReporter.addMissingYear(year);
        continue;
      }

      tournamentData.teams.forEach((team) => {
        const countryName = team.country || team.name;
        const countryCode = team.code || extractCountryCode(countryName);

        if (!team.squad || !Array.isArray(team.squad)) {
          gapsReporter.addIncompletePlayer(year, countryName, 'Missing squad array');
          return;
        }

        const validPlayers = normalizePlayers(team.squad, { code: countryCode, name: countryName }, year, gapsReporter);

        if (validPlayers.length > 0) {
          allSquads.push({
            country: countryCode,
            countryName,
            year,
            playerCount: validPlayers.length,
            players: validPlayers
          });
        } else {
          gapsReporter.addIncompletePlayer(year, countryName, 'No valid players in squad');
        }
      });

      console.log(`    ✓ ${tournamentData.teams.length} teams`);
    } catch (error) {
      console.error(`    ✗ Error: ${error.message}`);
      gapsReporter.addError(error.message);
      gapsReporter.addMissingYear(year);
    }
  }

  return { allSquads, gapsReporter };
}

async function main() {
  const testMode = process.argv.includes('--test');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const { allSquads, gapsReporter } = await fetchAll(testMode);

  // Save raw squads
  fs.writeFileSync(RAW_SQUADS_FILE, JSON.stringify({ squads: allSquads }, null, 2));
  console.log(`\n✓ Saved ${allSquads.length} squads to ${path.relative(process.cwd(), RAW_SQUADS_FILE)}`);

  // Calculate statistics
  const totalPlayers = allSquads.reduce((sum, s) => sum + s.playerCount, 0);
  const uniqueCountries = new Set(allSquads.map(s => s.country)).size;
  const yearsWithData = new Set(allSquads.map(s => s.year)).size;

  // Save gaps report
  fs.writeFileSync(GAPS_FILE, JSON.stringify(gapsReporter.report(), null, 2));
  console.log(`✓ Saved gaps report to ${path.relative(process.cwd(), GAPS_FILE)}`);

  // Summary statistics
  console.log('\n📈 Statistics:');
  console.log(`  • Total squads: ${allSquads.length}`);
  console.log(`  • Total players: ${totalPlayers}`);
  console.log(`  • Unique countries: ${uniqueCountries}`);
  console.log(`  • Years with data: ${yearsWithData}/${WORLD_CUP_YEARS.length}`);

  const gapsSummary = gapsReporter.report().summary;
  if (gapsSummary.totalErrors > 0 || gapsSummary.totalMissingYears > 0) {
    console.log('\n⚠️  Gaps Summary:');
    if (gapsSummary.totalMissingYears > 0) {
      console.log(`  • Missing years: ${gapsSummary.totalMissingYears}`);
    }
    if (gapsSummary.totalErrors > 0) {
      console.log(`  • API errors: ${gapsSummary.totalErrors}`);
    }
  } else {
    console.log('\n✓ No gaps detected!');
  }

  console.log('\nPhase 1a complete. Next: npm run enrich\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
