import { Page } from "@playwright/test";
import { test, expect } from "../../../support/test";
import { NotificationsPage } from "./notifications.page";

const INBOX_PATH = "/api/v1/notification/notifications";

const dentist = {
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
};

const lunch = {
  id: "notification-e2e-2",
  type: "Notification",
  attributes: {
    type: "nutrition.meal.lunch",
    module: "nutrition",
    params: { meal: "lunch", date: "2026-01-15", variant: "empty", items: null, count: 0 },
    title: "Toca comer",
    body: "No tienes nada apuntado para la comida.",
    url: "/diary",
    pushed: true,
    unread: true,
    deliveredAt: "2026-01-15T14:00:00+01:00",
  },
};

async function mockInbox(page: Page, data: object[]): Promise<{ seen: number }> {
  const calls = { seen: 0 };

  await page.route(`**${INBOX_PATH}?*`, (route) =>
    route.fulfill({
      json: {
        meta: { pageNumber: 1, pageSize: 30, total: data.length, unreadCount: data.length },
        data,
        included: [],
      },
    }),
  );
  await page.route(`**${INBOX_PATH}/seen`, (route) => {
    calls.seen++;
    return route.fulfill({ status: 204 });
  });
  await page.route(`**${INBOX_PATH}/notification-e2e-*`, (route) => route.fulfill({ status: 204 }));
  await page.route(`**${INBOX_PATH}/notification-e2e-*/read`, (route) => route.fulfill({ status: 204 }));

  return calls;
}

test.describe("notificaciones", () => {
  test("la campana del dashboard abre el buzón, vacío con la semilla", async ({ page, ds }) => {
    await page.goto("/dashboard");
    await ds.click("dashboard-notifications");

    await expect(page).toHaveURL(/\/notifications$/);

    const notifications = new NotificationsPage(page);
    await expect(notifications.emptyState).toBeVisible();
  });

  test("pinta los avisos traducidos y abrir uno lo marca leído y lleva a la cita", async ({ page }) => {
    const calls = await mockInbox(page, [dentist]);

    const notifications = new NotificationsPage(page);
    await notifications.goto();

    await expect(notifications.items).toHaveCount(1);
    await expect(notifications.items.first()).toContainText("Mañana: Dentista");
    await expect(notifications.items.first()).toContainText("A las 10:30", { ignoreCase: true });
    expect(calls.seen).toBe(0);

    const read = page.waitForRequest((request) => request.method() === "PUT");
    await notifications.openItem("Mañana: Dentista");

    expect((await read).postDataJSON()).toEqual({ read: true });
    await expect(page).toHaveURL(/\/agenda\?at=2026-01-16$/);
  });

  test("el sobre marca una notificación como leída y la vuelve a dejar sin leer", async ({ page }) => {
    await mockInbox(page, [dentist]);

    const notifications = new NotificationsPage(page);
    await notifications.goto();

    await expect(notifications.readToggle("Mañana: Dentista")).toHaveAccessibleName("Marcar como leída");

    const read = await notifications.toggleRead("Mañana: Dentista");
    expect(read.request().postDataJSON()).toEqual({ read: true });
    expect(new URL(read.url()).pathname).toBe(`${INBOX_PATH}/notification-e2e-1/read`);
    await expect(notifications.readToggle("Mañana: Dentista")).toHaveAccessibleName("Marcar como no leída");
    await expect(notifications.markAllReadButton).toHaveCount(0);

    const unread = await notifications.toggleRead("Mañana: Dentista");
    expect(unread.request().postDataJSON()).toEqual({ read: false });
    await expect(notifications.readToggle("Mañana: Dentista")).toHaveAccessibleName("Marcar como leída");
  });

  test("deslizar una notificación la borra", async ({ page }) => {
    await mockInbox(page, [dentist, lunch]);

    const notifications = new NotificationsPage(page);
    await notifications.goto();
    await expect(notifications.items).toHaveCount(2);

    const removed = await notifications.remove("Mañana: Dentista");

    expect(new URL(removed.url()).pathname).toBe(`${INBOX_PATH}/notification-e2e-1`);
    await expect(notifications.items).toHaveCount(1);
    await expect(notifications.items.first()).toContainText("Toca comer");
  });

  test("marcar todas como leídas deja el buzón al día sin borrar nada", async ({ page }) => {
    const calls = await mockInbox(page, [dentist, lunch]);

    const notifications = new NotificationsPage(page);
    await notifications.goto();

    await notifications.markAllRead();

    expect(calls.seen).toBe(1);
    await expect(notifications.items).toHaveCount(2);
    await expect(notifications.readToggle("Mañana: Dentista")).toHaveAccessibleName("Marcar como no leída");
    await expect(notifications.readToggle("Toca comer")).toHaveAccessibleName("Marcar como no leída");
    await expect(notifications.markAllReadButton).toHaveCount(0);
  });

  test("cada tarjeta de módulo abre su subpantalla de avisos", async ({ page }) => {
    const notifications = new NotificationsPage(page);
    await notifications.goto("settings");

    await expect(notifications.moduleCard("agenda")).toBeVisible();

    await notifications.openModule("nutrition");

    await expect(page).toHaveURL(/\/notifications\/settings\/nutrition$/);
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
