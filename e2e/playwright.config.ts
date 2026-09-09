import { defineConfig, devices } from "@playwright/test";
import { DESKTOP, MOBILE, TABLET } from "./src/support/viewports";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:4200";
const API_URL = process.env.E2E_API_URL ?? "http://localhost:8083";
const IS_CI = !!process.env.CI;
const AUTH_STATE = "./.auth/user.json";

export default defineConfig({
  // `testDir` es `src` entero: los specs viven junto a la pantalla que prueban,
  // en el mismo árbol context/subcontext/module que el frontend, y los `.page.ts`
  // que hay al lado no los recoge nadie porque sólo se consideran test los
  // ficheros `.spec.ts` (y los `.setup.ts` del proyecto `setup`).
  testDir: "./src",
  globalSetup: "./src/support/global-setup.ts",
  outputDir: "./test-results",
  // `{testFilePath}` es relativo a `testDir`, así que mover los specs un nivel
  // arriba a la vez que `testDir` deja las rutas de los snapshots intactas.
  //
  // OJO: `testMatch` y `testIgnore` NO son relativos a `testDir`, se aplican
  // sobre la ruta ABSOLUTA del fichero. Por eso van anclados a `src/design/` y
  // no a `^design/`, que no casaría con nada y dejaría los guards sin ejecutar
  // mientras los proyectos funcionales se los tragaban por duplicado.
  snapshotPathTemplate:
    "{testDir}/../snapshots/{projectName}/{platform}/{testFilePath}/{arg}{ext}",

  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 2 : undefined,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },

  reporter: IS_CI
    ? [["github"], ["html", { open: "never" }], ["json", { outputFile: "test-results/results.json" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    testIdAttribute: "data-testid",
    locale: "es-ES",
    timezoneId: "Europe/Madrid",
    colorScheme: "light",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: IS_CI ? "retain-on-failure" : "off",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: BASE_URL, extraHTTPHeaders: {} },
    },

    // ---- Flujos de negocio (end to end reales) ----
    {
      name: "functional-desktop",
      testIgnore: [/src\/design\//, /\.setup\.ts$/],
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: DESKTOP,
        storageState: AUTH_STATE,
      },
    },
    {
      name: "functional-mobile",
      testIgnore: [/src\/design\//, /\.setup\.ts$/],
      dependencies: ["setup"],
      use: {
        ...devices["Pixel 7"],
        viewport: MOBILE,
        storageState: AUTH_STATE,
      },
    },

    // ---- Regresión visual: sólo pixeles, un proyecto por tema ----
    {
      name: "visual-light",
      testMatch: /src\/design\/visual-regression\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: DESKTOP,
        colorScheme: "light",
        storageState: AUTH_STATE,
      },
    },
    {
      name: "visual-dark",
      testMatch: /src\/design\/visual-regression\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: DESKTOP,
        colorScheme: "dark",
        storageState: AUTH_STATE,
      },
    },

    // ---- Invariantes de diseño que no dependen de pixeles ----
    {
      name: "design-guards",
      testMatch: /src\/design\/(layout|design-system)\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: TABLET,
        storageState: AUTH_STATE,
      },
    },
    {
      name: "a11y",
      testMatch: /src\/design\/accessibility\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: DESKTOP,
        storageState: AUTH_STATE,
      },
    },
  ],

  webServer: process.env.E2E_NO_WEBSERVER
    ? undefined
    : {
        command: "npm start",
        cwd: "../frontend",
        url: BASE_URL,
        reuseExistingServer: !IS_CI,
        timeout: 180_000,
        stdout: "ignore",
        stderr: "pipe",
      },

  metadata: { apiUrl: API_URL },
});
