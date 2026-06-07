#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '..', 'data', 'temp');
const PUBLIC_DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const DATA_DIR = path.join(__dirname, '..', 'data');

function compressFile(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const source = fs.createReadStream(inputPath);
    const destination = fs.createWriteStream(outputPath);
    const gzip = zlib.createGzip();

    source.pipe(gzip).pipe(destination);
    destination.on('finish', resolve);
    destination.on('error', reject);
    source.on('error', reject);
  });
}

async function main() {
  try {
    console.log('🔐 Compressing JSON files with gzip...\n');

    // Create public/data directory if needed
    if (!fs.existsSync(PUBLIC_DATA_DIR)) {
      fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
    }

    // Read temp-metadata.json for decade info
    const metadataPath = path.join(DATA_DIR, 'temp-metadata.json');
    if (!fs.existsSync(metadataPath)) {
      throw new Error('Missing temp-metadata.json. Run "npm run build:data" first.');
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    // Compress coaches.json if it exists
    const coachesPath = path.join(DATA_DIR, 'coaches.json');
    const coachesCompressed = {};
    if (fs.existsSync(coachesPath)) {
      const outputPath = path.join(PUBLIC_DATA_DIR, 'coaches.json.gz');
      const stats = fs.statSync(coachesPath);
      const uncompressedSize = stats.size;
      await compressFile(coachesPath, outputPath);
      const compressedStats = fs.statSync(outputPath);
      const compressedSize = compressedStats.size;
      const ratio = ((1 - compressedSize / uncompressedSize) * 100).toFixed(1);
      coachesCompressed.uncompressedSize = uncompressedSize;
      coachesCompressed.compressedSize = compressedSize;
      coachesCompressed.compressionRatio = `${ratio}%`;
      console.log('✅ coaches.json.gz');
      console.log(`   Uncompressed: ${(uncompressedSize / 1024).toFixed(2)} KB`);
      console.log(`   Compressed: ${(compressedSize / 1024).toFixed(2)} KB`);
      console.log(`   Ratio: ${ratio}%`);
    }

    // Compress each decade file
    const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith('squads-') && f.endsWith('.json'));
    const compressedFiles = [];

    for (const filename of files) {
      const inputPath = path.join(TEMP_DIR, filename);
      const outputPath = path.join(PUBLIC_DATA_DIR, `${filename}.gz`);

      const stats = fs.statSync(inputPath);
      const uncompressedSize = stats.size;

      await compressFile(inputPath, outputPath);

      const compressedStats = fs.statSync(outputPath);
      const compressedSize = compressedStats.size;
      const ratio = ((1 - compressedSize / uncompressedSize) * 100).toFixed(1);

      compressedFiles.push({
        original: filename,
        compressed: `${filename}.gz`,
        uncompressedSize,
        compressedSize,
        compressionRatio: `${ratio}%`,
      });

      console.log(`✅ ${filename}.gz`);
      console.log(`   Uncompressed: ${(uncompressedSize / 1024).toFixed(2)} KB`);
      console.log(`   Compressed: ${(compressedSize / 1024).toFixed(2)} KB`);
      console.log(`   Ratio: ${ratio}%`);
    }

    // Generate public meta.json
    const totalUncompressed = compressedFiles.reduce((sum, f) => sum + f.uncompressedSize, 0) + (coachesCompressed.uncompressedSize || 0);
    const totalCompressed = compressedFiles.reduce((sum, f) => sum + f.compressedSize, 0) + (coachesCompressed.compressedSize || 0);

    const publicMetadata = {
      generatedAt: new Date().toISOString(),
      format: 'optimized-keys',
      keyMap: metadata.keyMap,
      decades: metadata.decades.map(d => {
        const compressed = compressedFiles.find(f => f.compressed === d.filename);
        return {
          name: d.name,
          startYear: d.startYear,
          endYear: d.endYear,
          filename: d.filename,
          playerCount: d.playerCount,
          countryCount: d.countryCount,
          squadCount: d.squadCount,
          compressedSize: compressed ? compressed.compressedSize : 0,
        };
      }),
      coaches: {
        filename: 'coaches.json.gz',
        compressedSize: coachesCompressed.compressedSize || 0,
        uncompressedSize: coachesCompressed.uncompressedSize || 0,
      },
      summary: metadata.summary,
      compressionStats: {
        totalFiles: files.length + (coachesCompressed.uncompressedSize ? 1 : 0),
        totalUncompressed,
        totalCompressed,
        overallRatio: `${(
          (1 - totalCompressed / totalUncompressed) * 100
        ).toFixed(1)}%`,
      },
    };

    const metaPath = path.join(PUBLIC_DATA_DIR, 'meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(publicMetadata, null, 2));

    console.log('\n📊 Public metadata:');
    console.log(`✅ meta.json created`);
    console.log(`   Total uncompressed: ${(publicMetadata.compressionStats.totalUncompressed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total compressed: ${(publicMetadata.compressionStats.totalCompressed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Overall ratio: ${publicMetadata.compressionStats.overallRatio}`);

    // Cleanup temp files (keep them for now in case we need to debug)
    console.log('\n✅ Phase 1c (compress) complete!');
    console.log(`   Output: public/data/ (5 .json.gz files + meta.json)`);
    console.log(`   Status: Ready for Phase 2 (React UI)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
