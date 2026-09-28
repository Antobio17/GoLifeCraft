import { TestBed } from "@angular/core/testing";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { NotificationInboxViewService } from "./notification-inbox-view.service";
import { NotificationInboxEntry } from "../../domain/models/notification-inbox-entry.model";
import { NotificationType } from "../../domain/models/notification-type.enum";

describe("NotificationInboxViewService", () => {
  let service: NotificationInboxViewService;

  const translations: Record<string, string> = {
    "notifications.inbox.today": "Hoy",
    "notifications.inbox.yesterday": "Ayer",
    "notifications.type.dayBefore.title": "Mañana: {{title}}",
    "notifications.type.dayBefore.bodyTimed": "A las {{time}}.",
    "notifications.type.dayBefore.bodyUntimed": "Sin hora.",
    "notifications.type.upcoming.title": "{{title}} a las {{time}}",
    "notifications.type.upcoming.body": "Empieza en {{minutes}} min.",
  };

  const translationService = {
    getLocale: () => "es-ES",
    translate: (
      key: string,
      _module: string,
      params?: Record<string, unknown>,
    ) =>
      (translations[key] ?? key).replace(/\{\{(\w+)\}\}/g, (_, name) =>
        String(params?.[name] ?? ""),
      ),
  };

  const entry = (
    overrides: Partial<NotificationInboxEntry>,
  ): NotificationInboxEntry => ({
    id: "notification-1",
    type: NotificationType.AgendaAppointmentDayBefore,
    module: "agenda",
    params: { title: "Dentista", time: "10:30" },
    title: "server title",
    body: "server body",
    url: "/agenda?at=2026-09-29",
    pushed: true,
    unread: true,
    deliveredAt: "2026-09-28T20:00:00",
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationInboxViewService,
        { provide: TranslationService, useValue: translationService },
      ],
    });

    service = TestBed.inject(NotificationInboxViewService);
  });

  it("groups notifications by the day they were delivered", () => {
    const groups = service.groups(
      [
        entry({ id: "a", deliveredAt: "2026-09-28T20:00:00" }),
        entry({ id: "b", deliveredAt: "2026-09-28T09:00:00" }),
        entry({ id: "c", deliveredAt: "2026-09-27T20:00:00" }),
        entry({ id: "d", deliveredAt: "2026-09-20T20:00:00" }),
      ],
      new Date("2026-09-28T22:00:00"),
    );

    expect(groups.map((group) => group.label).slice(0, 2)).toEqual([
      "Hoy",
      "Ayer",
    ]);
    expect(groups.length).toBe(3);
    expect(groups[0].rows.map((row) => row.id)).toEqual(["a", "b"]);
  });

  it("renders the text of each type in the interface language", () => {
    const [group] = service.groups(
      [
        entry({ id: "a" }),
        entry({
          id: "b",
          type: NotificationType.AgendaAppointmentUpcoming,
          params: { title: "Fisio", time: "18:00", minutes: 40 },
        }),
        entry({ id: "c", params: { title: "Analítica", time: null } }),
      ],
      new Date("2026-09-28T22:00:00"),
    );

    expect(group.rows[0].title).toBe("Mañana: Dentista");
    expect(group.rows[0].body).toBe("A las 10:30.");
    expect(group.rows[1].title).toBe("Fisio a las 18:00");
    expect(group.rows[1].body).toBe("Empieza en 40 min.");
    expect(group.rows[2].body).toBe("Sin hora.");
    expect(group.rows[0].icon).toBe("agenda");
  });

  it("falls back to the server text for unknown types", () => {
    const [group] = service.groups(
      [entry({ type: "gym.streak", module: "gym" })],
      new Date("2026-09-28T22:00:00"),
    );

    expect(group.rows[0].title).toBe("server title");
    expect(group.rows[0].icon).toBe("bell");
  });
});
