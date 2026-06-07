#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const RAW_SQUADS_FILE = path.join(DATA_DIR, 'raw-squads.json');
const GAPS_FILE = path.join(DATA_DIR, 'fetch-gaps.json');

const API_BASE = 'https://api.zafronix.com/fifa/worldcup/v1/tournaments';
const API_KEY = process.env.ZAFRONIX_API_KEY;
const WORLD_CUP_YEARS = [
  1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970,
  1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006,
  2010, 2014, 2018, 2022, 2026
];

const FLAGS = {
  // 2026 World Cup participants (48 teams)
  'Algeria': '🇩🇿', 'Argentina': '🇦🇷', 'Australia': '🇦🇺', 'Austria': '🇦🇹',
  'Belgium': '🇧🇪', 'Bosnia and Herzegovina': '🇧🇦', 'Brazil': '🇧🇷', 'Cabo Verde': '🇨🇻',
  'Canada': '🇨🇦', 'Colombia': '🇨🇴', 'Congo DR': '🇨🇩', 'Côte d\'Ivoire': '🇨🇮',
  'Croatia': '🇭🇷', 'Curaçao': '🇨🇼', 'Czechia': '🇨🇿', 'Ecuador': '🇪🇨',
  'Egypt': '🇪🇬', 'England': '🇬🇧', 'France': '🇫🇷', 'Germany': '🇩🇪',
  'Ghana': '🇬🇭', 'Haiti': '🇭🇹', 'IR Iran': '🇮🇷', 'Iraq': '🇮🇶',
  'Japan': '🇯🇵', 'Jordan': '🇯🇴', 'Korea Republic': '🇰🇷', 'Mexico': '🇲🇽',
  'Morocco': '🇲🇦', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Norway': '🇳🇴',
  'Panama': '🇵🇦', 'Paraguay': '🇵🇾', 'Portugal': '🇵🇹', 'Qatar': '🇶🇦',
  'Saudi Arabia': '🇸🇦', 'Scotland': '🇬🇧', 'Senegal': '🇸🇳', 'South Africa': '🇿🇦',
  'Spain': '🇪🇸', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 'Tunisia': '🇹🇳',
  'Türkiye': '🇹🇷', 'USA': '🇺🇸', 'Uruguay': '🇺🇾', 'Uzbekistan': '🇺🇿',

  // Historical aliases (for earlier World Cups)
  'Czech Republic': '🇨🇿', 'Ivory Coast': '🇨🇮', 'Iran': '🇮🇷',
  'South Korea': '🇰🇷', 'Korea': '🇰🇷', 'Turkey': '🇹🇷', 'Democratic Republic of the Congo': '🇨🇩',
  'Cape Verde': '🇨🇻', 'United States': '🇺🇸'
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
      headers: {
        'X-API-Key': API_KEY,
        'User-Agent': 'Timeless XI Data Fetcher'
      }
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
  if (typeof player.jersey !== 'number' || player.jersey < 0) {
    issues.push(`Invalid jersey for ${player.name}: ${player.jersey}`);
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
        number: player.jersey,
        position: player.position.toUpperCase(),
        country: country.code || country.name,
        year
      };
    })
    .filter(p => p !== null);
}

function extractCountryCode(countryName) {
  const codeMap = {
    // 2026 participants
    'Algeria': 'ALG', 'Argentina': 'ARG', 'Australia': 'AUS', 'Austria': 'AUT',
    'Belgium': 'BEL', 'Bosnia and Herzegovina': 'BIH', 'Brazil': 'BRA', 'Cabo Verde': 'CPV',
    'Canada': 'CAN', 'Colombia': 'COL', 'Congo DR': 'COD', 'Côte d\'Ivoire': 'CIV',
    'Croatia': 'CRO', 'Curaçao': 'CUW', 'Czechia': 'CZE', 'Ecuador': 'ECU',
    'Egypt': 'EGY', 'England': 'ENG', 'France': 'FRA', 'Germany': 'GER',
    'Ghana': 'GHA', 'Haiti': 'HTI', 'IR Iran': 'IRN', 'Iraq': 'IRQ',
    'Japan': 'JPN', 'Jordan': 'JOR', 'Korea Republic': 'KOR', 'Mexico': 'MEX',
    'Morocco': 'MAR', 'Netherlands': 'NED', 'New Zealand': 'NZL', 'Norway': 'NOR',
    'Panama': 'PAN', 'Paraguay': 'PAR', 'Portugal': 'POR', 'Qatar': 'QAT',
    'Saudi Arabia': 'KSA', 'Scotland': 'SCO', 'Senegal': 'SEN', 'South Africa': 'RSA',
    'Spain': 'ESP', 'Sweden': 'SWE', 'Switzerland': 'SUI', 'Tunisia': 'TUN',
    'Türkiye': 'TUR', 'USA': 'USA', 'Uruguay': 'URY', 'Uzbekistan': 'UZB',

    // Historical aliases
    'Czech Republic': 'CZE', 'Ivory Coast': 'CIV', 'Iran': 'IRN',
    'South Korea': 'KOR', 'Korea': 'KOR', 'Turkey': 'TUR', 'Democratic Republic of the Congo': 'COD',
    'Cape Verde': 'CPV', 'United States': 'USA', 'Serbia': 'SRB', 'Montenegro': 'MNE',
    'Serbia and Montenegro': 'SCG', 'Yugoslavia': 'YUG', 'East Germany': 'GDR', 'West Germany': 'FRG'
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
  if (!API_KEY) {
    console.error('\n❌ Error: ZAFRONIX_API_KEY not found in .env file');
    console.error('Please create a .env file with: ZAFRONIX_API_KEY=your_key');
    console.error('Get your free API key at: https://api.zafronix.com/\n');
    process.exit(1);
  }

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
