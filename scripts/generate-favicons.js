import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source image (using the existing logo)
const sourceImage = path.join(__dirname, '../public/UPA-Summer-Championship.png');
const publicDir = path.join(__dirname, '../public');

// Generate favicon.ico (requires multiple sizes in one file)
async function generateFavicon() {
  const sizes = [16, 32, 48];
  
  // Generate PNGs for each size first
  const pngFiles = [];
  
  for (const size of sizes) {
    const outputFile = path.join(publicDir, `favicon-${size}.tmp.png`);
    await sharp(sourceImage)
      .resize(size, size)
      .toFile(outputFile);
    pngFiles.push(outputFile);
  }
  
  try {
    // Convert PNGs to ICO format
    const icoBuffer = await pngToIco(pngFiles);
    
    // Save the ICO file
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('Generated favicon.ico');
  } finally {
    // Clean up temporary files
    pngFiles.forEach(file => {
      try {
        fs.unlinkSync(file);
      } catch (e) {
        console.warn(`Could not delete temporary file ${file}:`, e);
      }
    });
  }
}

// Generate other icon sizes
async function generateIcons() {
  const icons = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  await Promise.all(
    icons.map(({ name, size }) =>
      sharp(sourceImage)
        .resize(size, size)
        .toFile(path.join(publicDir, name))
        .then(() => console.log(`Generated ${name}`))
        .catch(err => console.error(`Error generating ${name}:`, err))
    )
  );
}

// Generate all icons
async function main() {
  try {
    console.log('Starting favicon generation...');
    await generateFavicon();
    await generateIcons();
    console.log('✅ All favicons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

// Run the generator
main().catch(console.error);
