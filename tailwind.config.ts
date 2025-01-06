import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Untuk semua file di folder 'pages'
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Untuk semua file di folder 'components'
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Untuk semua file di folder 'app'
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)", // Warna dinamis menggunakan CSS variables
        foreground: "var(--foreground)", // Warna dinamis menggunakan CSS variables
      },
    },
  },
  plugins: [], // Tambahkan plugin jika diperlukan
} satisfies Config;
