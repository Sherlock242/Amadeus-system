import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-in-left': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(0)' } },
        'slide-in-right': { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        'slide-in-top': { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(0)' } },
        'slide-in-bottom': { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
        'shake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'slide-in-top': 'slide-in-top 0.5s ease-out',
        'slide-in-bottom': 'slide-in-bottom 0.5s ease-out',
        'shake': 'shake 0.3s ease-in-out'
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
