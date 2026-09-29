import { DestroyRef, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { tap } from "rxjs";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AutosaveService } from "@shared/autosave/application/services/autosave.service";
import { GetNotificationSettingsService } from "./get-notification-settings.service";
import { UpdateNotificationSettingsService } from "./update-notification-settings.service";
import { NotificationSettings } from "../../domain/models/notification-settings.model";
import { NotificationPreference } from "../../domain/models/notification-preference.model";

export class NotificationSettingsEditorService {
  private getSettingsService = inject(GetNotificationSettingsService);
  private updateSettingsService = inject(UpdateNotificationSettingsService);
  private floatingToastService = inject(FloatingToastService);
  private destroyRef = inject(DestroyRef);
  readonly autosave = inject(AutosaveService);

  private readonly SETTINGS_KEY = "notification-settings";

  readonly settings = signal<NotificationSettings | null>(null);
  readonly loading = computed(() => null === this.settings());

  load(): void {
    this.getSettingsService
      .getSettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => this.settings.set(response.data.attributes));
  }

  togglePreference(type: string): void {
    this.changePreference(type, (preference) => ({
      ...preference,
      enabled: !preference.enabled,
    }));
  }

  changePreferenceTime(type: string, time: string): void {
    if (!time) return;

    this.changePreference(type, (preference) => ({ ...preference, time }));
  }

  changePreferenceLead(type: string, leadMinutes: string): void {
    this.changePreference(type, (preference) => ({
      ...preference,
      leadMinutes: Number(leadMinutes),
    }));
  }

  change(
    update: (settings: NotificationSettings) => NotificationSettings,
  ): void {
    const current = this.settings();

    if (!current) return;

    const next = update(current);
    this.settings.set(next);

    this.autosave.push(this.SETTINGS_KEY, () =>
      this.updateSettingsService
        .updateSettings({
          timezone: next.timezone,
          languageCode: next.languageCode,
          quietHoursEnabled: next.quietHoursEnabled,
          quietHoursStart: next.quietHoursStart,
          quietHoursEnd: next.quietHoursEnd,
          preferences: next.preferences.map(
            ({ type, enabled, time, leadMinutes }) => ({
              type,
              enabled,
              time,
              leadMinutes,
            }),
          ),
        })
        .pipe(tap({ error: () => this.showSaveError() })),
    );
  }

  private changePreference(
    type: string,
    update: (preference: NotificationPreference) => NotificationPreference,
  ): void {
    this.change((settings) => ({
      ...settings,
      preferences: settings.preferences.map((preference) =>
        preference.type === type ? update(preference) : preference,
      ),
    }));
  }

  private showSaveError(): void {
    this.floatingToastService.showToast({
      status: 400,
      keyTranslation: "notifications.settings.saveError",
      details: [],
    });
  }
}
