import { APIRequestContext, test as base, request } from "@playwright/test";
import { API_URL } from "./env";
import { Ds } from "./ds";
import { startClockAt } from "./clock";
import { seededAuthToken } from "./auth-state";

interface Fixtures {
  ds: Ds;
}

interface WorkerFixtures {
  api: APIRequestContext;
}

export const test = base.extend<Fixtures, WorkerFixtures>({
  ds: async ({ page }, use) => {
    await use(new Ds(page));
  },

  page: async ({ page }, use) => {
    await startClockAt(page);
    await use(page);
  },

  api: [
    async ({}, use) => {
      const context = await request.newContext({
        baseURL: API_URL,
        extraHTTPHeaders: {
          Authorization: `Bearer ${seededAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      await use(context);
      await context.dispose();
    },
    { scope: "worker" },
  ],
});

export { expect } from "@playwright/test";
