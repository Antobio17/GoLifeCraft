import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { delay, tap } from "rxjs/operators";
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
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { getRoleLabelKey } from "@authorization/domain/utils/role.utils";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
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
import { ProfileCardComponent } from "@shared/design-system/profile-card/infrastructure/components/profile-card.component";
import { PreferenceToggleComponent } from "@shared/design-system/preference-toggle/infrastructure/components/preference-toggle.component";
import { PasswordStrengthComponent } from "@shared/design-system/password-strength/infrastructure/components/password-strength.component";

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
    ProfileCardComponent,
    PreferenceToggleComponent,
    PasswordStrengthComponent,
  ],
})
export class MyProfileComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private getMyProfileService = inject(GetMyProfileService);
  private updateMyProfileService = inject(UpdateMyProfileService);
  private changeMyPasswordService = inject(ChangeMyPasswordService);
  private floatingToastService = inject(FloatingToastService);
  private translationService = inject(TranslationService);
  private themeService = inject(ThemeService);
  private authSessionService = inject(AuthSessionService);
  private router = inject(Router);
  private location = inject(Location);

  private readonly MODULE_PATH = "authorization/user/user";

  profileForm: FormGroup;
  passwordForm: FormGroup;

  username = signal("");
  email = signal("");
  role = signal("");
  isActive = signal(false);
  tenantId = signal("");
  loading = signal(true);
  saving = signal(false);
  changingPassword = signal(false);

  readonly isDark = this.themeService.isDark;

  readonly fullName = computed(() => {
    const name = this.profileForm.get("name")?.value ?? "";
    const lastname = this.profileForm.get("lastname")?.value ?? "";
    const composed = `${name} ${lastname}`.trim();
    if (composed) return composed;
    return this.username() || this.email().split("@")[0];
  });

  readonly initial = computed(() => {
    const source = this.fullName().trim() || this.email().trim();
    return source ? source.charAt(0).toUpperCase() : "?";
  });

  readonly roleLabelKey = computed(() => getRoleLabelKey(this.role()));

  constructor() {
    this.profileForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      lastname: ["", [Validators.required, Validators.minLength(2)]],
    });

    this.passwordForm = this.formBuilder.group(
      {
        currentPassword: ["", [Validators.required, Validators.minLength(8)]],
        newPassword: ["", [Validators.required, passwordStrengthValidator]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: passwordMatchValidator },
    );
  }

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

        this.profileForm.patchValue({
          name: attrs.name ?? "",
          lastname: attrs.lastname ?? "",
        });

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  back(): void {
    this.location.back();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authSessionService.clearSession();
    this.router.navigate(["/login"]);
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.updateMyProfileService
      .updateMyProfile(this.profileForm.value)
      .pipe(
        tap(() => {
          this.saving.set(false);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "profile.update.success",
            details: [],
          });
        }),
        delay(800),
      )
      .subscribe({
        next: () => window.location.reload(),
        error: () => {
          this.saving.set(false);
          this.floatingToastService.showToast({
            status: 400,
            keyTranslation: "profile.update.error",
            details: [],
          });
        },
      });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.changingPassword.set(true);

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.changeMyPasswordService
      .changeMyPassword({ currentPassword, newPassword })
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.changingPassword.set(false);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "profile.password.change.success",
            details: [],
          });
        },
        error: (err) => {
          this.changingPassword.set(false);
          this.floatingToastService.showToast({
            status: 400,
            keyTranslation:
              err?.error?.keyTranslation ?? "profile.password.change.error",
            details: err?.error?.details ?? [],
          });
        },
      });
  }
}
