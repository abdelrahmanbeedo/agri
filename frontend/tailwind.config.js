/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        sage: {
          50: '#f3f7f2',
          100: '#e3ebe0',
          200: '#c8d8c1',
          300: '#a4bf9a',
          400: '#7fa373',
          500: '#5c854e',
          600: '#476a3c',
          700: '#395430',
          800: '#2d4527',
          900: '#24371f',
          950: '#152012',
        },
        honey: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)',
        'elevated': '0 4px 16px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)',
        'modal': '0 20px 60px -12px rgba(0,0,0,0.25), 0 8px 24px -6px rgba(0,0,0,0.08)',
        'glow-sage': '0 0 0 1px rgba(92, 133, 78, 0.15), 0 4px 16px rgba(92, 133, 78, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 400ms ease both',
        'slide-up': 'slideUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'scale-in': 'scaleIn 300ms ease both',
        'slide-down': 'slideDown 300ms ease both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
