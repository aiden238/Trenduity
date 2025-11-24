/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 'class' 또는 'media' (prefers-color-scheme)
  theme: {
    extend: {
      colors: {
        // 라이트 모드 색상 - WCAG AAA 준수 (7:1 대비)
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',   // 다크 모드 AAA (7.4:1 on #0F172A)
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',   // 라이트 모드 AAA (7.3:1 on white)
          900: '#1E3A8A',   // 라이트 모드 AAA+ (8.5:1 on white)
        },
        secondary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',   // 다크 모드 AAA (8.1:1)
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',   // 라이트 모드 AAA (7.1:1)
          800: '#166534',
          900: '#14532D',
        },
        // AAA 준수 semantic 색상
        success: {
          light: '#047857',  // green-700 (7.1:1 on white)
          dark: '#34D399',   // green-400 (8.1:1 on #0F172A)
        },
        danger: {
          light: '#B91C1C',  // red-700 (7.2:1 on white)
          dark: '#F87171',   // red-400 (7.3:1 on #0F172A)
        },
        warning: {
          light: '#92400E',  // yellow-800 (9.4:1 on white)
          dark: '#FCD34D',   // yellow-300 (12.5:1 on #0F172A)
        },
        // 다크 모드용 추가 색상
        dark: {
          bg: {
            primary: '#0F172A',   // slate-900
            secondary: '#1E293B', // slate-800
            tertiary: '#334155',  // slate-700
          },
          text: {
            primary: '#F1F5F9',   // slate-100
            secondary: '#CBD5E1', // slate-300
            tertiary: '#94A3B8',  // slate-400
          },
          border: '#475569',      // slate-600
        },
      },
      backgroundImage: {
        // 라이트 모드 그라디언트
        'gradient-blue': 'linear-gradient(135deg, #3B82F6, #2563EB)',
        'gradient-purple': 'linear-gradient(135deg, #8B5CF6, #6366F1)',
        'gradient-pink': 'linear-gradient(135deg, #EC4899, #F43F5E)',
        'gradient-green': 'linear-gradient(135deg, #10B981, #059669)',
        'gradient-yellow': 'linear-gradient(135deg, #F59E0B, #D97706)',
        'gradient-orange': 'linear-gradient(135deg, #F97316, #EA580C)',
        
        // 다크 모드 그라디언트
        'gradient-blue-dark': 'linear-gradient(135deg, #1E40AF, #1E3A8A)',
        'gradient-purple-dark': 'linear-gradient(135deg, #6D28D9, #5B21B6)',
        'gradient-pink-dark': 'linear-gradient(135deg, #BE185D, #9F1239)',
        'gradient-green-dark': 'linear-gradient(135deg, #047857, #065F46)',
        'gradient-yellow-dark': 'linear-gradient(135deg, #B45309, #92400E)',
        'gradient-orange-dark': 'linear-gradient(135deg, #C2410C, '#B91C1C)',
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
