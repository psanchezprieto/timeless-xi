#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const ENRICHED_FILE = path.join(DATA_DIR, "enriched-squads.json");
const BACKUP_FILE = path.join(DATA_DIR, "enriched-squads.backup.json");

// Estimate typical debut age (18-23 years old)
const TYPICAL_DEBUT_AGE = 20.5;

// Map of known player birth years to help calibrate
// (name -> birth year)
const KNOWN_BIRTHS = {
  "Lionel Messi": 1987,
  "Cristiano Ronaldo": 1985,
  "Luka Modrić": 1985,
  "Andrés Iniesta": 1984,
  "Sergio Ramos": 1986,
  "Manuel Neuer": 1986,
};

function estimateAge(playerName, worldCupYear) {
  // Strip suffixes like "(captain)" for matching
  const baseName = playerName.replace(/\s*\(.*?\)\s*$/g, "").trim();

  if (KNOWN_BIRTHS[baseName]) {
    return worldCupYear - KNOWN_BIRTHS[baseName];
  }
  if (KNOWN_BIRTHS[playerName]) {
    return worldCupYear - KNOWN_BIRTHS[playerName];
  }
  // Default: estimate based on typical appearance window
  // Can't estimate without birth year, so return null
  return null;
}

function getAgePenalty(age) {
  if (!age || age < 35) return 0; // No penalty under 35
  if (age === 35) return 5; // -5 for age 35
  if (age === 36) return 5; // -5 for age 36
  if (age === 37) return 0; // Keep elite 37-year-olds at full rating
  if (age === 38) return 6; // -6 for age 38
  if (age === 39) return 7; // -7 for age 39
  return Math.min(age - 32, 10); // Cap at -10
}

function main() {
  console.log("📖 Reading enriched squads...");
  const data = JSON.parse(fs.readFileSync(ENRICHED_FILE, "utf-8"));

  // Backup original
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
  console.log(`✓ Backup saved to ${BACKUP_FILE}`);

  let adjustmentsCount = 0;
  let maxAdjustment = 0;

  // Apply age penalties
  for (const squad of data.squads) {
    for (const player of squad.players) {
      const age = estimateAge(player.name, squad.year);
      if (!age) continue; // Skip players without known birth years

      const penalty = getAgePenalty(age);
      if (penalty > 0) {
        const oldRating = player.rating;
        player.rating = Math.max(50, Math.round(player.rating - penalty)); // Never below 50 (WC minimum)

        if (oldRating !== player.rating) {
          adjustmentsCount++;
          maxAdjustment = Math.max(maxAdjustment, penalty);

          console.log(
            `  ${player.name} (${squad.year}, age ${age}): ${oldRating} → ${player.rating} (-${penalty})`
          );
        }
      }
    }
  }

  // Save adjusted data
  fs.writeFileSync(ENRICHED_FILE, JSON.stringify(data, null, 2));
  console.log(`\n✅ Applied age penalties to ${adjustmentsCount} players`);
  console.log(`   Max adjustment: -${maxAdjustment} points`);
  console.log(`   Updated: ${ENRICHED_FILE}`);
}

main();
