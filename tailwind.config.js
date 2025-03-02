/** @type {import('tailwindcss').Config} */

import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        ...colors,
        primary: { ...colors.sky, DEFAULT: colors.sky[500] },
        secondary: { ...colors.gray, DEFAULT: colors.gray[800] },
        background: { ...colors.gray, DEFAULT: colors.gray[50] },
        'dark-green': {
          pine: '#2E7D32',
          emerald: '#1B5E20',
          moss: '#33691E',
        },
        'dark-red': {
          crimson: '#B71C1C',
          garnet: '#8B0000',
          wine: '#7B1F1F',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
      },
      zIndex: {
        60: '60',
      },
      height: {
        '128': '32rem',
      },
    },
  },
  plugins: [
    plugin(({ theme, addUtilities }) => {
      const patternUtilities = {};

      const colors = theme('colors');

      for (const color in colors) {
        if (typeof colors[color] === 'object') {
          patternUtilities[`.bg-boxes-${color}`] = {
            backgroundColor: colors[color][950],
            backgroundImage: `linear-gradient(${colors[color][900]} 0.1rem, transparent 0.1rem), linear-gradient(to right, ${colors[color][900]} 0.1rem, ${colors[color][950]} 0.1rem)`,
            backgroundSize: '1.5rem 1.5rem',
          };
        }
      }

      addUtilities(patternUtilities);
    }),
    plugin(({ theme, addUtilities }) => {
      const textShadowUtilities = {};

      const colors = theme('colors');

      for (const color in colors) {
        if (typeof colors[color] === 'object') {
          textShadowUtilities[`.text-shadow-${color}`] = {
            textShadow: `0 0 1rem ${colors[color][500]}`,
          };
        }
      }

      addUtilities(textShadowUtilities);
    }),
  ],
};
