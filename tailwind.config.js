/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        // 只有宽度 ≥1024 且高度 ≥660 时才显示平板外框;iPad 竖屏、手机横屏都走全屏
        frame: { raw: "(min-width: 1024px) and (min-height: 660px)" },
        // 横屏手机等矮屏
        short: { raw: "(max-height: 520px)" },
      },
    },
  },
  plugins: [],
};
