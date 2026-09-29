import { inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { NotificationType } from "@notification/notification/inbox/domain/models/notification-type.enum";
import { NotificationPreference } from "../../domain/models/notification-preference.model";
import { NotificationModuleSummary } from "../../domain/models/notification-module-summary.model";
import { NotificationModule } from "@notification/notification/inbox/domain/models/notification-module.enum";
import { NotificationPreferenceRow } from "../../domain/models/notification-preference-row.model";

const MODULE_PATH = "notification/notification/inbox";
const MINUTES_PER_HOUR = 60;

const PREFERENCE_KEY: Record<string, string> = {
  [NotificationType.AgendaAppointmentDayBefore]: "dayBefore",
  [NotificationType.AgendaAppointmentUpcoming]: "upcoming",
  [NotificationType.NutritionMealBreakfast]: "breakfast",
  [NotificationType.NutritionMealLunch]: "lunch",
  [NotificationType.NutritionMealSnack]: "snack",
  [NotificationType.NutritionMealDinner]: "dinner",
};

const PREFERENCE_GLYPH: Record<string, DsGlyph> = {
  [NotificationType.AgendaAppointmentDayBefore]: DsGlyph.EveReminder,
  [NotificationType.AgendaAppointmentUpcoming]: DsGlyph.SoonAlarm,
  [NotificationType.NutritionMealBreakfast]: DsGlyph.Pan,
  [NotificationType.NutritionMealLunch]: DsGlyph.Plate,
  [NotificationType.NutritionMealSnack]: DsGlyph.Apple,
  [NotificationType.NutritionMealDinner]: DsGlyph.Cloche,
};

const MODULE_GLYPH: Record<string, DsGlyph> = {
  [NotificationModule.Agenda]: DsGlyph.Calendar,
  [NotificationModule.Nutrition]: DsGlyph.Plate,
};

export class NotificationPreferenceViewService {
  private translationService = inject(TranslationService);

  modules(preferences: NotificationPreference[]): NotificationModuleSummary[] {
    const modules = [...new Set(preferences.map((item) => item.module))];

    return modules.map((module) => {
      const own = preferences.filter((item) => item.module === module);

      return {
        module,
        glyph: MODULE_GLYPH[module] ?? DsGlyph.PushAlert,
        title: this.moduleTitle(module),
        subtitle: this.moduleSubtitle(
          own.filter((item) => item.enabled).length,
          own.length,
        ),
        testId: `notifications-module-${module}`,
      };
    });
  }

  rows(
    preferences: NotificationPreference[],
    module: string,
    leadMinutesOptions: number[],
  ): NotificationPreferenceRow[] {
    return preferences
      .filter((preference) => preference.module === module)
      .map((preference) => this.row(preference, leadMinutesOptions));
  }

  moduleTitle(module: string): string {
    return this.t(`notifications.module.${module}`);
  }

  leadLabel(minutes: number): string {
    if (minutes < MINUTES_PER_HOUR) {
      return this.t("notifications.settings.lead.minutes", { value: minutes });
    }

    return this.t("notifications.settings.lead.hours", {
      value: minutes / MINUTES_PER_HOUR,
    });
  }

  private moduleSubtitle(enabled: number, total: number): string {
    if (0 === enabled) return this.t("notifications.settings.module.none");
    if (enabled === total) return this.t("notifications.settings.module.all");

    return this.t("notifications.settings.module.some", { enabled, total });
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
      timeLabel: this.t(`notifications.settings.preference.${key}.time`),
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
