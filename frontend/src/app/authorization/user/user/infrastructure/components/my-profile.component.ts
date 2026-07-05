import { Component, OnInit, inject } from "@angular/core";
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
import { of } from "rxjs";
import { delay } from "rxjs/operators";
import { GetMyProfileService } from "../../application/services/get-my-profile.service";
import { UpdateMyProfileService } from "../../application/services/update-my-profile.service";
import { ChangeMyPasswordService } from "../../application/services/change-my-password.service";
import { GetMyProfileProvider } from "../providers/get-my-profile.provider";
import { UpdateMyProfileProvider } from "../providers/update-my-profile.provider";
import { ChangeMyPasswordProvider } from "../providers/change-my-password.provider";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";
import { FormSectionComponent } from "@shared/design-system/form-section/infrastructure/components/form-section.component";
import { FormInputComponent } from "@shared/design-system/form-input/infrastructure/components/form-input.component";
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
  styleUrls: ["./my-profile.component.css"],
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

  username: string = "";
  role: string = "";
  loading: boolean = true;
  saving: boolean = false;
  changingPassword: boolean = false;

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

            this.loading = false;
          },
          error: () => {
            this.loading = false;
          },
        });
      });
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach((key) => {
        this.profileForm.controls[key].markAsTouched();
      });
      return;
    }

    this.saving = true;

    this.updateMyProfileService
      .updateMyProfile(this.profileForm.value)
      .subscribe({
        next: () => {
          this.saving = false;
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "profile.update.success",
            details: [],
          });
          of(null)
            .pipe(delay(800))
            .subscribe(() => window.location.reload());
        },
        error: () => {
          this.saving = false;
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
      Object.keys(this.passwordForm.controls).forEach((key) => {
        this.passwordForm.controls[key].markAsTouched();
      });
      return;
    }

    this.changingPassword = true;

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.changeMyPasswordService
      .changeMyPassword({ currentPassword, newPassword })
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.changingPassword = false;
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "profile.password.change.success",
            details: [],
          });
        },
        error: (err) => {
          this.changingPassword = false;
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
    const badgeClasses: { [key: string]: string } = {
      [USER_ROLES.GOD]: "badge-god",
    };
    return badgeClasses[role] || "badge-user";
  }

  getRoleTranslationKey(role: string): string {
    const roleKeys: { [key: string]: string } = {
      [USER_ROLES.GOD]: "user.roles.god",
      [USER_ROLES.USER]: "user.roles.user",
    };
    return roleKeys[role] || role;
  }
}
