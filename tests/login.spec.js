import { test, expect } from "@playwright/test";
import { loginConPin } from "./helpers/auth";

/*
  Pruebas de Login.

  Objetivo:
  Validar que el usuario pueda ingresar al sistema con un PIN correcto
  y que no pueda ingresar con datos inválidos.
*/

test("login correcto con PIN válido", async ({ page }) => {
  await loginConPin(page, "0000");

  // Verificamos que después del login se muestre una opción interna del sistema.
  await expect(page.getByText("📦 Inventario")).toBeVisible();
});

test("no permite ingresar con PIN incorrecto", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("textbox", { name: "••••", exact: true })
    .fill("9999");

  await page
    .getByRole("button", { name: "Ingresar con PIN" })
    .click();

  // Si el PIN es incorrecto, seguimos en la pantalla de login.
  await expect(
    page.getByRole("button", { name: "Ingresar con PIN" })
  ).toBeVisible();

  // Y no debería aparecer el menú interno de Inventario.
  await expect(page.getByText("📦 Inventario")).not.toBeVisible();
});

test("no permite ingresar si el PIN está vacío", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("button", { name: "Ingresar con PIN" })
    .click();

  // Si no cargamos PIN, el sistema debe mantenerse en la pantalla de login.
  await expect(
    page.getByRole("button", { name: "Ingresar con PIN" })
  ).toBeVisible();

  await expect(page.getByText("📦 Inventario")).not.toBeVisible();
});