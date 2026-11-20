/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            eliteGold: '#D4AF37', // A custom gold for "Elite" branding
            eliteDark: '#121212', // A deep charcoal for Dark Mode
            },
        },
    },
  plugins: [],
}