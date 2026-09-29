import { Component, computed, inject, input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { PreferenceToggleComponent } from "@shared/design-system/preference-toggle/infrastructure/components/preference-toggle.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { SelectComponent } from "@shared/design-system/select/infrastructure/components/select.component";
import { SaveStatusComponent } from "@shared/design-system/save-status/infrastructure/components/save-status.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { NotificationPreferenceViewService } from "../../application/services/notification-preference-view.service";
import { NotificationSettingsEditorService } from "../../application/services/notification-settings-editor.service";
import { NotificationPreferenceRow } from "../../domain/models/notification-preference-row.model";
import { NotificationSettingsProvider } from "../providers/notification-settings.provider";

@Component({
  selector: "app-notification-module-settings",
  templateUrl: "./notification-module-settings.component.html",
  providers: [...NotificationSettingsProvider.getProviders()],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    TextComponent,
    PreferenceToggleComponent,
    DateInputComponent,
    SelectComponent,
    SaveStatusComponent,
    SkeletonComponent,
  ],
})
export class NotificationModuleSettingsComponent {
  private editor = inject(NotificationSettingsEditorService);
  private preferenceView = inject(NotificationPreferenceViewService);
  private translationService = inject(TranslationService);
  private backNavigation = inject(BackNavigationService);
  protected autosave = this.editor.autosave;

  private readonly MODULE_PATH = "notification/notification/inbox";

  readonly module = input.required<string>();

  readonly loading = this.editor.loading;

  readonly title = computed(() =>
    this.preferenceView.moduleTitle(this.module()),
  );

  readonly rows = computed<NotificationPreferenceRow[]>(() => {
    const settings = this.editor.settings();

    if (!settings) return [];

    return this.preferenceView.rows(
      settings.preferences,
      this.module(),
      settings.leadMinutesOptions,
    );
  });

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);
    this.editor.load();
  }

  togglePreference(type: string): void {
    this.editor.togglePreference(type);
  }

  changePreferenceTime(type: string, time: string): void {
    this.editor.changePreferenceTime(type, time);
  }

  changePreferenceLead(type: string, leadMinutes: string): void {
    this.editor.changePreferenceLead(type, leadMinutes);
  }

  back(): void {
    this.backNavigation.back(["/notifications"]);
  }
}
