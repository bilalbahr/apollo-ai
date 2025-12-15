const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const avatarDir = './src/app/avatars';
const outputDir = './src/app/avatars/optimized';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all PNG files from avatars directory
const avatarFiles = fs.readdirSync(avatarDir).filter(file => file.endsWith('.png'));

console.log(`Found ${avatarFiles.length} avatar images to optimize...\n`);

async function optimizeImages() {
  for (const file of avatarFiles) {
    const inputPath = path.join(avatarDir, file);
    const outputFileName = file.replace('.png', '.webp');
    const outputPath = path.join(outputDir, outputFileName);

    try {
      const inputStats = fs.statSync(inputPath);
      const inputSizeKB = (inputStats.size / 1024).toFixed(2);

      await sharp(inputPath)
        .resize(128, 128, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputSizeKB = (outputStats.size / 1024).toFixed(2);
      const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

      console.log(`✓ ${file}`);
      console.log(`  ${inputSizeKB}KB → ${outputSizeKB}KB (${savings}% smaller)\n`);
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }

  console.log('Optimization complete!');
}

optimizeImages();
