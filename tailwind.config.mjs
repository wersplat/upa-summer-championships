/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: 'rgb(8, 28, 60)',
        blue: 'rgb(0, 112, 206)',
        gold: 'rgb(255, 199, 44)',
        orange: 'rgb(255, 95, 31)',
        red: 'rgb(200, 16, 46)',
        white: 'rgb(255, 255, 255)',
        black: 'rgb(0, 0, 0)',
      },
      boxShadow: {
        sun: '0 0 20px rgba(255, 199, 44, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
