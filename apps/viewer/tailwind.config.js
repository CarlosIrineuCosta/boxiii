/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        boxiii: {
          primary: '#3b82f6',
          secondary: '#1e40af',
          dark: '#111827',
          light: '#f3f4f6'
        }
      }
    },
  },
  plugins: [],
}