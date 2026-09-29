import { inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { NotificationType } from "@notification/notification/inbox/domain/models/notification-type.enum";
import { NotificationPreference } from "../../domain/models/notification-preference.model";
import { NotificationModuleGroup } from "../../domain/models/notification-module-group.model";
import { NotificationPreferenceRow } from "../../domain/models/notification-preference-row.model";

const MODULE_PATH = "notification/notification/inbox";
const MINUTES_PER_HOUR = 60;

const PREFERENCE_KEY: Record<string, string> = {
  [NotificationType.AgendaAppointmentDayBefore]: "dayBefore",
  [NotificationType.AgendaAppointmentUpcoming]: "upcoming",
};

const PREFERENCE_GLYPH: Record<string, DsGlyph> = {
  [NotificationType.AgendaAppointmentDayBefore]: DsGlyph.EveReminder,
  [NotificationType.AgendaAppointmentUpcoming]: DsGlyph.SoonAlarm,
};

export class NotificationPreferenceViewService {
  private translationService = inject(TranslationService);

  groups(
    preferences: NotificationPreference[],
    leadMinutesOptions: number[],
  ): NotificationModuleGroup[] {
    const modules = [...new Set(preferences.map((item) => item.module))];

    return modules.map((module) => ({
      module,
      label: this.t(`notifications.module.${module}`),
      rows: preferences
        .filter((preference) => preference.module === module)
        .map((preference) => this.row(preference, leadMinutesOptions)),
    }));
  }

  leadLabel(minutes: number): string {
    if (minutes < MINUTES_PER_HOUR) {
      return this.t("notifications.settings.lead.minutes", { value: minutes });
    }

    return this.t("notifications.settings.lead.hours", {
      value: minutes / MINUTES_PER_HOUR,
    });
  }

  private row(
    preference: NotificationPreference,
    leadMinutesOptions: number[],
  ): NotificationPreferenceRow {
    const key = PREFERENCE_KEY[preference.type] ?? preference.type;

    return {
      type: preference.type,
      glyph: PREFERENCE_GLYPH[preference.type] ?? DsGlyph.PushAlert,
      title: this.t(`notifications.settings.preference.${key}.title`),
      subtitle: this.t(`notifications.settings.preference.${key}.subtitle`),
      enabled: preference.enabled,
      time: preference.time,
      leadMinutes:
        null === preference.leadMinutes ? null : String(preference.leadMinutes),
      leadOptions: leadMinutesOptions.map<SelectOption>((minutes) => ({
        value: String(minutes),
        label: this.leadLabel(minutes),
      })),
      testId: `notifications-preference-${key}`,
    };
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, MODULE_PATH, params);
  }
}
