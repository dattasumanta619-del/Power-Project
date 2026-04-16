/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        powerBg: "#0f1f4e",
        powerCard: "#162040",
        powerPrimary: "#1a52b3",
        powerGold: "#c9a227",
        powerSuccess: "#1fb16a",
        powerDanger: "#ef5b5b"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(26,82,179,0.35), 0 20px 40px rgba(5,10,28,0.35)"
      }
    }
  },
  plugins: []
};
