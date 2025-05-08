const fs = require('fs');
const path = require('path');

// Lista de archivos necesarios para una PWA
const requiredFiles = [
    { path: 'public/manifest.webmanifest', desc: 'Archivo de manifiesto' },
    { path: 'public/service-worker.js', desc: 'Service Worker' },
    { path: 'public/icons/icon-192x192.png', desc: 'Ícono 192x192' },
    { path: 'public/icons/icon-512x512.png', desc: 'Ícono 512x512' },
    { path: 'public/icons/icon-512x512-maskable.png', desc: 'Ícono maskable' },
    { path: 'public/icons/apple-touch-icon.png', desc: 'Ícono para Apple' }
];

// Verificar en el Layout.astro
const layoutPath = path.join(__dirname, '../src/layouts/Layout.astro');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

console.log('\n🔍 Verificando configuración PWA...\n');

// Verificar archivos
console.log('📁 Verificando archivos necesarios:');
let allFilesExist = true;
for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, '..', file.path);
    const exists = fs.existsSync(fullPath);
    console.log(`${exists ? '✅' : '❌'} ${file.desc} (${file.path})`);
    if (!exists) allFilesExist = false;
}

// Verificar meta tags en el Layout
console.log('\n📄 Verificando meta tags en Layout.astro:');
const requiredMetaTags = [
    { pattern: '<link rel="manifest"', desc: 'Enlace al manifest' },
    { pattern: '<meta name="theme-color"', desc: 'Meta theme-color' },
    { pattern: '<meta name="apple-mobile-app-capable"', desc: 'Meta apple-mobile-app-capable' },
    { pattern: '<link rel="apple-touch-icon"', desc: 'Enlace a apple-touch-icon' }
];

let allMetaTagsExist = true;
for (const tag of requiredMetaTags) {
    const exists = layoutContent.includes(tag.pattern);
    console.log(`${exists ? '✅' : '❌'} ${tag.desc}`);
    if (!exists) allMetaTagsExist = false;
}

// Verificar registro del Service Worker
console.log('\n📡 Verificando registro del Service Worker:');
const serviceWorkerRegistration = /navigator\.serviceWorker\.register/.test(layoutContent);
console.log(`${serviceWorkerRegistration ? '✅' : '❌'} Código de registro del Service Worker`);

// Resultado final
console.log('\n📊 Resultado:');
if (allFilesExist && allMetaTagsExist && serviceWorkerRegistration) {
    console.log('✅ ¡Tu aplicación está correctamente configurada como PWA!');
} else {
    console.log('⚠️ Existen aspectos pendientes para completar la configuración PWA.');
}
console.log('\n');

// Sugerencias adicionales
console.log('💡 Recuerda probar tu PWA con las siguientes herramientas:');
console.log('  • Lighthouse en Chrome DevTools');
console.log('  • PWA Builder: https://www.pwabuilder.com/');
console.log('  • Chrome DevTools → Application → Manifest & Service Workers');
console.log('\n'); 