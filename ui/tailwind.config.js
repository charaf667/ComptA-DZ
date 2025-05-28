/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Utilisation de classes pour le mode sombre
  theme: {
    extend: {
      colors: {
        // Couleur principale - Bleu minéral moderne
        primary: {
          50: '#f0f4fe',
          100: '#d9e3fc',
          200: '#bacefc',
          300: '#8cacf8',
          400: '#5581f3',
          500: '#3B82F6', // Couleur d'accent (CTA) - Bleu clair dynamique
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1E3A8A', // Couleur principale - Bleu minéral moderne
          950: '#172554',
        },
        // Couleur secondaire - Gris bleuté clair
        secondary: '#E5EAF1',
        // Couleurs de fond
        background: {
          DEFAULT: '#F9FAFB', // Blanc crème / gris très clair
          dark: '#111827',
        },
        // Couleurs de texte
        text: {
          primary: '#1F2937', // Gris anthracite
          secondary: '#6B7280', // Gris moyen
        },
        // Couleurs d'état
        success: '#10B981', // Vert doux
        error: '#EF4444',   // Rouge discret
        warning: '#F59E0B', // Orange
        info: '#3B82F6',    // Bleu
      },
      fontFamily: {
        // Typographies recommandées
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Roboto', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // Coins arrondis
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'card': '0.5rem', // 8px pour les cartes
      },
      boxShadow: {
        // Ombres douces
        'card': '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
