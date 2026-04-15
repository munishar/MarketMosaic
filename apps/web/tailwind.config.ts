import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1B3A5C', light: '#2E75B6', dark: '#0F2440' },
        secondary: { DEFAULT: '#2E75B6', light: '#5A9BD5', dark: '#1E5A8E' },
        success: { DEFAULT: '#16A34A', light: '#22C55E', dark: '#15803D' },
        warning: { DEFAULT: '#EAB308', light: '#FACC15', dark: '#CA8A04' },
        danger: { DEFAULT: '#DC2626', light: '#EF4444', dark: '#B91C1C' },
        surface: { DEFAULT: '#F8FAFC', card: '#FFFFFF', muted: '#F1F5F9' },
      },
    },
  },
  plugins: [],
} satisfies Config;
