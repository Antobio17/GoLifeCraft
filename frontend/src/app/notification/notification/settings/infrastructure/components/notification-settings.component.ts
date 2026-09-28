import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpErrorResponse } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { finalize, tap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AutosaveService } from "@shared/autosave/application/services/autosave.service";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { PreferenceToggleComponent } from "@shared/design-system/preference-toggle/infrastructure/components/preference-toggle.component";
import { PreferenceChoiceComponent } from "@shared/design-system/preference-choice/infrastructure/components/preference-choice.component";
import { PreferenceChoiceOption } from "@shared/design-system/preference-choice/domain/models/preference-choice-option.model";
import { ReadonlyStripComponent } from "@shared/design-system/readonly-strip/infrastructure/components/readonly-strip.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { SaveStatusComponent } from "@shared/design-system/save-status/infrastructure/components/save-status.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { PushNotificationsService } from "@notification/notification/push-subscription/application/services/push-notifications.service";
import { PushPermissionDeniedError } from "@notification/notification/push-subscription/domain/errors/push-permission-denied.error";
import { GetNotificationSettingsService } from "../../application/services/get-notification-settings.service";
import { UpdateNotificationSettingsService } from "../../application/services/update-notification-settings.service";
import { NotificationPreferenceViewService } from "../../application/services/notification-preference-view.service";
import { NotificationSettingsProvider } from "../providers/notification-settings.provider";
import { NotificationSettings } from "../../domain/models/notification-settings.model";
import { NotificationPreference } from "../../domain/models/notification-preference.model";
import { NotificationModuleGroup } from "../../domain/models/notification-module-group.model";

@Component({
  selector: "app-notification-settings",
  templateUrl: "./notification-settings.component.html",
  providers: [...NotificationSettingsProvider.getProviders()],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    SplitViewComponent,
    StackComponent,
    TextComponent,
    CardComponent,
    ButtonComponent,
    IconButtonComponent,
    PreferenceToggleComponent,
    PreferenceChoiceComponent,
    ReadonlyStripComponent,
    DateInputComponent,
    NoteComponent,
    SaveStatusComponent,
    SkeletonComponent,
    SkeletonLineComponent,
  ],
})
export class NotificationSettingsComponent {
  private getSettingsService = inject(GetNotificationSettingsService);
  private updateSettingsService = inject(UpdateNotificationSettingsService);
  private preferenceView = inject(NotificationPreferenceViewService);
  private pushNotificationsService = inject(PushNotificationsService);
  private translationService = inject(TranslationService);
  private floatingToastService = inject(FloatingToastService);
  protected autosave = inject(AutosaveService);

  private readonly MODULE_PATH = "notification/notification/inbox";
  private readonly SETTINGS_KEY = "notification-settings";
  private readonly deviceTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  readonly settings = signal<NotificationSettings | null>(null);
  readonly loading = computed(() => null === this.settings());

  readonly pushEnabled = this.pushNotificationsService.enabled;
  readonly pushToggleable = this.pushNotificationsService.toggleable;
  readonly sendingPushTest = signal(false);

  readonly pushHintKey = computed(() =>
    this.pushEnabled()
      ? "notifications.settings.push.hint.on"
      : `notifications.settings.push.hint.${this.pushNotificationsService.availability()}`,
  );

  readonly groups = computed<NotificationModuleGroup[]>(() => {
    const settings = this.settings();

    if (!settings) return [];

    return this.preferenceView.groups(
      settings.preferences,
      settings.leadMinutesOptions,
    );
  });

  readonly languageOptions = computed<PreferenceChoiceOption[]>(() =>
    (this.settings()?.languages ?? []).map((language) => ({
      value: language,
      label: this.t(`notifications.settings.language.${language}`),
    })),
  );

  readonly timezoneDiffers = computed(
    () =>
      !!this.deviceTimezone &&
      this.settings()?.timezone !== this.deviceTimezone,
  );

  readonly useDeviceTimezoneLabel = computed(() =>
    this.t("notifications.settings.timezone.useDevice", {
      timezone: this.deviceTimezone,
    }),
  );

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

    this.getSettingsService
      .getSettings()
      .pipe(takeUntilDestroyed())
      .subscribe((response) => this.settings.set(response.data.attributes));

    this.pushNotificationsService.load().pipe(takeUntilDestroyed()).subscribe();
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

  toggleQuietHours(): void {
    this.change((settings) => ({
      ...settings,
      quietHoursEnabled: !settings.quietHoursEnabled,
    }));
  }

  changeQuietHoursStart(time: string): void {
    if (!time) return;

    this.change((settings) => ({ ...settings, quietHoursStart: time }));
  }

  changeQuietHoursEnd(time: string): void {
    if (!time) return;

    this.change((settings) => ({ ...settings, quietHoursEnd: time }));
  }

  changeLanguage(languageCode: string): void {
    this.change((settings) => ({ ...settings, languageCode }));
  }

  useDeviceTimezone(): void {
    this.change((settings) => ({ ...settings, timezone: this.deviceTimezone }));
  }

  togglePush(): void {
    const enabling = !this.pushEnabled();
    const change = enabling
      ? this.pushNotificationsService.enable()
      : this.pushNotificationsService.disable();

    change.subscribe({
      error: (error: unknown) =>
        this.showPushError(
          error,
          enabling
            ? "notifications.settings.push.enableError"
            : "notifications.settings.push.disableError",
        ),
    });
  }

  sendPushTest(): void {
    if (this.sendingPushTest()) return;

    this.sendingPushTest.set(true);

    this.pushNotificationsService
      .sendTest({
        title: this.t("notifications.settings.push.test.title"),
        body: this.t("notifications.settings.push.test.body"),
      })
      .pipe(finalize(() => this.sendingPushTest.set(false)))
      .subscribe();
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

  private change(
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

  private showSaveError(): void {
    this.floatingToastService.showToast({
      status: 400,
      keyTranslation: "notifications.settings.saveError",
      details: [],
    });
  }

  private showPushError(error: unknown, fallbackKey: string): void {
    if (error instanceof HttpErrorResponse) return;

    this.floatingToastService.showToast({
      status: 400,
      keyTranslation:
        error instanceof PushPermissionDeniedError
          ? "notifications.settings.push.denied"
          : fallbackKey,
      details: [],
    });
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }
}
