import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hazard: '#ff7b00',
        scrap: '#6f7f83',
      },
    },
  },
  plugins: [],
} satisfies Config;
