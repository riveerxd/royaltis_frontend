/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    fontFamily:{
      "azonix": ["azonix", "ui-sans-serif"]
    },
    extend: {},
  },
  plugins: [],
}