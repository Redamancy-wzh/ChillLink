import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        frost: '#F2F6F8',
        snow: '#FFFFFF',
        abyss: '#0C1E2B',
        'ink-60': '#4A5F6E',
        'ink-30': '#8FA3B0',
        ice: '#6CC9EE',
        cryo: '#1478C8',
        signal: '#FF7A2F',
        line: 'rgba(12,30,43,.10)',
        'line-2': 'rgba(12,30,43,.20)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(.16,1,.3,1)',
        thermo: 'cubic-bezier(.33,1,.68,1)',
      },
      maxWidth: {
        prose: '68ch',
        page: '1320px',
      },
    },
  },
  plugins: [],
} satisfies Config
