import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
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
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { SaveStatusComponent } from "@shared/design-system/save-status/infrastructure/components/save-status.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { PushNotificationsService } from "@notification/notification/push-subscription/application/services/push-notifications.service";
import { PushPermissionDeniedError } from "@notification/notification/push-subscription/domain/errors/push-permission-denied.error";
import { NotificationPreferenceViewService } from "../../application/services/notification-preference-view.service";
import { NotificationSettingsEditorService } from "../../application/services/notification-settings-editor.service";
import { NotificationModuleSummary } from "../../domain/models/notification-module-summary.model";
import { CtaRowComponent } from "@shared/design-system/cta-row/infrastructure/components/cta-row.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { NotificationSettingsProvider } from "../providers/notification-settings.provider";

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
    CtaRowComponent,
    NoteComponent,
    SaveStatusComponent,
    SkeletonComponent,
    SkeletonLineComponent,
  ],
})
export class NotificationSettingsComponent {
  private editor = inject(NotificationSettingsEditorService);
  private preferenceView = inject(NotificationPreferenceViewService);
  private pushNotificationsService = inject(PushNotificationsService);
  private translationService = inject(TranslationService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);
  protected autosave = this.editor.autosave;

  private readonly MODULE_PATH = "notification/notification/inbox";
  private readonly deviceTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  readonly settings = this.editor.settings;
  readonly loading = this.editor.loading;

  readonly pushEnabled = this.pushNotificationsService.enabled;
  readonly pushToggleable = this.pushNotificationsService.toggleable;
  readonly sendingPushTest = signal(false);

  readonly pushHintKey = computed(() =>
    this.pushEnabled()
      ? "notifications.settings.push.hint.on"
      : `notifications.settings.push.hint.${this.pushNotificationsService.availability()}`,
  );

  readonly modules = computed<NotificationModuleSummary[]>(() =>
    this.preferenceView.modules(this.settings()?.preferences ?? []),
  );

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
    this.editor.load();
    this.pushNotificationsService.load().pipe(takeUntilDestroyed()).subscribe();
  }

  openModule(module: string): void {
    this.router.navigate(["/notifications/settings", module]);
  }

  toggleQuietHours(): void {
    this.editor.change((settings) => ({
      ...settings,
      quietHoursEnabled: !settings.quietHoursEnabled,
    }));
  }

  changeQuietHoursStart(time: string): void {
    if (!time) return;

    this.editor.change((settings) => ({ ...settings, quietHoursStart: time }));
  }

  changeQuietHoursEnd(time: string): void {
    if (!time) return;

    this.editor.change((settings) => ({ ...settings, quietHoursEnd: time }));
  }

  changeLanguage(languageCode: string): void {
    this.editor.change((settings) => ({ ...settings, languageCode }));
  }

  useDeviceTimezone(): void {
    this.editor.change((settings) => ({
      ...settings,
      timezone: this.deviceTimezone,
    }));
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
