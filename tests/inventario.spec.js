import { test, expect } from "@playwright/test";

// Función auxiliar para no repetir el login en todas las pruebas
async function loginConPin(page) {
  // Entramos a la aplicación
  await page.goto("/");

  // Escribimos el PIN de administrador
  await page.getByRole("textbox", { name: "••••", exact: true }).fill("0000");

  // Presionamos el botón para ingresar
  await page.getByRole("button", { name: "Ingresar con PIN" }).click();
}

test("el usuario puede ingresar y abrir Inventario", async ({ page }) => {
  await loginConPin(page);

  // Entramos a la sección Inventario desde el menú
  await page.getByText("📦 Inventario").click();

  // Verificamos que la pantalla de Inventario cargue
  await expect(page.getByRole("heading", { name: "Inventario" })).toBeVisible();

  // Verificamos que el buscador esté visible
  await expect(
    page.getByRole("textbox", { name: "Buscar o escanear código..." })
  ).toBeVisible();
});

test("el buscador de Inventario permite escribir una búsqueda", async ({ page }) => {
  await loginConPin(page);

  await page.getByText("📦 Inventario").click();

  const buscador = page.getByRole("textbox", {
    name: "Buscar o escanear código...",
  });

  // Escribimos una búsqueda real del sistema
  await buscador.fill("leche");

  // Verificamos que el input conserve el texto escrito
  await expect(buscador).toHaveValue("leche");
});

test("el buscador de Inventario permite buscar por departamento", async ({ page }) => {
  await loginConPin(page);

  await page.getByText("📦 Inventario").click();

  const buscador = page.getByRole("textbox", {
    name: "Buscar o escanear código...",
  });

  // Probamos una búsqueda por departamento
  await buscador.fill("lacteos");

  // Verificamos que la búsqueda quedó aplicada en el campo
  await expect(buscador).toHaveValue("lacteos");
});