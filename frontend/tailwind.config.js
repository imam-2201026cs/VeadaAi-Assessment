/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50: '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
          500: '#1D9E75',
          700: '#0F6E56',
          900: '#04342C',
        },
      },
    },
  },
  plugins: [],
};
