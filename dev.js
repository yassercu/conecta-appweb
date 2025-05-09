/**
 * Script para iniciar el servidor API mock y la aplicación en paralelo
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

// Verifica que el directorio mock-api exista
if (!fs.existsSync(path.join(__dirname, 'mock-api'))) {
    console.error(`${colors.red}Error: No se encontró el directorio mock-api${colors.reset}`);
    process.exit(1);
}

// Verifica que package.json exista en mock-api
if (!fs.existsSync(path.join(__dirname, 'mock-api', 'package.json'))) {
    console.error(`${colors.red}Error: No se encontró package.json en el directorio mock-api${colors.reset}`);
    process.exit(1);
}

console.log(`${colors.bright}${colors.magenta}=== Iniciando Orbita-Y ====${colors.reset}`);
console.log(`${colors.dim}Iniciando servidor API mock y aplicación...${colors.reset}`);

// Instala dependencias en mock-api si node_modules no existe
if (!fs.existsSync(path.join(__dirname, 'mock-api', 'node_modules'))) {
    console.log(`${colors.yellow}Instalando dependencias en mock-api...${colors.reset}`);

    const install = spawn('npm', ['install'], {
        cwd: path.join(__dirname, 'mock-api'),
        shell: true,
        stdio: 'inherit'
    });

    install.on('close', (code) => {
        if (code !== 0) {
            console.error(`${colors.red}Error al instalar dependencias en mock-api${colors.reset}`);
            process.exit(1);
        }

        startServices();
    });
} else {
    startServices();
}

function startServices() {
    // Iniciar servidor API mock
    const apiProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, 'mock-api'),
        shell: true,
    });

    // Prefijos para diferenciar la salida
    const apiPrefix = `${colors.cyan}[API] ${colors.reset}`;

    apiProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
            if (line.trim()) {
                console.log(`${apiPrefix}${line}`);
            }
        }
    });

    apiProcess.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
            if (line.trim()) {
                console.error(`${apiPrefix}${colors.red}${line}${colors.reset}`);
            }
        }
    });

    // Esperar un momento para que la API se inicie
    setTimeout(() => {
        // Iniciar aplicación principal
        const appProcess = spawn('npm', ['run', 'dev'], {
            cwd: __dirname,
            shell: true,
        });

        // Prefijos para diferenciar la salida
        const appPrefix = `${colors.green}[APP] ${colors.reset}`;

        appProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    console.log(`${appPrefix}${line}`);
                }
            }
        });

        appProcess.stderr.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    console.error(`${appPrefix}${colors.red}${line}${colors.reset}`);
                }
            }
        });

        // Manejar cierre de procesos
        appProcess.on('close', (code) => {
            console.log(`${colors.yellow}La aplicación se ha detenido con código ${code}${colors.reset}`);
            if (apiProcess) {
                apiProcess.kill();
            }
            process.exit(code);
        });
    }, 2000);

    // Manejar cierre de procesos
    apiProcess.on('close', (code) => {
        console.log(`${colors.yellow}El servidor API se ha detenido con código ${code}${colors.reset}`);
        process.exit(code);
    });

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log(`${colors.yellow}Deteniendo servicios...${colors.reset}`);
        if (apiProcess) {
            apiProcess.kill();
        }
        process.exit(0);
    });
}

console.log(`${colors.green}Presiona Ctrl+C para detener todos los servicios${colors.reset}`); 