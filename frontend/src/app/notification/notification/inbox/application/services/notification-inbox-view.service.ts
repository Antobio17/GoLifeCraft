import { inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { NotificationType } from "../../domain/models/notification-type.enum";
import { NotificationModule } from "../../domain/models/notification-module.enum";
import { NotificationInboxEntry } from "../../domain/models/notification-inbox-entry.model";
import { NotificationDayGroup } from "../../domain/models/notification-day-group.model";
import { NotificationRow } from "../../domain/models/notification-row.model";

const MODULE_PATH = "notification/notification/inbox";
const DAY_MS = 86_400_000;

const MODULE_ICON: Record<string, DsIconName> = {
  [NotificationModule.Agenda]: "agenda",
};

export class NotificationInboxViewService {
  private translationService = inject(TranslationService);

  groups(entries: NotificationInboxEntry[], now: Date): NotificationDayGroup[] {
    const groups = new Map<string, NotificationDayGroup>();

    entries.forEach((entry) => {
      const delivered = new Date(entry.deliveredAt);
      const key = this.dayKey(delivered);
      const group = groups.get(key) ?? {
        key,
        label: this.dayLabel(delivered, now),
        rows: [],
      };

      group.rows.push(this.row(entry, delivered));
      groups.set(key, group);
    });

    return [...groups.values()];
  }

  private row(entry: NotificationInboxEntry, delivered: Date): NotificationRow {
    const text = this.text(entry);

    return {
      id: entry.id,
      icon: MODULE_ICON[entry.module] ?? "bell",
      title: text.title,
      body: text.body,
      time: new Intl.DateTimeFormat(this.translationService.getLocale(), {
        hour: "2-digit",
        minute: "2-digit",
      }).format(delivered),
      unread: entry.unread,
      url: entry.url,
    };
  }

  private text(entry: NotificationInboxEntry): { title: string; body: string } {
    const params: Record<string, unknown> = { ...entry.params };

    if (NotificationType.AgendaAppointmentDayBefore === entry.type) {
      return {
        title: this.t("notifications.type.dayBefore.title", params),
        body: this.t(
          entry.params.time
            ? "notifications.type.dayBefore.bodyTimed"
            : "notifications.type.dayBefore.bodyUntimed",
          params,
        ),
      };
    }

    if (NotificationType.AgendaAppointmentUpcoming === entry.type) {
      return {
        title: this.t("notifications.type.upcoming.title", params),
        body: this.t("notifications.type.upcoming.body", params),
      };
    }

    return { title: entry.title, body: entry.body };
  }

  private dayLabel(date: Date, now: Date): string {
    const difference = Math.round(
      (this.startOfDay(now) - this.startOfDay(date)) / DAY_MS,
    );

    if (0 === difference) return this.t("notifications.inbox.today");
    if (1 === difference) return this.t("notifications.inbox.yesterday");

    return new Intl.DateTimeFormat(this.translationService.getLocale(), {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  }

  private startOfDay(date: Date): number {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();
  }

  private dayKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, MODULE_PATH, params);
  }
}
