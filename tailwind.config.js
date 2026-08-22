/** @type {import('tailwindcss').Config} */
module.exports = {
  // Drive dark mode from the `data-theme` attribute we set on <html>, NOT from
  // prefers-color-scheme. Without this, every `dark:` utility in the app would
  // silently follow the OS setting and ignore the in-app theme toggle.
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // lib/ holds the /pool role + mode accent class maps. Without this glob the
    // JIT compiler never sees those strings and every accent renders unstyled.
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ---- Semantic surface + text tokens (values flip in globals.css) ----
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
          3: 'rgb(var(--surface-3) / <alpha-value>)',
        },
        hairline: 'rgb(var(--hairline) / <alpha-value>)',
        content: {
          DEFAULT: 'rgb(var(--content) / <alpha-value>)',
          secondary: 'rgb(var(--content-secondary) / <alpha-value>)',
          muted: 'rgb(var(--content-muted) / <alpha-value>)',
        },
        // Scrim stays dark in both themes — it sits behind modals, over content.
        scrim: 'rgb(var(--scrim) / <alpha-value>)',

        // ---- Accent tokens, contrast-corrected per theme ----
        // Each is >= 4.5:1 against its own theme's canvas, so the same class is
        // legible in light and dark without per-call-site overrides.
        brand: 'rgb(var(--brand) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        female: 'rgb(var(--female) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Inter', 'sans-serif'],
        display: ['var(--font-plus-jakarta)', 'Inter', 'sans-serif'],
      },
      // Minimum legible mobile type sizes. The codebase leaned on
      // text-[8px]/[9px]/[10px]; these named steps replace them.
      fontSize: {
        micro: ['0.6875rem', { lineHeight: '1rem' }], // 11px — smallest allowed
        meta: ['0.75rem', { lineHeight: '1.125rem' }], // 12px
      },
      keyframes: {
        // `animate-fadeIn` was used 33 times but never defined — a no-op class.
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-glow': 'pulseGlow 3s infinite ease-in-out',
      },
      spacing: {
        // iOS notch / home-indicator insets for the fixed bottom navs.
        'safe-b': 'env(safe-area-inset-bottom, 0px)',
        'safe-t': 'env(safe-area-inset-top, 0px)',
      },
      minHeight: {
        tap: '44px', // Apple HIG / Material minimum touch target
      },
      minWidth: {
        tap: '44px',
      },
    },
  },
  plugins: [],
};
