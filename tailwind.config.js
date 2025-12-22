/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito Sans"', 'sans-serif']
      },
      colors: {
        primary: {
          50: '#f1f9e7',
          100: '#e3f4cf',
          200: '#c7e8a0',
          300: '#bae388',
          400: '#a5da64',
          500: '#74c611',
          600: '#68b20f',
          700: '#5d9e0e',
          800: '#518b0c',
          900: '#406d09'
        },
        success: {
          light: '#66ffaa',
          DEFAULT: '#00ff88',
          hover: '#33ff99',
          dark: '#00cc6d'
        },
        error: {
          light: '#ff8888',
          DEFAULT: '#ff4444',
          hover: '#ff6666',
          dark: '#cc0000'
        },
        warning: {
          light: '#ffc04d',
          DEFAULT: '#ffa500',
          hover: '#ffb732',
          dark: '#cc8400'
        },
        info: {
          light: '#66d4ff',
          DEFAULT: '#00b4ff',
          hover: '#33c5ff',
          dark: '#0090cc'
        },
        neutral: {
          dark: '#000000',
          'dark-secondary': '#1a1a2e',
          'dark-tertiary': '#16213e',
          'dark-quaternary': '#0f3460'
        }
      },
      backgroundColor: {
        glass: {
          dark: 'rgba(18, 18, 18, 0.55)',
          'dark-strong': 'rgba(18, 18, 18, 0.75)',
          'dark-weak': 'rgba(18, 18, 18, 0.35)',
          'dark-hover': 'rgba(18, 18, 18, 0.65)',
          light: 'rgba(255, 255, 255, 0.1)',
          'light-hover': 'rgba(255, 255, 255, 0.15)',
          'light-strong': 'rgba(255, 255, 255, 0.2)',
          'light-weak': 'rgba(255, 255, 255, 0.05)'
        }
      },
      borderColor: {
        light: 'rgba(255, 255, 255, 0.1)',
        'light-hover': 'rgba(255, 255, 255, 0.2)',
        'light-strong': 'rgba(255, 255, 255, 0.3)'
      },
      boxShadow: {
        'glow-success': '0 0 20px rgba(142, 180, 40, 0.3)',
        'glow-error': '0 0 20px rgba(255, 68, 68, 0.3)',
        'glow-warning': '0 0 20px rgba(255, 165, 0, 0.3)',
        'glow-info': '0 0 20px rgba(0, 180, 255, 0.3)',
        'glow-dev': '0 0 16px rgba(255, 152, 0, 0.5)'
      },
      blur: {
        xs: '5px',
        sm: '10px',
        md: '20px',
        lg: '30px'
      }
    }
  },
  plugins: []
};
