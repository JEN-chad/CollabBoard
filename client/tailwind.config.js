/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#030712',
        surface: '#0F172A',
        elevated: '#111827',
        border: '#1F2937',
        primary: '#6366F1',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#dce5fe',
          300: '#c3d3fd',
          400: '#9fbafd',
          500: '#7096fc',
          600: '#4f72fa',
          700: '#3955e8',
          800: '#3045cc',
          900: '#2b3ca3',
          950: '#1e2663',
        },
        darkBg: '#030712',
        darkCard: '#0F172A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
