/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "forest-green": "#0A1F11",
        "old-gold":     "#D4AF37",
        "silk-cream":   "#F5F5F5",
      },
      fontFamily: {
        serif:  ["Merriweather", "Georgia", "serif"],
        sans:   ["Urbanist", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Escala tipográfica acessível (mínimo 16px para produtores rurais)
        base: ["1rem",   { lineHeight: "1.75" }],
        lg:   ["1.125rem", { lineHeight: "1.75" }],
        xl:   ["1.25rem",  { lineHeight: "1.75" }],
        "2xl": ["1.5rem",  { lineHeight: "1.5"  }],
        "3xl": ["1.875rem",{ lineHeight: "1.4"  }],
      },
    },
  },
  plugins: [],
};
