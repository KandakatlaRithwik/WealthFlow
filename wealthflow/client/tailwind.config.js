/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Colors are wired to CSS custom properties (see index.css) so that
        // every existing utility class (bg-paper, text-ink-700, border-ink/[0.07]...)
        // automatically re-themes when [data-theme="dark"] is set on <html> —
        // no per-component dark: variants needed.
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          700: 'rgb(var(--c-ink-700) / <alpha-value>)',
          500: 'rgb(var(--c-ink-500) / <alpha-value>)',
          300: 'rgb(var(--c-ink-300) / <alpha-value>)',
        },
        paper: {
          DEFAULT: 'rgb(var(--c-paper) / <alpha-value>)',
          100: 'rgb(var(--c-paper-100) / <alpha-value>)',
          200: 'rgb(var(--c-paper-200) / <alpha-value>)',
        },
        growth: {
          DEFAULT: 'rgb(var(--c-growth) / <alpha-value>)',
          100: 'rgb(var(--c-growth-100) / <alpha-value>)',
          600: 'rgb(var(--c-growth-600) / <alpha-value>)',
        },
        rust: {
          DEFAULT: 'rgb(var(--c-rust) / <alpha-value>)',
          100: 'rgb(var(--c-rust-100) / <alpha-value>)',
        },
        gold: { DEFAULT: 'rgb(var(--c-gold) / <alpha-value>)' },
        brand: {
          DEFAULT: 'rgb(var(--c-brand) / <alpha-value>)',
          2: 'rgb(var(--c-brand-2) / <alpha-value>)',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(30,27,75,0.06), 0 1px 1px rgba(30,27,75,0.04)',
        glow: '0 20px 60px -15px rgba(79,70,229,0.35)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        // Elegant italic serif for brand moments and headline text — mixed
        // deliberately with the plain, functional Inter used everywhere else.
        display: ['"Fraunces"', 'ui-serif', 'serif'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem' },
    },
  },
  plugins: [],
};
