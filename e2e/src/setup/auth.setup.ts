import { chromium, expect, request, test as setup } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { API_URL, BASE_URL } from "../support/env";
import { AUTH_STATE_PATH } from "../support/auth-state";
import { CORE_SCREENS } from "../support/routes";
import { SEED } from "../support/seed-data";

/**
 * Emite la sesión del usuario semilla una única vez por ejecución y la deja en
 * disco como storageState. Hacerlo por API en vez de por formulario mantiene
 * el login del UI como un test de verdad (login.spec.ts) en lugar de
 * convertirlo en un prerrequisito silencioso de toda la suite.
 *
 * Después calienta las rutas. Las dos cosas van en el mismo test a propósito:
 * calentar necesita la sesión ya escrita en disco y, con `fullyParallel`, dos
 * tests del mismo fichero no tienen orden garantizado.
 */
setup("prepara la sesión y calienta las rutas", async () => {
  const api = await request.newContext({ baseURL: API_URL });

  const response = await api.post("/api/login", {
    data: { email: SEED.user.email, password: SEED.user.password },
  });

  expect(
    response.ok(),
    `Login fallido (${response.status()}). ¿Has ejecutado "npm run seed"?`,
  ).toBeTruthy();

  const { data } = (await response.json()) as {
    data: {
      token: string;
      expires_at: number;
      token_type: string;
      refresh_token: string;
      user: unknown;
    };
  };

  const state = {
    cookies: [],
    origins: [
      {
        origin: BASE_URL,
        localStorage: [
          { name: "token", value: data.token },
          { name: "expires_at", value: String(data.expires_at) },
          { name: "token_type", value: data.token_type },
          { name: "refresh_token", value: data.refresh_token },
          { name: "user", value: JSON.stringify(data.user) },
          { name: "email", value: SEED.user.email },
          { name: "app-language", value: "es" },
          { name: "app-theme", value: "light" },
        ],
      },
    ],
  };

  mkdirSync(dirname(AUTH_STATE_PATH), { recursive: true });
  writeFileSync(AUTH_STATE_PATH, JSON.stringify(state, null, 2));

  await api.dispose();

  await warmUpRoutes();
});

/**
 * Visita una vez cada pantalla del núcleo antes de que arranquen los tests.
 *
 * Angular compila las rutas lazy BAJO DEMANDA: la primera visita a /diary tras
 * levantar `ng serve` se queda esperando a que el bundler produzca el chunk, y
 * eso se come los timeouts. El síntoma es de los que hacen desconfiar de una
 * suite: la primera tanda saca cuatro o cinco rojos repartidos al azar y la
 * segunda, idéntica, sale entera en verde.
 *
 * Es un calentamiento, no una comprobación: si una pantalla no responde no se
 * falla aquí. Que /diary esté rota es cosa de los tests de /diary, que darán un
 * error que se entiende; reventar en el setup sólo taparía el diagnóstico.
 */
async function warmUpRoutes(): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
  const page = await context.newPage();

  for (const screen of CORE_SCREENS) {
    await page.goto(`${BASE_URL}${screen.path}`, { timeout: 90_000 }).catch(() => {});
    await page.waitForSelector(screen.ready, { timeout: 90_000 }).catch(() => {});
  }

  await browser.close();
}
