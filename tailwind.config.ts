import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          bg:    '#111009',
          s1:    '#1c1a13',
          s2:    '#252218',
          s3:    '#2e2b1f',
          s4:    '#3a3628',
          gold:  '#c9a96e',
          gold2: '#a07840',
          tx:    '#ede0c8',
          tx2:   '#a8957a',
          tx3:   '#6b5e4a',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
