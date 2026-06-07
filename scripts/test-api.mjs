#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://api.zafronix.com/fifa/worldcup/v1/tournaments';
const API_KEY = process.env.ZAFRONIX_API_KEY;

async function testAPI() {
  console.log('\n🧪 Testing Zafronix API...\n');

  if (!API_KEY) {
    console.error('❌ Error: ZAFRONIX_API_KEY not found in .env file');
    console.error('Please add your API key to .env: ZAFRONIX_API_KEY=your_key');
    process.exit(1);
  }

  try {
    console.log('Fetching 2022 World Cup tournament...');
    const response = await axios.get(`${API_BASE}/2022`, {
      timeout: 10000,
      headers: { 'X-API-Key': API_KEY }
    });

    console.log('\n✓ API is reachable!\n');
    console.log('Response structure:');
    console.log(`  - Root keys: ${Object.keys(response.data).join(', ')}`);

    if (response.data.teams && Array.isArray(response.data.teams)) {
      console.log(`  - Number of teams: ${response.data.teams.length}`);

      const sampleTeam = response.data.teams[0];
      console.log(`\nSample team structure (${sampleTeam.country || sampleTeam.name}):`);
      console.log(`  - Team keys: ${Object.keys(sampleTeam).join(', ')}`);

      if (sampleTeam.squad && Array.isArray(sampleTeam.squad)) {
        console.log(`  - Players in squad: ${sampleTeam.squad.length}`);
        const samplePlayer = sampleTeam.squad[0];
        console.log(`\nSample player structure:`);
        console.log(`  - Player keys: ${Object.keys(samplePlayer).join(', ')}`);
        console.log(`  - Sample: ${JSON.stringify(samplePlayer)}`);
      }
    }

    console.log('\n✓ API structure looks good. Ready to run: npm run fetch\n');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    console.error('Make sure you have internet connection and axios is installed.');
    console.error('Run: npm install\n');
    process.exit(1);
  }
}

testAPI();
