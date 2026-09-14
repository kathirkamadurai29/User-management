/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#2563eb', // Restrained single accent color for primary action only
          hover: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
