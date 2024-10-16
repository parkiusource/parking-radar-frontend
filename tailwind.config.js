/** @type {import('tailwindcss').Config} */

import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        ...colors,
        primary: { ...colors.sky, DEFAULT: colors.sky[500] },
        secondary: { ...colors.gray, DEFAULT: colors.gray[800] },
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
