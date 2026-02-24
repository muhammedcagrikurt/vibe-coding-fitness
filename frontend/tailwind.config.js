module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          base: '#16a34a',
          bright: '#22c55e',
          highlight: '#4ade80',
        },
        secondary: {
          base: '#3b4fd8',
          bright: '#6366f1',
          highlight: '#818cf8',
        },
        accent: {
          base: '#d97706',
          bright: '#f59e0b',
          highlight: '#fbbf24',
        },
        neutral: {
          darkest: '#09090b',
          darker: '#111113',
          dark: '#18181b',
          medium: '#27272a',
          gray: '#3f3f46',
          lightgray: '#71717a',
          light: '#a1a1aa',
          lighter: '#d4d4d8',
          lightest: '#f4f4f5',
        },
        semantic: {
          success: '#22c55e',
          info: '#6366f1',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        body: ['DM Sans', 'sans-serif'],
        heading: ['Barlow Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
