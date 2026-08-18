import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Carpeta donde van a estar nuestras pruebas
  testDir: "./tests",

  // Tiempo máximo que puede tardar cada prueba
  timeout: 30000,

  use: {
    // URL base donde corre el frontend con Docker
    baseURL: "http://localhost",

    // Guarda información si una prueba falla y se reintenta
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});