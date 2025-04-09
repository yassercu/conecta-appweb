/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Colores principales
        'primary': {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          dark: '#1d4ed8'
        },
        'secondary': {
          DEFAULT: '#e63946',
          light: '#f87171',
          dark: '#b91c1c'
        },
        'accent': {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706'
        },
        
        // Categorías de servicios
        'category': {
          'gastronomia': '#2a9d8f',
          'alojamiento': '#e9c46a',
          'reparaciones': '#264653',
          'transporte': '#f4a261',
          'belleza': '#d8bfd8',
          'tecnologia': '#023e8a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'hover': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}

