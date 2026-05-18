import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    env: {
      apiUrl: "http://localhost:8080/api",
      gestorEmail: "gestor@raizes.edu.br",
      gestorSenha: "gestor2025",
    },
    viewportWidth: 390,   // iPhone 14 — foco mobile
    viewportHeight: 844,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents() {},
  },
});
