import { test, expect } from "@playwright/test";

test("la aplicación abre correctamente", async ({ page }) => {
  // Entramos al frontend usando la baseURL configurada en playwright.config.js
  await page.goto("/");

  // Esperamos que el body exista
  const body = page.locator("body");

  // Verificamos que la página tenga contenido visible
  await expect(body).toBeVisible();

  // Tomamos el texto de la página
  const textoPagina = await body.innerText();

  // Verificamos que la pantalla no esté vacía
  expect(textoPagina.trim().length).toBeGreaterThan(0);
});