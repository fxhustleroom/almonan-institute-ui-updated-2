import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F7F5EE',
        ink: '#1A1A1A',
        almonanGreen: {
          50: '#E9F6EE',
          100: '#CFECD9',
          500: '#19C94B',
          700: '#0F6B35',
          900: '#0B3D21'
        },
        almonanBrown: {
          50: '#F6F1EC',
          200: '#E1D0C3',
          500: '#7A4B32',
          700: '#5B3524',
          900: '#3A2116'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
};

export default config;
