#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const TEMP_DIR = path.join(__dirname, '..', 'data', 'temp');

// Decades for splitting
const DECADES = [
  { name: '1930-1950', start: 1930, end: 1950 },
  { name: '1950-1970', start: 1950, end: 1970 },
  { name: '1970-1990', start: 1970, end: 1990 },
  { name: '1990-2010', start: 1990, end: 2010 },
  { name: '2010-2026', start: 2010, end: 2026 },
];

// Key mapping for compression
const KEY_MAP = {
  country: 'c',
  countryName: 'cn',
  year: 'y',
  playerCount: 'pc',
  players: 'p',
  name: 'n',
  number: 'num',
  position: 'pos',
  rating: 'r',
  confidence: 'conf',
};

function optimizeSquad(squad) {
  return {
    c: squad.country,
    cn: squad.countryName,
    y: squad.year,
    pc: squad.playerCount,
    p: squad.players.map(player => ({
      n: player.name,
      num: player.number,
      pos: player.position,
      r: player.rating,
      conf: player.confidence,
    })),
  };
}

function splitByDecade(squads) {
  const result = {};

  DECADES.forEach(decade => {
    result[decade.name] = {
      decade: decade.name,
      startYear: decade.start,
      endYear: decade.end,
      squads: squads.filter(
        squad => squad.year > decade.start && squad.year <= decade.end
      ),
      playerCount: 0,
      countryCount: 0,
    };
  });

  // Calculate stats and optimize
  Object.keys(result).forEach(decadeName => {
    const decade = result[decadeName];
    const optimized = decade.squads.map(optimizeSquad);

    decade.playerCount = optimized.reduce((sum, s) => sum + s.pc, 0);
    const countries = new Set(optimized.map(s => s.c));
    decade.countryCount = countries.size;
    decade.squads = optimized;
  });

  return result;
}

function main() {
  try {
    console.log('📊 Building optimized JSON files...\n');

    // Read enriched squads
    const enrichedPath = path.join(DATA_DIR, 'enriched-squads.json');
    if (!fs.existsSync(enrichedPath)) {
      throw new Error(`Missing input file: ${enrichedPath}`);
    }

    const rawData = fs.readFileSync(enrichedPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Create temp directory if needed
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    // Split by decade
    const decadedData = splitByDecade(data.squads);

    // Write individual decade files
    const decadeSizes = {};
    Object.keys(decadedData).forEach(decadeName => {
      const decade = decadedData[decadeName];
      const filename = `squads-${decade.decade}.json`;
      const filepath = path.join(TEMP_DIR, filename);

      const output = {
        decade: decade.decade,
        startYear: decade.startYear,
        endYear: decade.endYear,
        squads: decade.squads,
        stats: {
          playerCount: decade.playerCount,
          countryCount: decade.countryCount,
          squadCount: decade.squads.length,
        },
      };

      fs.writeFileSync(filepath, JSON.stringify(output, null, 0));
      const sizeBytes = Buffer.byteLength(JSON.stringify(output));
      const sizeKB = (sizeBytes / 1024).toFixed(2);
      decadeSizes[filename] = { bytes: sizeBytes, kb: parseFloat(sizeKB) };

      console.log(`✅ ${filename}`);
      console.log(`   Players: ${output.stats.playerCount}, Countries: ${output.stats.countryCount}, Squads: ${output.stats.squadCount}`);
      console.log(`   Size: ${sizeKB} KB`);
    });

    // Write metadata
    const metadata = {
      generations: new Date().toISOString(),
      format: 'optimized-keys',
      keyMap: KEY_MAP,
      decades: Object.keys(decadedData).map(name => ({
        name: decadedData[name].decade,
        startYear: decadedData[name].startYear,
        endYear: decadedData[name].endYear,
        playerCount: decadedData[name].playerCount,
        countryCount: decadedData[name].countryCount,
        squadCount: decadedData[name].squads.length,
        filename: `squads-${decadedData[name].decade}.json.gz`,
        uncompressedSize: decadeSizes[`squads-${decadedData[name].decade}.json`],
      })),
      summary: {
        totalPlayers: Object.values(decadedData).reduce((sum, d) => sum + d.playerCount, 0),
        totalCountries: new Set(data.squads.map(s => s.country)).size,
        totalSquads: data.squads.length,
        totalDecades: DECADES.length,
      },
    };

    const metadataPath = path.join(DATA_DIR, 'temp-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // Print summary
    console.log('\n📈 Summary:');
    console.log(`Total players: ${metadata.summary.totalPlayers}`);
    console.log(`Total countries: ${metadata.summary.totalCountries}`);
    console.log(`Total squads: ${metadata.summary.totalSquads}`);
    console.log(`\n✅ Phase 1c (build-json) complete!`);
    console.log(`   Output: data/temp/ (5 JSON files + metadata)`);
    console.log(`   Next: Run 'npm run compress' to create .gz files`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
