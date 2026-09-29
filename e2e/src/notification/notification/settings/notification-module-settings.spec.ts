import { test, expect } from "../../../support/test";
import { NotificationModuleSettingsPage } from "./notification-module-settings.page";
import { NotificationsPage } from "../inbox/notifications.page";

interface SavedPreference {
  type: string;
  enabled: boolean;
  leadMinutes: number | null;
}

test.describe("ajustes de avisos", () => {
  test.describe.configure({ mode: "serial" });
  test.beforeEach(({}, testInfo) => {
    test.skip(
      "functional-desktop" !== testInfo.project.name,
      "escriben la misma fila de ajustes del tenant y chocarían por el bloqueo optimista",
    );
  });

  test("los ajustes guardan al momento el horario de silencio", async ({ page }) => {
    const notifications = new NotificationsPage(page);
    await notifications.goto("settings");

    const before = await notifications.quietHours.getAttribute("aria-checked");
    const saved = await notifications.toggleQuietHours();

    expect(saved.status()).toBe(204);
    expect(saved.request().postDataJSON().quietHoursEnabled).toBe(before !== "true");
    await expect(notifications.quietHours).toHaveAttribute("aria-checked", String(before !== "true"));

    const restored = await notifications.toggleQuietHours();
    expect(restored.status()).toBe(204);
  });

  test("la agenda sólo enseña sus avisos y la antelación se guarda", async ({ page }) => {
    const settings = new NotificationModuleSettingsPage(page);
    await settings.goto("agenda");

    await expect(settings.reminder("dayBefore")).toBeVisible();
    await expect(settings.reminder("upcoming")).toBeVisible();
    await expect(settings.reminder("lunch")).toHaveCount(0);
    await expect(settings.upcomingLead).toHaveCount(0);

    const enabled = await settings.toggle("upcoming");
    expect(enabled.status()).toBe(204);

    await expect(settings.upcomingLead.locator("option")).toHaveText(["15 min", "30 min", "1 h", "2 h", "3 h"]);

    const saved = await settings.chooseUpcomingLead("30");
    const upcoming = saved
      .request()
      .postDataJSON()
      .preferences.find((preference: SavedPreference) => preference.type === "agenda.appointment.upcoming");

    expect(saved.status()).toBe(204);
    expect(upcoming.leadMinutes).toBe(30);

    const restored = await settings.chooseUpcomingLead("60");
    expect(restored.status()).toBe(204);

    const disabled = await settings.toggle("upcoming");
    expect(disabled.status()).toBe(204);
  });

  test("encender una comida guarda el objeto entero, con los avisos de la agenda", async ({ page }) => {
    const settings = new NotificationModuleSettingsPage(page);
    await settings.goto("nutrition");

    for (const meal of ["breakfast", "lunch", "snack", "dinner"]) {
      await expect(settings.reminder(meal)).toBeVisible();
    }

    await expect(settings.time("lunch")).toHaveCount(0);

    const saved = await settings.toggle("lunch");
    const body = saved.request().postDataJSON();
    const types = body.preferences.map((preference: SavedPreference) => preference.type);
    const lunch = body.preferences.find((preference: SavedPreference) => preference.type === "nutrition.meal.lunch");

    expect(saved.status()).toBe(204);
    expect(lunch.enabled).toBe(true);
    expect(types).toContain("agenda.appointment.dayBefore");
    expect(body.timezone).toBeTruthy();
    await expect(settings.time("lunch")).toHaveValue("14:00");

    const restored = await settings.toggle("lunch");
    expect(restored.status()).toBe(204);
  });
});
