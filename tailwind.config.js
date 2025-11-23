/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2',
        'primary-dark': '#115293',
        correct: '#4caf50',
        'correct-light': '#e8f5e9',
        incorrect: '#f44336',
        'incorrect-light': '#ffebee',
        selected: '#2196f3',
        'selected-light': '#e3f2fd',
      },
    },
  },
  plugins: [],
}
