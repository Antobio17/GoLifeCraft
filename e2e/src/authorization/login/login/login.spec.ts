import { test, expect } from "../../../support/test";
import { LoginPage } from "./login.page";
import { SEED } from "../../../support/seed-data";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("login", () => {
  test("manda al login al entrar sin sesión en una ruta privada", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("entra al dashboard con las credenciales correctas", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.signIn(SEED.user.email, SEED.user.password);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-greeting")).toBeVisible();
  });

  test("avisa y se queda en el login con credenciales inválidas", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.signIn("no-existe@golifecraft.test", "contraseña-incorrecta");

    await expect(page.locator("ds-toast")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("el botón de contraseña olvidada lleva a recuperar la cuenta", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.forgotPassword();

    await expect(page).toHaveURL(/\/auth\/forgot-password$/);
  });
});
