import flowbiteReact from "flowbite-react/plugin/tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    ".flowbite-react/class-list.json"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Refined dark design tokens ─────────────────────────────
        canvas: '#0a0a0c',                       // page background
        surface: {                               // panels / cards
          DEFAULT: '#101014',
          2: '#15151a',                          // inputs, inset areas
          3: '#1c1c22',                          // raised / hover fill
          4: '#24242c',                          // strongest fill
        },
        line: {                                  // hairline borders
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.14)',
        },
        ink: {                                   // text ramp (all ≥4.5:1 on canvas/surface)
          DEFAULT: '#f4f4f5',
          dim: '#a1a1aa',
          mute: '#83838d',
        },
        accent: {
          DEFAULT: '#38bdf8',                    // sky-400
          soft: '#7dd3fc',                       // sky-300
          strong: '#0ea5e9',                     // sky-500
          deep: '#0284c7',                       // sky-600
          ink: '#06121c',                        // text on accent fills
        },
        ok: '#34d399',
        warn: '#fbbf24',
        bad: '#fb7185',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 32px -18px rgba(0,0,0,0.9)',
        pop: '0 24px 48px -20px rgba(0,0,0,0.85)',
        glow: '0 10px 30px -12px rgba(56,189,248,0.45)',
        ring: '0 0 0 1px rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        'fade-up': 'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [flowbiteReact],
}
