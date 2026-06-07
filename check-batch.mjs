import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.ANTHROPIC_API_KEY;
const BATCH_ID = "msgbatch_01FpyfACab2M7Ly5asMvErUN";

const client = axios.create({
  baseURL: "https://api.anthropic.com/v1",
  headers: {
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01",
  },
});

async function main() {
  console.log(`Checking batch ${BATCH_ID}...`);
  
  const resp = await client.get(`/messages/batches/${BATCH_ID}`);
  console.log(`Status: ${resp.data.processing_status}`);
  console.log(`Succeeded: ${resp.data.request_counts.succeeded}`);
  console.log(`Errored: ${resp.data.request_counts.errored}`);
  
  console.log(`\nFetching results...`);
  const results = await client.get(`/messages/batches/${BATCH_ID}/results`);
  console.log(`Results type:`, typeof results.data);
  console.log(`Sample (first item):`, JSON.stringify(results.data[0], null, 2));
}

main().catch(console.error);
