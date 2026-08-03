/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './app.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#080b0f',
        panel: '#10151b',
        line: '#252d36',
        acid: '#d9ff66',
        sky: '#7dd3fc',
      },
      boxShadow: {
        glow: '0 0 60px rgba(217, 255, 102, 0.08)',
      },
    },
  },
};
