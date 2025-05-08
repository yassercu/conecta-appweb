const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Asegurarse de que el directorio existe
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

async function generatePWAIcons() {
    try {
        // Leer el archivo SVG existente
        const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'));

        // Generar tamaños de iconos PWA
        const sizes = [192, 512];

        for (const size of sizes) {
            // Icono normal
            await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

            console.log(`✅ Generado icon-${size}x${size}.png`);

            // Icono maskable con padding para requisitos de PWA
            if (size === 512) {
                // Para máscaras PWA, agregamos padding del 10%
                const padding = Math.floor(size * 0.1);
                await sharp(svgBuffer)
                    .resize(size - padding * 2, size - padding * 2)
                    .extend({
                        top: padding,
                        bottom: padding,
                        left: padding,
                        right: padding,
                        background: { r: 37, g: 99, b: 235, alpha: 1 } // Mismo color que theme-color
                    })
                    .png()
                    .toFile(path.join(iconsDir, `icon-${size}x${size}-maskable.png`));

                console.log(`✅ Generado icon-${size}x${size}-maskable.png`);
            }
        }

        // Generar ícono para Apple
        await sharp(svgBuffer)
            .resize(180, 180)
            .png()
            .toFile(path.join(iconsDir, 'apple-touch-icon.png'));

        console.log('✅ Generado apple-touch-icon.png');

        console.log('✅ Todos los íconos PWA han sido generados correctamente');
    } catch (error) {
        console.error('❌ Error al generar íconos:', error);
    }
}

generatePWAIcons(); 