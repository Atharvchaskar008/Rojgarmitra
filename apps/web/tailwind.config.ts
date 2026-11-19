import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F1F5FC',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#E8F0FA',
        },
        ink: {
          DEFAULT: '#101638',
          secondary: '#526F9D',
          muted: '#7E96BA',
        },
        primary: {
          DEFAULT: '#214783',
          hover: '#173463',
          active: '#0F2344',
        },
        steel: {
          DEFAULT: '#B8C9E1',
          soft: '#DCE7F6',
          deep: '#1A3660',
        },
        verified: {
          DEFAULT: '#15803D',
          bg: '#DCFCE7',
          border: '#86EFAC',
        },
        alert: {
          DEFAULT: '#C2410C',
          bg: '#FFEDD5',
          border: '#FDBA74',
        },
      },
      boxShadow: {
        'solid-sm': '2px 2px 0px #101638',
        'solid': '4px 4px 0px #101638',
        'solid-lg': '6px 6px 0px #101638',
        'solid-primary': '4px 4px 0px #214783',
      },
      borderRadius: {
        'card': '18px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto-sans-devanagari)', 'system-ui', 'sans-serif'],
        devanagari: ['var(--font-noto-sans-devanagari)', 'sans-serif'],
      },
    }
  },
  plugins: []
};

export default config;
