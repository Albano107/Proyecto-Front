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
    .getByRole("textbox", { name: "PIN de 4 dígitos" })
    .fill("9999");

  await page
    .getByRole("button", { name: "INGRESAR CON PIN" })
    .click();

  // Si el PIN es incorrecto, seguimos en la pantalla de login.
  await expect(
    page.getByRole("button", { name: "INGRESAR CON PIN" })
  ).toBeVisible();

  // Y no debería aparecer el menú interno de Inventario.
  await expect(page.getByText("📦 Inventario")).not.toBeVisible();
});

test("no permite ingresar si el PIN está vacío", async ({ page }) => {
  await page.goto("/");

  const botonIngresar = page.getByRole("button", {
    name: "INGRESAR CON PIN",
  });

  // Si el PIN está vacío, el botón debe estar deshabilitado.
  await expect(botonIngresar).toBeDisabled();

  await expect(page.getByText("📦 Inventario")).not.toBeVisible();
});