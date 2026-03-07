const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT = path.join(__dirname, '../assets/images/aerosky.svg');
const OUTPUT_DIR = path.join(__dirname, '../assets/images');

const SIZES = [
    { name: 'icon.png', width: 1024, height: 1024 },
    { name: 'adaptive-icon.png', width: 1024, height: 1024 },
    { name: 'splash-icon.png', width: 2048, height: 2048 },
    { name: 'favicon.png', width: 48, height: 48 }
];

async function convert() {
    if (!fs.existsSync(INPUT)) {
        console.error(`Input file not found: ${INPUT}`);
        process.exit(1);
    }

    for (const size of SIZES) {
        console.log(`Converting ${size.name}...`);
        await sharp(INPUT)
            .resize(size.width, size.height, {
                fit: 'contain',
                background: { r: 17, g: 24, b: 39 } // #111827
            })
            .toFile(path.join(OUTPUT_DIR, size.name));
    }
    console.log('Conversion complete!');
}

convert().catch(err => {
    console.error(err);
    process.exit(1);
});
