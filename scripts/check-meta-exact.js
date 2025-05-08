const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, '../src/layouts/Layout.astro');
const content = fs.readFileSync(layoutPath, 'utf8');

// Buscar específicamente la línea con apple-mobile-app-capable
const lines = content.split('\n').map(line => line.trim());
const appleMobileCapableLine = lines.find(line => line.includes('apple-mobile-app-capable'));

console.log('Línea encontrada:');
console.log(appleMobileCapableLine);

// Verificar si el texto exacto está presente
const searchString = '<meta name="apple-mobile-app-capable"';
console.log(`\nTexto buscado: "${searchString}"`);
console.log(`¿Incluye el texto?: ${content.includes(searchString)}`); 