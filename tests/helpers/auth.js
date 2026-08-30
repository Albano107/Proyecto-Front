import { expect } from "@playwright/test";

/*
  Función auxiliar para iniciar sesión con PIN.

  La usamos en varios tests para no repetir siempre:
  - abrir la app
  - escribir el PIN
  - presionar el botón de ingreso
  - verificar que salimos de la pantalla de login
*/
export async function loginConPin(page, pin = "0000") {
  await page.goto("/");

  await page
    .getByRole("textbox", { name: "PIN de 4 dígitos" })
    .fill(pin);

  await page
    .getByRole("button", { name: "INGRESAR CON PIN" })
    .click();

  // Si el login fue correcto, el botón de login deja de estar visible.
  await expect(
    page.getByRole("button", { name: "INGRESAR CON PIN" })
  ).not.toBeVisible();
}