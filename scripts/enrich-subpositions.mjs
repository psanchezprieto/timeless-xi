#!/usr/bin/env node

import { Anthropic } from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const ENRICHED_SQUADS_FILE = path.join(DATA_DIR, "enriched-squads.json");

const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error("❌ Error: ANTHROPIC_API_KEY environment variable not set");
  process.exit(1);
}

const client = new Anthropic({ apiKey: API_KEY });

// Map broad position to valid sub-positions
const subPositionMap = {
  DF: ["CB", "LB", "RB"],
  MF: ["CM", "LM", "RM"],
  FW: ["ST", "LW", "RW"],
};

// Default fallback for each position group
const defaultFallback = { DF: "CB", MF: "CM", FW: "ST" };

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function classifySubposition(player) {
  const validAnswers = subPositionMap[player.position] || [];
  const prompt = `Classify this World Cup footballer into the most likely specific position.
Position group: ${player.position} (DF=Defender, MF=Midfielder, FW=Forward)
Valid answers for DF: CB, LB, RB
Valid answers for MF: CM, LM, RM
Valid answers for FW: ST, LW, RW

Name: ${player.name}
Country: ${player.country}
Year: ${player.year}

Respond with ONLY one of the valid position codes. No explanation.`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0]?.type === "text" ? response.content[0].text : "").trim().toUpperCase();

    // Validate response is one of the valid answers
    if (validAnswers.includes(text)) {
      return text;
    }

    // Invalid response, use fallback
    return defaultFallback[player.position] || "CB";
  } catch (e) {
    console.error(`⚠️  Error classifying ${player.name}:`, e.message);
    return defaultFallback[player.position] || "CB";
  }
}

async function main() {
  console.log("📖 Reading enriched squads...");
  const data = JSON.parse(fs.readFileSync(ENRICHED_SQUADS_FILE, "utf-8"));

  // Collect all non-GK players to classify
  const playersToClassify = [];
  const playerIndices = []; // Track original positions for updates

  for (let squadIdx = 0; squadIdx < data.squads.length; squadIdx++) {
    const squad = data.squads[squadIdx];
    for (let playerIdx = 0; playerIdx < squad.players.length; playerIdx++) {
      const player = squad.players[playerIdx];
      if (player.position !== "GK") {
        playersToClassify.push({
          ...player,
          squadIdx,
          playerIdx,
        });
      }
    }
  }

  console.log(`📊 Players to classify: ${playersToClassify.length} non-GK players`);

  // Classify in batches of 10 to avoid rate limits
  const BATCH_SIZE = 10;
  const results = [];

  for (let i = 0; i < playersToClassify.length; i += BATCH_SIZE) {
    const batch = playersToClassify.slice(i, i + BATCH_SIZE);
    console.log(
      `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(playersToClassify.length / BATCH_SIZE)}...`
    );

    const batchPromises = batch.map((player) => classifySubposition(player));
    const batchResults = await Promise.all(batchPromises);

    for (let j = 0; j < batch.length; j++) {
      results.push({
        player: batch[j],
        subPosition: batchResults[j],
      });
    }

    // Rate limit: wait 1 second between batches
    if (i + BATCH_SIZE < playersToClassify.length) {
      await sleep(1000);
    }
  }

  // Apply results back to data
  console.log("💾 Applying classifications...");
  for (const result of results) {
    const { squadIdx, playerIdx } = result.player;
    data.squads[squadIdx].players[playerIdx].subPosition = result.subPosition;
  }

  // Add subPosition: 'GK' for all goalkeepers
  for (const squad of data.squads) {
    for (const player of squad.players) {
      if (player.position === "GK" && !player.subPosition) {
        player.subPosition = "GK";
      }
    }
  }

  // Write back to file
  fs.writeFileSync(ENRICHED_SQUADS_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Enriched squads written to ${ENRICHED_SQUADS_FILE}`);
  console.log(`✨ All ${playersToClassify.length} players now have subPosition field`);
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
