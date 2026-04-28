/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        ink: "#0F1419",
        muted: "#536471",
        divider: "#EFF3F4",
        brand: "#1D9BF0",
        like: "#F91880",
      },
    },
  },
  plugins: [],
};
