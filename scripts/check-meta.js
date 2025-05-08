const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, '../src/layouts/Layout.astro');
const content = fs.readFileSync(layoutPath, 'utf8');

console.log('Verificando meta tags en Layout.astro:');
console.log(`manifest: ${content.includes('<link rel="manifest"')}`);
console.log(`theme-color: ${content.includes('<meta name="theme-color"')}`);
console.log(`apple-mobile-app-capable: ${content.includes('<meta name="apple-mobile-app-capable"')}`);
console.log(`apple-touch-icon: ${content.includes('<link rel="apple-touch-icon"')}`);