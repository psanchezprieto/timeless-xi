import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const RAW_SQUADS_FILE = path.join(DATA_DIR, "raw-squads.json");
const ENRICHED_SQUADS_FILE = path.join(DATA_DIR, "enriched-squads.json");
const ENRICHMENT_GAPS_FILE = path.join(DATA_DIR, "enrichment-gaps.json");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const BATCH_ID = "msgbatch_01FpyfACab2M7Ly5asMvErUN";

function getEraFallback(year) {
  if (year < 1950) return 55;
  if (year < 1974) return 60;
  if (year < 2000) return 70;
  return 78;
}

async function main() {
  console.log("📖 Reading raw squads...");
  const rawData = JSON.parse(fs.readFileSync(RAW_SQUADS_FILE, "utf-8"));

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

  console.log(`📊 Total players: ${playersToRate.length}`);
  console.log(`📥 Fetching batch results...`);

  const client = axios.create({
    baseURL: "https://api.anthropic.com/v1",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    responseType: "arraybuffer",
  });

  const response = await client.get(`/messages/batches/${BATCH_ID}/results`);
  const text = response.data.toString();
  const lines = text.split("\n").filter(l => l.trim());

  console.log(`Processing ${lines.length} results...`);

  const ratings = new Map();
  const gaps = [];

  for (let i = 0; i < lines.length; i++) {
    const result = JSON.parse(lines[i]);
    const playerIdx = parseInt(result.custom_id.split("-")[1]);
    const player = playersToRate[playerIdx];

    if (result.result.type === "succeeded") {
      const text = result.result.message.content[0].text.trim();
      const rating = parseInt(text);

      if (!isNaN(rating) && rating >= 0 && rating <= 100) {
        const confidence = /^\d{1,3}$/.test(text) ? 0.95 : 0.7;
        ratings.set(playerIdx, { rating, confidence });
      } else {
        gaps.push({ player, reason: "Invalid rating" });
        ratings.set(playerIdx, { rating: getEraFallback(player.year), confidence: 0.3 });
      }
    } else {
      gaps.push({ player, reason: result.result.type });
      ratings.set(playerIdx, { rating: getEraFallback(player.year), confidence: 0.2 });
    }

    if ((i + 1) % 2000 === 0) {
      console.log(`  ${i + 1}/${lines.length}...`);
    }
  }

  // Build enriched
  console.log("🔄 Building enriched squads...");
  const enrichedData = {
    squads: rawData.squads.map((squad) => ({
      ...squad,
      players: squad.players.map((player, localIdx) => {
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

  fs.writeFileSync(ENRICHED_SQUADS_FILE, JSON.stringify(enrichedData, null, 2));

  const gapsReport = {
    totalPlayers: playersToRate.length,
    successful: playersToRate.length - gaps.length,
    gaps: gaps.length,
  };

  fs.writeFileSync(ENRICHMENT_GAPS_FILE, JSON.stringify(gapsReport, null, 2));

  const avgRating = Array.from(ratings.values()).reduce((sum, r) => sum + r.rating, 0) / ratings.size;
  const avgConf = Array.from(ratings.values()).reduce((sum, r) => sum + r.confidence, 0) / ratings.size;

  console.log("\n📈 Results:");
  console.log(`  Avg rating: ${avgRating.toFixed(1)}/100`);
  console.log(`  Avg confidence: ${(avgConf * 100).toFixed(1)}%`);
  console.log(`  Gaps: ${gaps.length}`);
  console.log("\n✅ Phase 1b complete!");
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
