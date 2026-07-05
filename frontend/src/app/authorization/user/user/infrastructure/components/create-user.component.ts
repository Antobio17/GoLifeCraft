import { Component, OnInit, inject, signal } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SectionPageWrapperComponent } from "@shared/design-system/section-page-wrapper/infrastructure/components/section-page-wrapper.component";
import { FormActionsComponent } from "@shared/design-system/form-actions/infrastructure/components/form-actions.component";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { delay, tap } from "rxjs/operators";
import { CreateUserService } from "../../application/services/create-user.service";
import { CreateUserRequest } from "../../domain/models/create-user.model";
import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";
import { UserRole } from "@authorization/domain/models/user-role.model";
import {
  getAvailableRoles,
  getRoleDescriptionKey,
  getRoleFullLabelKey,
} from "@authorization/domain/utils/role.utils";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FormSectionComponent } from "@shared/design-system/form-section/infrastructure/components/form-section.component";
import { FormInputComponent } from "@shared/design-system/form-input/infrastructure/components/form-input.component";
import { FORM_SECTION_ICONS } from "@shared/design-system/form-section/constants/form-section-icons.constants";

@Component({
  selector: "app-create-user",
  templateUrl: "./create-user.component.html",
  styleUrls: ["./create-user.component.css"],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ContextualTranslatePipe,
    FormSectionComponent,
    FormInputComponent,
    PageWrapperComponent,
    SectionPageWrapperComponent,
    FormActionsComponent,
  ],
})
export class CreateUserComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private createUserService = inject(CreateUserService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);

  private readonly MODULE_PATH = "authorization/user/user";

  readonly ICONS = FORM_SECTION_ICONS;

  userForm: FormGroup;
  loading = signal(true);
  saving = signal(false);
  availableRoles: UserRole[] = getAvailableRoles(false);
  showPassword = false;

  constructor() {
    this.userForm = this.formBuilder.group(
      {
        username: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        name: ["", [Validators.required]],
        lastname: ["", [Validators.required]],
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required]],
        role: [USER_ROLES.USER, [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.loading.set(false);
      });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const userData = { ...this.userForm.value };
    delete userData.confirmPassword;
    const userRequest: CreateUserRequest = {
      ...userData,
    };

    this.createUserService
      .createUser(userRequest)
      .pipe(
        tap(() => {
          this.saving.set(false);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "user.create.success",
            details: [],
          });
        }),
        delay(900),
      )
      .subscribe({
        next: () => this.router.navigate(["/users"]),
        error: () => this.saving.set(false),
      });
  }

  getRoleName(role: string): string {
    return getRoleFullLabelKey(role);
  }

  getRoleDescription(role: string): string {
    return getRoleDescriptionKey(role);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  cancel(): void {
    this.router.navigate(["/users"]);
  }
}
