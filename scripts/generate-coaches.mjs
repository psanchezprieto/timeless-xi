#!/usr/bin/env node

import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const RAW_SQUADS_FILE = path.join(DATA_DIR, "raw-squads.json");
const COACHES_FILE = path.join(DATA_DIR, "coaches.json");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const API_BASE = "https://api.anthropic.com/v1";

if (!API_KEY) {
  console.error("❌ Error: ANTHROPIC_API_KEY environment variable not set");
  process.exit(1);
}

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  },
});

async function getCoachesFromAPI(countries) {
  const countryList = countries.join(", ");

  const prompt = `Generate a list of historical football coaches for each of these countries. For each country, provide exactly 3 coaches from different eras who are realistically famous/important for that country's football history.

For each coach, provide:
- name: Full name of the coach
- era: Years active (e.g., "1978-1986") or era description
- moraleBoost: Morale boost as an integer from 2 to 5 (%) - more famous coaches get higher boosts (famous/legendary = 5, good coaches = 4-3, decent coaches = 2)

Return ONLY a valid JSON object in this exact format with no markdown, no explanation, no other text:
{
  "Argentina": [
    {"name": "Carlos Bilardo", "era": "1988-1990", "moraleBoost": 5},
    {"name": "César Luis Menotti", "era": "1974-1982", "moraleBoost": 4},
    {"name": "Alejandro Sabella", "era": "2011-2014", "moraleBoost": 4},
    {"name": "Sergio Batista", "era": "1991-1992", "moraleBoost": 2}
  ],
  "Brazil": [
    {"name": "Carlos Alberto Parreira", "era": "1994-1998", "moraleBoost": 5},
    {"name": "João Havelange", "era": "1958-1974", "moraleBoost": 5},
    {"name": "Tite", "era": "2016-2022", "moraleBoost": 4}
  ],
  ...
}

Countries: ${countryList}`;

  console.log("🚀 Calling Claude Sonnet to generate coaches...");
  try {
    const response = await client.post("/messages", {
      model: "claude-sonnet-4-6",
      max_tokens: 16384,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.data.content[0].text.trim();

    // Parse JSON response
    const coachesData = JSON.parse(content);
    return coachesData;
  } catch (error) {
    const errorMsg =
      (error.response && error.response.data) || error.message;
    console.error("❌ Error calling API:", errorMsg);
    throw error;
  }
}

async function main() {
  console.log("📖 Reading raw squads to extract countries...");
  const rawData = JSON.parse(fs.readFileSync(RAW_SQUADS_FILE, "utf-8"));

  // Extract unique countries
  const countriesSet = new Set();
  for (const squad of rawData.squads) {
    countriesSet.add(squad.countryName || squad.country);
  }
  const countries = Array.from(countriesSet).sort();

  console.log(`📊 Found ${countries.length} countries`);
  console.log(`   ${countries.join(", ")}\n`);

  const coachesData = await getCoachesFromAPI(countries);

  // Validate structure
  let totalCoaches = 0;
  for (const [country, coaches] of Object.entries(coachesData)) {
    if (!Array.isArray(coaches)) {
      console.warn(`⚠️  ${country} has invalid coach data`);
      continue;
    }
    totalCoaches += coaches.length;

    // Validate each coach
    for (const coach of coaches) {
      if (!coach.name || !coach.era || coach.moraleBoost === undefined) {
        console.warn(`⚠️  Invalid coach in ${country}: ${JSON.stringify(coach)}`);
      }
    }
  }

  // Save coaches data
  fs.writeFileSync(COACHES_FILE, JSON.stringify(coachesData, null, 2));
  console.log(
    `✓ Saved ${totalCoaches} coaches for ${Object.keys(coachesData).length} countries to ${path.relative(process.cwd(), COACHES_FILE)}`
  );

  console.log("\n📈 Coaches per country:");
  Object.entries(coachesData).forEach(([country, coaches]) => {
    console.log(`  • ${country}: ${coaches.length} coaches`);
  });

  console.log("\n✅ Coach generation complete!\n");
}

main().catch((error) => {
  console.error("\n❌ Fatal error:", error.message);
  process.exit(1);
});
