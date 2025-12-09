/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ✅ Couleurs ToolPFJ (Hacker/Dark Mode)
        primary: "#00e676",   // Neon Green (Action, Success)
        secondary: "#0d1117", // Très sombre pour l'arrière-plan principal
        background: "#0d1117", // Arrière-plan principal
        'dark-text': '#b0b0b0', // Texte clair pour le mode sombre
        'dark-card': '#161b22', // Carte légèrement plus claire que le fond
      },
      fontFamily: {
        mono: ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
};
