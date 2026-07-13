import { Component, OnInit, inject, signal } from "@angular/core";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SectionPageWrapperComponent } from "@shared/design-system/section-page-wrapper/infrastructure/components/section-page-wrapper.component";
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
import {
  getRoleBadgeClass as resolveRoleBadgeClass,
  getRoleLabelKey,
} from "@authorization/domain/utils/role.utils";
import { FormSectionComponent } from "@shared/design-system/form-section/infrastructure/components/form-section.component";
import { FormInputComponent } from "@shared/design-system/form-input/infrastructure/components/form-input.component";
import { FormRowComponent } from "@shared/design-system/form-row/infrastructure/components/form-row.component";
import { FormFooterComponent } from "@shared/design-system/form-footer/infrastructure/components/form-footer.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { InfoStripComponent } from "@shared/design-system/info-strip/infrastructure/components/info-strip.component";
import { InfoRowComponent } from "@shared/design-system/info-row/infrastructure/components/info-row.component";
import { StatusBadgeComponent } from "@shared/design-system/status-badge/infrastructure/components/status-badge.component";
import { FORM_SECTION_ICONS } from "@shared/design-system/form-section/constants/form-section-icons.constants";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";

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
  } else {
    if (confirmPassword.errors?.["passwordMismatch"]) {
      confirmPassword.setErrors(null);
    }
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
    FormSectionComponent,
    FormInputComponent,
    FormRowComponent,
    FormFooterComponent,
    StackComponent,
    TextComponent,
    InfoStripComponent,
    InfoRowComponent,
    StatusBadgeComponent,
    ButtonComponent,
    PageWrapperComponent,
    SectionPageWrapperComponent,
  ],
})
export class MyProfileComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private getMyProfileService = inject(GetMyProfileService);
  private updateMyProfileService = inject(UpdateMyProfileService);
  private changeMyPasswordService = inject(ChangeMyPasswordService);
  private floatingToastService = inject(FloatingToastService);
  private translationService = inject(TranslationService);

  readonly ICONS = FORM_SECTION_ICONS;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  username = "";
  role = "";
  loading = signal(true);
  saving = signal(false);
  changingPassword = signal(false);

  constructor() {
    this.profileForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      lastname: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
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

  private readonly MODULE_PATH = "authorization/user/user";

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.getMyProfileService.getMyProfile().subscribe({
          next: (response) => {
            const attrs = response.data.attributes;
            this.username = attrs.username;
            this.role = attrs.role;

            this.profileForm.patchValue({
              name: attrs.name ?? "",
              lastname: attrs.lastname ?? "",
              email: attrs.email,
            });

            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        });
      });
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

  getRoleBadgeClass(role: string): string {
    return resolveRoleBadgeClass(role);
  }

  getRoleTranslationKey(role: string): string {
    return getRoleLabelKey(role);
  }
}
