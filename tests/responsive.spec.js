import { test, expect } from "@playwright/test";
import { loginConPin } from "./helpers/auth";

/*
  Pruebas Responsive.

  Objetivo:
  Verificar que la pantalla de Inventario también funcione
  en una resolución similar a un celular.

  Para evitar problemas con el menú mobile, primero entramos a Inventario
  en vista normal y después cambiamos el tamaño de pantalla a mobile.
*/

test("Inventario se visualiza correctamente en pantalla mobile", async ({ page }) => {
  await loginConPin(page);

  // Entramos a Inventario en vista normal
  await page.getByText("📦 Inventario").click();

  // Ahora simulamos una pantalla de celular
  await page.setViewportSize({
    width: 390,
    height: 844,
  });

  await expect(page.getByRole("heading", { name: "Inventario" })).toBeVisible();

  await expect(
    page.getByRole("textbox", { name: "Buscar o escanear código..." })
  ).toBeVisible();

  await expect(page.locator(".tabla-container")).toBeVisible();
});

test("en mobile aparecen los controles de ordenamiento", async ({ page }) => {
  await loginConPin(page);

  // Entramos a Inventario en vista normal
  await page.getByText("📦 Inventario").click();

  // Después pasamos a vista mobile
  await page.setViewportSize({
    width: 390,
    height: 844,
  });

  await expect(page.getByText("Ordenar por:")).toBeVisible();

  await expect(page.getByRole("button", { name: /Nombre/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Vencimiento/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Cantidad/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Estado/i })).toBeVisible();
});