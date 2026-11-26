/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Champagne Silk, Warm Obsidian & Burnished Copper Palette
        salon: {
          primary: '#B4563E',      // Burnished Copper Primary Accent & CTAs
          secondary: '#D6A984',    // Champagne Gold-Bronze Secondary Accent
          soft: '#F3E7DB',         // Soft Warm Sand Section Tints
          status: '#2FA66A',       // Botanical Emerald Live Status Accent
          dark: '#1A1614',         // Warm Obsidian Primary Text & Surfaces
          muted: '#665B54',        // Warm Taupe Muted Ink
          light: '#F7F1E8',        // Warm Cashmere Silk Canvas
          card: '#FFFDF8',         // Warm Pearl Ivory Elevated Cards
          surface: '#EAE0D2',      // Warm Sandstone Secondary Surface
          border: 'rgba(26, 22, 20, 0.14)',
          borderHover: 'rgba(26, 22, 20, 0.28)',
        }
      },
      fontFamily: {
        sans: ['"Instrument Sans"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Fragment Mono"', 'monospace'],
        editorial: ['Georgia', '"Playfair Display"', 'serif'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.02em',
        widest: '0.25em',
      },
      boxShadow: {
        'glow-pink': '0 0 30px -5px rgba(180, 86, 62, 0.28)',
        'glow-status': '0 0 20px -2px rgba(47, 166, 106, 0.35)',
        'nivora-card': '0 1px 3px 0 rgba(26, 22, 20, 0.04), 0 1px 2px -1px rgba(26, 22, 20, 0.04)',
        'nivora-hover': '0 12px 28px -6px rgba(26, 22, 20, 0.08), 0 4px 8px -4px rgba(26, 22, 20, 0.04)',
        'soft-pink': '0 10px 30px -6px rgba(180, 86, 62, 0.32)',
        'elevated': '0 20px 45px -12px rgba(26, 22, 20, 0.14)',
        'xs': '0 1px 2px 0 rgba(26, 22, 20, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
}
