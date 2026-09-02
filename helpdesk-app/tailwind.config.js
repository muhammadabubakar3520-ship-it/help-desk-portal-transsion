/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Enterprise text / neutral scale (anchored to spec Text #1E293B)
        ink: {
          950: '#0B1626',
          900: '#1E293B',
          800: '#334155',
          700: '#475569',
          600: '#64748B'
        },
        // Neutral surfaces & borders (anchored to spec Background/Border)
        slate: {
          50: '#F5F7FA',
          100: '#EEF2F7',
          200: '#E2E8F0',
          400: '#94A3B8',
          500: '#64748B'
        },
        // TRANSSION HOLDINGS corporate brand palette
        brand: {
          primary: '#005BAC',
          'primary-dark': '#00478A',
          secondary: '#003B73',
          accent: '#00A3E0'
        },
        // Status / signal colors mapped to the corporate spec
        signal: {
          amber: '#F59E0B',
          teal: '#16A34A',
          coral: '#DC2626',
          violet: '#00A3E0'
        }
      },
      fontFamily: {
        display: ['Poppins', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,22,38,0.06), 0 8px 24px rgba(11,22,38,0.06)',
        'card-hover': '0 4px 10px rgba(11,22,38,0.08), 0 16px 32px rgba(0,91,172,0.10)',
        nav: '0 1px 0 rgba(226,232,240,0.9)'
      },
      borderRadius: {
        card: '12px'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        rippleAnim: {
          '0%': { transform: 'scale(0)', opacity: 0.45 },
          '100%': { transform: 'scale(2.5)', opacity: 0 }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        ripple: 'rippleAnim 0.6s ease-out'
      }
    }
  },
  plugins: []
}
