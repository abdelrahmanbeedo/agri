/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        sage: {
          50: '#f6f7f4',
          100: '#e8ebe3',
          200: '#d4dac9',
          300: '#b5c0a4',
          400: '#93a47f',
          500: '#748a61',
          600: '#5a6e4b',
          700: '#47573d',
          800: '#3b4734',
          900: '#333c2e',
          950: '#1a2018',
        },
        honey: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#fbbf24',
          600: '#f59e0b',
          700: '#d97706',
          800: '#b45309',
          900: '#92400e',
          950: '#78350f',
        },
        earth: {
          50: '#faf8f6',
          100: '#f5f0eb',
          200: '#e8ddd1',
          300: '#d4c4b0',
          400: '#bfa88a',
          500: '#a68d68',
          600: '#8b7355',
          700: '#6f5b45',
          800: '#5c4b3a',
          900: '#4c3f31',
          950: '#282018',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0,0,0,0.08), 0 4px 16px -4px rgba(0,0,0,0.06)',
        'card': '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
