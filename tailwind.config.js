/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular'],
      },
      colors: {
        // Deep steel-blue — sidebar, nav, primary actions
        ink: {
          25:  '#F5F7FA',
          50:  '#EBF0F7',
          100: '#D1DDEF',
          200: '#A4BCE0',
          300: '#769BD1',
          400: '#4879C2',
          500: '#2A5BAD',
          600: '#1E4694',
          700: '#15347B',
          800: '#0E2462',
          900: '#081649',   // deep sidebar
          950: '#040C2E',
        },
        // Vivid coral-orange — CTAs, accents, highlights
        flame: {
          50:  '#FFF4EF',
          100: '#FFE3D7',
          200: '#FFC5AF',
          300: '#FFA487',
          400: '#FF825F',
          500: '#F05A2A',   // main CTA
          600: '#CC4118',
          700: '#A82F0D',
          800: '#842008',
          900: '#601405',
        },
        // Warm neutral — backgrounds, borders, text
        stone: {
          25:  '#FAFAF9',
          50:  '#F5F5F4',
          100: '#E7E5E4',
          200: '#D6D3D1',
          300: '#A8A29E',
          400: '#78716C',
          500: '#57534E',
          600: '#44403C',
          700: '#292524',
          800: '#1C1917',
          900: '#0C0A09',
        },
        // Success green
        sage: {
          50:  '#F0FBF5',
          100: '#D4F5E2',
          200: '#A8EBC6',
          300: '#6FDBA0',
          400: '#3AC77B',
          500: '#1AAD61',
          600: '#13904F',
          700: '#0E713E',
          800: '#095230',
          900: '#053421',
        },
        // Amber warning
        amber: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Danger red
        crimson: {
          50:  '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FCA5AD',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)',
        elevated: '0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)',
        modal: '0 20px 60px -10px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}
