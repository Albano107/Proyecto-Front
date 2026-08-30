import { test, expect } from "@playwright/test";
import { loginConPin } from "./helpers/auth";

/*
  Pruebas de Inventario.

  Objetivo:
  Validar que la pantalla principal de inventario cargue correctamente,
  que el buscador funcione y que los modales principales se puedan abrir
  sin modificar datos reales.
*/

test("Inventario carga correctamente", async ({ page }) => {
  await loginConPin(page);

  await page.getByText("📦 Inventario").click();

  await expect(page.getByRole("heading", { name: "Inventario" })).toBeVisible();

  await expect(
    page.getByRole("textbox", { name: "Buscar o escanear código..." })
  ).toBeVisible();

  await expect(page.locator(".tabla-container")).toBeVisible();
});

test("buscador de Inventario filtra por nombre de producto", async ({ page }) => {
  await loginConPin(page);

  await page.getByText("📦 Inventario").click();

  const buscador = page.getByRole("textbox", {
    name: "Buscar o escanear código...",
  });

  await buscador.fill("leche");

  await expect(buscador).toHaveValue("leche");

  // Validamos que la tabla siga mostrando resultados relacionados.
  await expect(page.locator(".tabla-container")).toContainText(/leche/i);
});

test("buscador de Inventario filtra por departamento", async ({ page }) => {
  await loginConPin(page);

  await page.getByText("📦 Inventario").click();

  const buscador = page.getByRole("textbox", {
    name: "Buscar o escanear código...",
  });

  await buscador.fill("lacteos");

  await expect(buscador).toHaveValue("lacteos");

  // El departamento no se muestra como columna, pero si la búsqueda funciona,
  // la tabla no debería quedar vacía.
  await expect(page.getByText("No hay productos para mostrar")).not.toBeVisible();
});

test("al borrar la búsqueda vuelve el listado de Inventario", async ({ page }) => {
  await loginConPin(page);

  await page.getByText("📦 Inventario").click();

  const buscador = page.getByRole("textbox", {
    name: "Buscar o escanear código...",
  });

  await buscador.fill("leche");
  await expect(buscador).toHaveValue("leche");

  await buscador.fill("");
  await expect(buscador).toHaveValue("");

  await expect(page.locator(".tabla-container")).toBeVisible();
});

test("abre y cierra el modal de Nuevo producto", async ({ page }) => {
  await loginConPin(page);

  await page.getByText("📦 Inventario").click();

  await page.getByRole("button", { name: "+ Nuevo producto" }).click();

  await expect(
    page.getByRole("heading", { name: "Nuevo producto en inventario" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Cancelar" }).click();

  await expect(
    page.getByRole("heading", { name: "Nuevo producto en inventario" })
  ).not.toBeVisible();
});

test("abre y cierra el modal de Retirar producto", async ({ page }) => {
  await loginConPin(page);

  await page.getByText("📦 Inventario").click();

  await page.getByRole("button", { name: "Retirar" }).first().click();

  await expect(page.getByText("Cantidad disponible:")).toBeVisible();
  await expect(page.getByText("Motivo")).toBeVisible();

  await page.getByRole("button", { name: "Cancelar" }).click();

  await expect(page.getByText("Cantidad disponible:")).not.toBeVisible();
});

test("abre y cierra el modal de Editar producto", async ({ page }) => {
  await loginConPin(page);

  await page.getByText("📦 Inventario").click();

  await page.getByRole("button", { name: "✏️ Editar" }).first().click();

  // Limitamos la búsqueda al modal para evitar confundir
  // la palabra "Cantidad" de la tabla con la del formulario.
  const modal = page.locator(".modal-caja");

  await expect(modal).toBeVisible();

  await expect(
    modal.getByText("Fecha de vencimiento *")
  ).toBeVisible();

  await expect(
    modal.getByText("Cantidad *")
  ).toBeVisible();

  await expect(
    modal.getByRole("button", { name: "Guardar cambios" })
  ).toBeVisible();

  await modal.getByRole("button", { name: "Cancelar" }).click();

  await expect(modal).not.toBeVisible();
});