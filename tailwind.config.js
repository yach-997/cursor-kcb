/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'Noto Sans SC',
          'sans-serif',
        ],
        display: [
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          DEFAULT: '#0d6e5a',
          dark: '#0a5646',
          soft: '#e6f4ef',
        },
        ink: '#14231e',
        muted: '#5a6f67',
        surface: '#f3f7f5',
        card: '#ffffff',
        line: '#d7e5df',
        expired: '#dc2626',
      },
    },
  },
  plugins: [],
}
