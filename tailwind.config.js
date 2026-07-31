module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#081B3A',
          900: '#030914',
          800: '#050E1F',
          700: '#08152B',
          600: '#0B1E3A',
          500: '#0F2444',
          400: '#132A4C',
          300: '#1A365C',
          200: '#244270',
          100: '#2E4E80',
        },
        royal: {
          DEFAULT: '#D4AF37',
          50: '#F8EFD4',
          100: '#F5E7BE',
          200: '#EED28F',
          300: '#E6C36A',
          400: '#D4AF37',
          500: '#B5942A',
          600: '#8B7322',
          700: '#6B581A',
          800: '#4D4012',
          900: '#2E2609',
        },
        gold: {
          light: '#F8EFD4',
          DEFAULT: '#D4AF37',
          dim: '#B5942A',
          dark: '#8B7322',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 2px 12px rgba(212, 175, 55, 0.12)',
        'gold-md': '0 4px 20px rgba(212, 175, 55, 0.16)',
        'gold-lg': '0 8px 32px rgba(212, 175, 55, 0.22)',
        'card': '0 6px 24px rgba(0, 0, 0, 0.35)',
        'inner-gold': 'inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '28px',
        '5xl': '32px',
      },
    },
  },
  plugins: [],
};
