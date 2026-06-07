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
const ENRICHED_SQUADS_FILE = path.join(DATA_DIR, "enriched-squads.json");
const ENRICHMENT_GAPS_FILE = path.join(DATA_DIR, "enrichment-gaps.json");

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

// Era-based fallback ratings (when Claude can't rate a player)
// FIFA-style 0-100 scale, minimum 50 for World Cup squad players
function getEraFallback(year) {
  if (year < 1950) return 55; // Pre-modern era (barely made it)
  if (year < 1974) return 60; // Early era (solid squad player)
  if (year < 2000) return 70; // Modern era (good player)
  return 78; // Contemporary era (very good player)
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("📖 Reading raw squads...");
  const rawData = JSON.parse(fs.readFileSync(RAW_SQUADS_FILE, "utf-8"));

  // Flatten all players with metadata
  const playersToRate = [];
  for (const squad of rawData.squads) {
    for (const player of squad.players) {
      playersToRate.push({
        name: player.name,
        position: player.position,
        country: squad.countryName || squad.country,
        year: player.year,
        number: player.number,
      });
    }
  }

  console.log(`📊 Total players to rate: ${playersToRate.length}`);
  console.log(`💰 Using batch API for 50% cost savings`);

  // Create batch requests
  const batchRequests = playersToRate.map((player, idx) => ({
    custom_id: `player-${idx}`,
    params: {
      model: "claude-sonnet-4-6",
      max_tokens: 10,
      messages: [
        {
          role: "user",
          content: `Rate this footballer 0-100 (FIFA-style) historically based on era, position, country, and year. Respond ONLY with a number 0-100. Any player who made a World Cup squad is at least 50/100.

Name: ${player.name}
Position: ${player.position}
Country: ${player.country}
Year: ${player.year}`,
        },
      ],
    },
  }));

  // Submit batch
  console.log("🚀 Submitting batch to API...");
  let batch;
  try {
    const response = await client.post("/messages/batches", {
      requests: batchRequests,
    });
    batch = response.data;
  } catch (err) {
    console.error(
      "❌ Error submitting batch:",
      (err.response && err.response.data) || err.message
    );
    process.exit(1);
  }

  console.log(`✓ Batch created: ${batch.id}`);
  console.log(`  Status: ${batch.processing_status}`);

  // Poll for completion
  let completedBatch = batch;
  while (true) {
    if (completedBatch.processing_status === "ended") {
      console.log(`✓ Batch complete!`);
      console.log(
        `  Succeeded: ${completedBatch.request_counts.succeeded}`
      );
      console.log(`  Errored: ${completedBatch.request_counts.errored}`);
      break;
    }

    console.log(
      `⏳ Status: ${completedBatch.processing_status} (processing: ${completedBatch.request_counts.processing})`
    );
    await sleep(5000);

    try {
      const response = await client.get(`/messages/batches/${batch.id}`);
      completedBatch = response.data;
    } catch (err) {
      console.error("❌ Error polling batch:", err.message);
      process.exit(1);
    }
  }

  // Process results
  console.log("📥 Processing results...");
  const ratings = new Map(); // player index -> rating
  const gaps = []; // uncertain ratings or errors

  let resultIdx = 0;
  let pageAfter = null;

  while (true) {
    try {
      const params = {
        limit: 1000,
      };
      if (pageAfter) params.after = pageAfter;

      const response = await client.get(`/messages/batches/${batch.id}/results`, {
        params,
      });
      const results = Array.isArray(response.data) ? response.data : (response.data.data || []);

      for (const result of results) {
        const playerIdx = parseInt(result.custom_id.split("-")[1]);
        const player = playersToRate[playerIdx];

        if (result.result.type === "succeeded") {
          const text = result.result.message.content[0].text.trim();
          const rating = parseInt(text);

          if (!isNaN(rating) && rating >= 0 && rating <= 100) {
            // Confidence: exact number = high, other patterns = lower
            const confidence = /^\d{1,3}$/.test(text) ? 0.95 : 0.7;
            ratings.set(playerIdx, { rating, confidence });
          } else {
            gaps.push({
              player,
              reason: "Invalid response format",
              response: text,
            });
            ratings.set(playerIdx, {
              rating: getEraFallback(player.year),
              confidence: 0.3,
            });
          }
        } else if (result.result.type === "errored") {
          gaps.push({
            player,
            reason: "API error",
            error: result.result.error.message,
          });
          ratings.set(playerIdx, {
            rating: getEraFallback(player.year),
            confidence: 0.2,
          });
        } else if (result.result.type === "expired") {
          gaps.push({
            player,
            reason: "Request expired",
          });
          ratings.set(playerIdx, {
            rating: getEraFallback(player.year),
            confidence: 0.1,
          });
        }

        resultIdx++;
      }

      if (resultIdx % 1000 === 0) {
        console.log(`  Processed ${resultIdx}/${playersToRate.length}...`);
      }

      // Check if there are more results
      if (response.data && response.data.after) {
        pageAfter = response.data.after;
      } else if (results.length > 0 && results.length < params.limit) {
        break; // Got fewer than requested, so we're done
      } else if (results.length === 0) {
        break; // No more results
      } else {
        break; // Default: stop if no pagination info
      }
    } catch (err) {
      console.error("❌ Error fetching results:", err.message);
      process.exit(1);
    }
  }

  // Build enriched squads
  console.log("🔄 Building enriched squads...");
  const enrichedData = {
    squads: rawData.squads.map((squad) => ({
      ...squad,
      players: squad.players.map((player, localIdx) => {
        // Find global index for this player
        let globalIdx = 0;
        for (const s of rawData.squads) {
          if (s === squad) break;
          globalIdx += s.players.length;
        }
        globalIdx += localIdx;

        const ratingData = ratings.get(globalIdx) || {
          rating: getEraFallback(player.year),
          confidence: 0,
        };

        return {
          ...player,
          rating: ratingData.rating,
          confidence: ratingData.confidence,
        };
      }),
    })),
  };

  // Save enriched data
  console.log(`💾 Saving enriched squads to ${ENRICHED_SQUADS_FILE}...`);
  fs.writeFileSync(
    ENRICHED_SQUADS_FILE,
    JSON.stringify(enrichedData, null, 2)
  );

  // Save gaps report
  const gapsReport = {
    totalPlayers: playersToRate.length,
    successfulRatings: playersToRate.length - gaps.length,
    uncertainRatings: gaps.length,
    gaps: gaps.slice(0, 100), // Keep first 100 for review
    gapStats: {
      apiErrors: gaps.filter((g) => g.reason === "API error").length,
      invalidFormat: gaps.filter((g) => g.reason === "Invalid response format")
        .length,
      expired: gaps.filter((g) => g.reason === "Request expired").length,
    },
  };

  console.log(`📋 Saving enrichment gaps to ${ENRICHMENT_GAPS_FILE}...`);
  fs.writeFileSync(ENRICHMENT_GAPS_FILE, JSON.stringify(gapsReport, null, 2));

  // Statistics
  const avgRating =
    Array.from(ratings.values()).reduce((sum, r) => sum + r.rating, 0) /
    ratings.size;
  const avgConfidence =
    Array.from(ratings.values()).reduce((sum, r) => sum + r.confidence, 0) /
    ratings.size;
  const highConfidence = Array.from(ratings.values()).filter(
    (r) => r.confidence > 0.8
  ).length;

  console.log("\n📈 Enrichment Statistics:");
  console.log(`  Total players enriched: ${playersToRate.length}`);
  console.log(`  Successful API calls: ${playersToRate.length - gaps.length}`);
  console.log(`  Average rating: ${avgRating.toFixed(1)}/100 (FIFA-style)`);
  console.log(`  Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
  console.log(`  High confidence (>0.8): ${highConfidence}`);
  console.log(`  Uncertain ratings: ${gaps.length}`);

  console.log("\n✅ Enrichment complete!");
  console.log(`   Batch ID: ${batch.id}`);
  console.log(`   Output files ready for Phase 1c`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
