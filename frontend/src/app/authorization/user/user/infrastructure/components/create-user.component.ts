import { Component, OnInit, inject } from "@angular/core";
import { TranslationService } from "@shared/shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/shared/page-wrapper/infrastructure/components/page-wrapper.component";
import { SectionPageWrapperComponent } from "@shared/shared/section-page-wrapper/infrastructure/components/section-page-wrapper.component";
import { FormActionsComponent } from "@shared/shared/form-actions/infrastructure/components/form-actions.component";
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
import { of } from "rxjs";
import { delay } from "rxjs/operators";
import { CreateUserService } from "../../application/services/create-user.service";
import { CreateUserRequest } from "../../domain/models/create-user.model";
import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";
import { UserRole } from "@authorization/domain/models/user-role.model";
import { getAvailableRoles } from "@authorization/domain/utils/role.utils";
import { FloatingToastService } from "@shared/shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FormSectionComponent } from "@shared/shared/form-section/infrastructure/components/form-section.component";
import { FormInputComponent } from "@shared/shared/form-input/infrastructure/components/form-input.component";
import { FORM_SECTION_ICONS } from "@shared/shared/form-section/constants/form-section-icons.constants";

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
  loading: boolean = true;
  saving: boolean = false;
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
        canCreateFolder: [false],
        canDeleteFolder: [false],
        canUploadFile: [false],
        canDeleteFile: [false],
        canSignFile: [false],
        canRollbackSign: [false],
        canAccessUsers: [false],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  isReadOnlyRole(): boolean {
    return this.userForm.get("role")?.value === USER_ROLES.USER;
  }

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.loading = false;
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
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.controls[key].markAsTouched();
      });
      return;
    }

    this.saving = true;

    const { confirmPassword, ...userData } = this.userForm.value;
    const isReadOnly = userData.role === USER_ROLES.USER;
    const userRequest: CreateUserRequest = {
      ...userData,
      canCreateFolder: isReadOnly ? false : !!userData.canCreateFolder,
      canDeleteFolder: isReadOnly ? false : !!userData.canDeleteFolder,
      canUploadFile: isReadOnly ? false : !!userData.canUploadFile,
      canDeleteFile: isReadOnly ? false : !!userData.canDeleteFile,
      canSignFile: isReadOnly ? false : !!userData.canSignFile,
      canRollbackSign: isReadOnly ? false : !!userData.canRollbackSign,
      canAccessUsers: isReadOnly ? false : !!userData.canAccessUsers,
    };

    this.createUserService.createUser(userRequest).subscribe({
      next: () => {
        this.saving = false;
        this.floatingToastService.showToast({
          status: 200,
          keyTranslation: "user.create.success",
          details: [],
        });

        of(null)
          .pipe(delay(900))
          .subscribe(() => this.router.navigate(["/users"]));
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  getRoleName(role: string): string {
    const roleNames: { [key: string]: string } = {
      [USER_ROLES.GOD]: "user.roles.god",
      [USER_ROLES.USER]: "user.roles.userFull",
    };
    return roleNames[role] || role;
  }

  getRoleDescription(role: string): string {
    const descriptions: { [key: string]: string } = {
      [USER_ROLES.GOD]: "user.roles.godDescription",
      [USER_ROLES.USER]: "user.roles.userDescription",
    };
    return descriptions[role] || "";
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  cancel(): void {
    this.router.navigate(["/users"]);
  }
}
