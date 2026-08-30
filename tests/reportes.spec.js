import { test, expect } from "@playwright/test";
import { loginConPin } from "./helpers/auth";

/*
  Pruebas de Reportes.

  Objetivo:
  Verificar que la sección de reportes cargue correctamente
  y que muestre información visual al usuario.
*/

test("la pantalla de Reportes carga correctamente", async ({ page }) => {
  await loginConPin(page);

  // Entramos a Reportes desde el menú lateral
  await page.getByText(/Reportes/i).click();

  // Verificamos que haya una pantalla de reportes visible
  await expect(page.getByRole("heading", { name: /Reportes/i })).toBeVisible();

  // Verificamos que la página tenga contenido
  await expect(page.locator("body")).toContainText(/reporte|retiro|merma|producto/i);
});

test("Reportes muestra tarjetas o información de resumen", async ({ page }) => {
  await loginConPin(page);

  await page.getByText(/Reportes/i).click();

  // Las cards se usan para mostrar métricas/resúmenes del sistema
  await expect(page.locator(".card").first()).toBeVisible();
});

test("Reportes muestra una tabla o listado de datos", async ({ page }) => {
  await loginConPin(page);

  await page.getByText(/Reportes/i).click();

  // Validamos que exista algún contenedor de tabla/listado
  await expect(page.locator(".tabla-container").first()).toBeVisible();
});