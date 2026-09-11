import { chromium, expect, request, test as setup } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { API_URL, BASE_URL } from "../support/env";
import { AUTH_STATE_PATH } from "../support/auth-state";
import { CORE_SCREENS } from "../support/routes";
import { SEED } from "../support/seed-data";

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
