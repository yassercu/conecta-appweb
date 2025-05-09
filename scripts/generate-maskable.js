const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateMaskableIcon() {
    try {
        const size = 512;
        const imageBuffer = fs.readFileSync(path.join(__dirname, '../public/logo.png'));
        const padding = Math.floor(size * 0.1);
        await sharp(imageBuffer)
            .resize(size - padding * 2, size - padding * 2, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .extend({
                top: padding,
                bottom: padding,
                left: padding,
                right: padding,
                background: { r: 37, g: 99, b: 235, alpha: 1 }
            })
            .png()
            .toFile(path.join(__dirname, '../public/icons/icon-512x512-maskable.png'));

        console.log('✅ Generado icon-512x512-maskable.png');
    } catch (error) {
        console.error('Error:', error);
    }
}

generateMaskableIcon();