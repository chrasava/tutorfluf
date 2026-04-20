import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#1F1A23',
          'black-deep': '#17111B',
          white: '#FFF8F8',
          'white-soft': '#F5EEEE',
          purple: '#CC91F0',
          'purple-dark': '#9E5ECF',
          pink: '#FFB0C2',
          'pink-dark': '#FF87A6',
          green: '#93F091',
          'green-dark': '#4FCD4C',
          yellow: '#FFB500',
          'yellow-dark': '#FF9100',
          orange: '#FF702B',
          'orange-dark': '#EB4521',
          red: '#FF405E',
          'red-dark': '#D41A45',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(var(--rot, 0deg))' },
          '50%': { transform: 'translateY(-12px) rotate(var(--rot, 0deg))' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.3s ease-out',
        'pulse-ring': 'pulse-ring 1.2s ease-out infinite',
        'blink': 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}

export default config
