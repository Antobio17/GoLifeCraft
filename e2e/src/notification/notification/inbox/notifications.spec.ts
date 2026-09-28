import { test, expect } from "../../../support/test";
import { NotificationsPage } from "./notifications.page";

const INBOX_PATH = "/api/v1/notification/notifications";

test.describe("notificaciones", () => {
  test("la campana del dashboard abre el buzón, vacío con la semilla", async ({ page, ds }) => {
    await page.goto("/dashboard");
    await ds.click("dashboard-notifications");

    await expect(page).toHaveURL(/\/notifications$/);

    const notifications = new NotificationsPage(page);
    await expect(notifications.emptyState).toBeVisible();
  });

  test("pinta los avisos traducidos y abre la cita en su día", async ({ page }) => {
    await page.route(`**${INBOX_PATH}?*`, (route) =>
      route.fulfill({
        json: {
          meta: { pageNumber: 1, pageSize: 30, total: 1, unreadCount: 1 },
          data: [
            {
              id: "notification-e2e-1",
              type: "Notification",
              attributes: {
                type: "agenda.appointment.dayBefore",
                module: "agenda",
                params: { entryId: "e2e", title: "Dentista", date: "2026-01-16", time: "10:30" },
                title: "Mañana: Dentista",
                body: "Tienes una cita mañana a las 10:30.",
                url: "/agenda?at=2026-01-16",
                pushed: true,
                unread: true,
                deliveredAt: "2026-01-15T08:00:00+01:00",
              },
            },
          ],
          included: [],
        },
      }),
    );
    await page.route(`**${INBOX_PATH}/seen`, (route) => route.fulfill({ status: 204 }));

    const notifications = new NotificationsPage(page);
    await notifications.goto();

    await expect(notifications.items).toHaveCount(1);
    await expect(notifications.items.first()).toContainText("Mañana: Dentista");
    await expect(notifications.items.first()).toContainText("A las 10:30", { ignoreCase: true });

    await notifications.openItem("Mañana: Dentista");

    await expect(page).toHaveURL(/\/agenda\?at=2026-01-16$/);
  });

  test("los ajustes guardan al momento el horario de silencio", async ({ page }) => {
    const notifications = new NotificationsPage(page);
    await notifications.goto("settings");

    await expect(notifications.dayBeforeReminder).toBeVisible();
    await expect(notifications.upcomingReminder).toBeVisible();

    const before = await notifications.quietHours.getAttribute("aria-checked");
    const saved = await notifications.toggleQuietHours();

    expect(saved.status()).toBe(204);
    expect(saved.request().postDataJSON().quietHoursEnabled).toBe(before !== "true");
    await expect(notifications.quietHours).toHaveAttribute("aria-checked", String(before !== "true"));

    const restored = await notifications.toggleQuietHours();
    expect(restored.status()).toBe(204);
  });

  test("las pestañas cambian entre el buzón y los ajustes", async ({ page }) => {
    const notifications = new NotificationsPage(page);
    await notifications.goto();

    await notifications.openTab("Ajustes");
    await expect(page).toHaveURL(/tab=settings/);
    await expect(notifications.quietHours).toBeVisible();

    await notifications.openTab("Recientes");
    await expect(notifications.emptyState).toBeVisible();
  });
});
