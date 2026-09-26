import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  EMPTY,
  Observable,
  catchError,
  finalize,
  forkJoin,
  switchMap,
  tap,
} from "rxjs";
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { GetMyProfileService } from "../../application/services/get-my-profile.service";
import { UpdateMyProfileService } from "../../application/services/update-my-profile.service";
import { ChangeMyPasswordService } from "../../application/services/change-my-password.service";
import { GetMyProfileProvider } from "../providers/get-my-profile.provider";
import { UpdateMyProfileProvider } from "../providers/update-my-profile.provider";
import { ChangeMyPasswordProvider } from "../providers/change-my-password.provider";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ThemeService } from "@shared/theme/application/services/theme.service";
import { Theme } from "@shared/theme/domain/models/theme.model";
import { VisualPreferenceService } from "@shared/visual-preference/application/services/visual-preference.service";
import { VisualMode } from "@shared/visual-preference/domain/models/visual-mode.enum";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { MyAvatarService } from "@shared/my-avatar/application/services/my-avatar.service";
import { getRoleLabelKey } from "@authorization/domain/utils/role.utils";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { FormInputComponent } from "@shared/design-system/form-input/infrastructure/components/form-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { ReadonlyStripComponent } from "@shared/design-system/readonly-strip/infrastructure/components/readonly-strip.component";
import { IconBadgeComponent } from "@shared/design-system/icon-badge/infrastructure/components/icon-badge.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { SkeletonListItemComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list-item.component";
import { SkeletonFieldsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-fields.component";
import { ProfileCardComponent } from "@shared/design-system/profile-card/infrastructure/components/profile-card.component";
import { PreferenceChoiceComponent } from "@shared/design-system/preference-choice/infrastructure/components/preference-choice.component";
import { PreferenceChoiceOption } from "@shared/design-system/preference-choice/domain/models/preference-choice-option.model";
import { PasswordStrengthComponent } from "@shared/design-system/password-strength/infrastructure/components/password-strength.component";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";

function passwordStrengthValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;

  const valid =
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^a-zA-Z0-9]/.test(value);

  return valid ? null : { weakPassword: true };
}

function passwordCompletenessValidator(
  form: AbstractControl,
): ValidationErrors | null {
  const controls = ["currentPassword", "newPassword", "confirmPassword"]
    .map((name) => form.get(name))
    .filter((control): control is AbstractControl => null !== control);
  const anyFilled = controls.some((control) => !!control.value);

  controls
    .filter((control) => !control.value)
    .forEach((control) =>
      control.setErrors(anyFilled ? { required: true } : null),
    );

  return null;
}

function passwordMatchValidator(
  form: AbstractControl,
): ValidationErrors | null {
  const newPassword = form.get("newPassword")?.value;
  const confirmPassword = form.get("confirmPassword");

  if (!confirmPassword) {
    return null;
  }

  if (newPassword !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
  } else if (confirmPassword.errors?.["passwordMismatch"]) {
    confirmPassword.setErrors(null);
  }

  return null;
}

@Component({
  selector: "app-my-profile",
  templateUrl: "./my-profile.component.html",
  providers: [
    ...GetMyProfileProvider.getProviders(),
    ...UpdateMyProfileProvider.getProviders(),
    ...ChangeMyPasswordProvider.getProviders(),
  ],
  imports: [
    ReactiveFormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    StackComponent,
    TextComponent,
    FormInputComponent,
    ButtonComponent,
    CardComponent,
    FieldComponent,
    ReadonlyStripComponent,
    IconBadgeComponent,
    SkeletonComponent,
    SkeletonLineComponent,
    SkeletonListItemComponent,
    SkeletonFieldsComponent,
    ProfileCardComponent,
    PreferenceChoiceComponent,
    PasswordStrengthComponent,
  ],
})
export class MyProfileComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private backNavigation = inject(BackNavigationService);
  private getMyProfileService = inject(GetMyProfileService);
  private updateMyProfileService = inject(UpdateMyProfileService);
  private changeMyPasswordService = inject(ChangeMyPasswordService);
  private floatingToastService = inject(FloatingToastService);
  private translationService = inject(TranslationService);
  private themeService = inject(ThemeService);
  private visualPreferenceService = inject(VisualPreferenceService);
  private authSessionService = inject(AuthSessionService);
  private myAvatarService = inject(MyAvatarService);
  private router = inject(Router);

  private readonly MODULE_PATH = "authorization/user/user";

  readonly profileForm = this.formBuilder.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    lastname: ["", [Validators.required, Validators.minLength(2)]],
  });

  readonly passwordForm = this.formBuilder.nonNullable.group(
    {
      currentPassword: ["", [Validators.minLength(8)]],
      newPassword: ["", [passwordStrengthValidator]],
      confirmPassword: [""],
    },
    { validators: [passwordCompletenessValidator, passwordMatchValidator] },
  );

  private readonly profileValue = toSignal(this.profileForm.valueChanges, {
    initialValue: this.profileForm.getRawValue(),
  });

  private readonly passwordValue = toSignal(this.passwordForm.valueChanges, {
    initialValue: this.passwordForm.getRawValue(),
  });

  private readonly savedProfile = signal<string | null>(null);

  username = signal("");
  email = signal("");
  role = signal("");
  isActive = signal(false);
  tenantId = signal("");
  loading = signal(true);
  saving = signal(false);
  savingAvatar = signal(false);

  readonly avatarUrl = this.myAvatarService.url;

  readonly theme = computed<string>(() =>
    this.themeService.isDark() ? "dark" : "light",
  );

  readonly themeOptions = computed<PreferenceChoiceOption[]>(() => [
    { value: "light", label: this.t("settings.theme.light") },
    { value: "dark", label: this.t("settings.theme.dark") },
  ]);

  readonly visualModeOptions = computed<PreferenceChoiceOption[]>(() => [
    { value: VisualMode.Image, label: this.t("settings.visual.mode.image") },
    { value: VisualMode.Icon, label: this.t("settings.visual.mode.icon") },
  ]);

  readonly visualRows = computed(() =>
    Object.values(VisualSurface).map((surface) => ({
      surface,
      titleKey: `settings.visual.surface.${surface}`,
      mode: this.visualPreferenceService.modeOf(surface) as string,
    })),
  );

  readonly sharedVisualMode = computed<string>(() => {
    const modes = this.visualRows().map((row) => row.mode);
    const allEqual = modes.every((mode) => mode === modes[0]);

    return allEqual ? modes[0] : "";
  });

  readonly profileChanged = computed(() => {
    const saved = this.savedProfile();

    return null !== saved && saved !== JSON.stringify(this.profileValue());
  });

  readonly passwordChanged = computed(() =>
    Object.values(this.passwordValue()).some((value) => !!value),
  );

  readonly hasChanges = computed(
    () => this.profileChanged() || this.passwordChanged(),
  );

  readonly newPassword = computed(() => this.passwordValue().newPassword ?? "");

  readonly fullName = computed(() => {
    const name = this.profileValue().name ?? "";
    const lastname = this.profileValue().lastname ?? "";
    const composed = `${name} ${lastname}`.trim();
    if (composed) return composed;
    return this.username() || this.email().split("@")[0];
  });

  readonly initial = computed(() => {
    const source = this.fullName().trim() || this.email().trim();
    return source ? source.charAt(0).toUpperCase() : "?";
  });

  readonly roleLabelKey = computed(() => getRoleLabelKey(this.role()));

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => this.loadProfile());
  }

  private loadProfile(): void {
    this.getMyProfileService.getMyProfile().subscribe({
      next: (response) => {
        const attrs = response.data.attributes;
        this.username.set(attrs.username);
        this.email.set(attrs.email);
        this.role.set(attrs.role);
        this.isActive.set(attrs.isActive);
        this.tenantId.set(attrs.tenantId);
        this.authSessionService.setUserIdentity(
          attrs.name,
          attrs.lastname,
          attrs.avatar,
        );
        this.visualPreferenceService.applyFromPreferences(
          attrs.visualPreferences ?? {},
        );

        this.profileForm.reset({
          name: attrs.name ?? "",
          lastname: attrs.lastname ?? "",
        });
        this.markProfileSaved();

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  back(): void {
    this.backNavigation.back(["/dashboard"]);
  }

  changeTheme(theme: string): void {
    this.themeService.change(theme as Theme);
  }

  changeVisual(surface: VisualSurface, mode: string): void {
    this.visualPreferenceService.change(surface, mode as VisualMode);
  }

  changeAllVisual(mode: string): void {
    this.visualPreferenceService.changeAll(mode as VisualMode);
  }

  logout(): void {
    this.authSessionService.clearSession();
    this.router.navigate(["/login"]);
  }

  save(): void {
    if (!this.hasChanges() || this.saving()) {
      return;
    }

    if (this.profileForm.invalid || this.passwordForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.passwordForm.markAllAsTouched();
      return;
    }

    const operations = [
      ...(this.profileChanged() ? [this.saveProfile()] : []),
      ...(this.passwordChanged() ? [this.savePassword()] : []),
    ];

    this.saving.set(true);

    forkJoin(operations)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe(() =>
        this.floatingToastService.showToast({
          status: 200,
          keyTranslation: "profile.update.success",
          details: [],
        }),
      );
  }

  private saveProfile(): Observable<unknown> {
    return this.updateMyProfileService
      .updateMyProfile(this.profileForm.getRawValue())
      .pipe(
        switchMap(() => this.getMyProfileService.getMyProfile()),
        tap((profile) => {
          const attrs = profile.data.attributes;
          this.authSessionService.setUserIdentity(
            attrs.name,
            attrs.lastname,
            attrs.avatar,
          );
          this.markProfileSaved();
        }),
        catchError(() => {
          this.floatingToastService.showToast({
            status: 400,
            keyTranslation: "profile.update.error",
            details: [],
          });

          return EMPTY;
        }),
      );
  }

  private savePassword(): Observable<unknown> {
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    return this.changeMyPasswordService
      .changeMyPassword({ currentPassword, newPassword })
      .pipe(
        tap(() => this.passwordForm.reset()),
        catchError((err) => {
          this.floatingToastService.showToast({
            status: 400,
            keyTranslation:
              err?.error?.keyTranslation ?? "profile.password.change.error",
            details: err?.error?.details ?? [],
          });

          return EMPTY;
        }),
      );
  }

  private markProfileSaved(): void {
    this.savedProfile.set(JSON.stringify(this.profileForm.getRawValue()));
  }

  onAvatarPicked(file: File): void {
    this.changeAvatar(this.myAvatarService.upload(file));
  }

  onAvatarCleared(): void {
    this.changeAvatar(this.myAvatarService.remove());
  }

  private changeAvatar(change: Observable<void>): void {
    this.savingAvatar.set(true);

    change
      .pipe(switchMap(() => this.getMyProfileService.getMyProfile()))
      .subscribe({
        next: (profile) => {
          const attrs = profile.data.attributes;
          this.authSessionService.setUserIdentity(
            attrs.name,
            attrs.lastname,
            attrs.avatar,
          );
          this.savingAvatar.set(false);
        },
        error: () => {
          this.savingAvatar.set(false);
          this.floatingToastService.showToast({
            status: 400,
            keyTranslation: "profile.avatar.error",
            details: [],
          });
        },
      });
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }
}
