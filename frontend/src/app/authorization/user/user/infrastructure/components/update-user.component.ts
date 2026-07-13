import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SectionPageWrapperComponent } from "@shared/design-system/section-page-wrapper/infrastructure/components/section-page-wrapper.component";
import { FormActionsComponent } from "@shared/design-system/form-actions/infrastructure/components/form-actions.component";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { delay, tap } from "rxjs/operators";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FormSectionComponent } from "@shared/design-system/form-section/infrastructure/components/form-section.component";
import { FormInputComponent } from "@shared/design-system/form-input/infrastructure/components/form-input.component";
import { FormRowComponent } from "@shared/design-system/form-row/infrastructure/components/form-row.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ToggleSwitchComponent } from "@shared/design-system/toggle-switch/infrastructure/components/toggle-switch.component";
import { RolePickerComponent } from "@shared/design-system/role-picker/infrastructure/components/role-picker.component";
import { RoleOption } from "@shared/design-system/role-picker/domain/models/role-option.model";
import { FORM_SECTION_ICONS } from "@shared/design-system/form-section/constants/form-section-icons.constants";
import { UpdateUserService } from "../../application/services/update-user.service";
import { UpdateUserRequest } from "../../domain/models/update-user-request.model";
import { GetUserResponse } from "../../domain/models/get-user-response.model";
import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";
import { UserRole } from "@authorization/domain/models/user-role.model";
import {
  getAvailableRoles,
  getRoleDescriptionKey,
  getRoleFullLabelKey,
} from "@authorization/domain/utils/role.utils";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { TranslationService } from "@shared/i18n/application/services/translation.service";

@Component({
  selector: "app-update-user",
  templateUrl: "./update-user.component.html",
  imports: [
    ReactiveFormsModule,
    ContextualTranslatePipe,
    FormSectionComponent,
    FormInputComponent,
    FormRowComponent,
    FieldComponent,
    StackComponent,
    TextComponent,
    ToggleSwitchComponent,
    RolePickerComponent,
    PageWrapperComponent,
    SectionPageWrapperComponent,
    FormActionsComponent,
  ],
})
export class UpdateUserComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private updateUserService = inject(UpdateUserService);
  private translationService = inject(TranslationService);
  private floatingToastService = inject(FloatingToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly MODULE_PATH = "authorization/user/user";
  private userId: string = "";

  readonly ICONS = FORM_SECTION_ICONS;

  userForm: FormGroup;
  loading = signal(false);
  saving = signal(false);
  availableRoles: UserRole[] = getAvailableRoles(true);
  constructor() {
    this.userForm = this.formBuilder.group({
      username: ["", [Validators.required, Validators.minLength(3)]],
      email: ["", [Validators.required, Validators.email]],
      name: ["", [Validators.required]],
      lastname: ["", [Validators.required]],
      isActive: [true],
      role: [""],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) {
      this.router.navigate(["/users"]);
      return;
    }

    this.userId = id;

    this.loadUser();
  }

  loadUser(): void {
    this.loading.set(true);

    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.updateUserService.getUser(this.userId).subscribe({
          next: (response: GetUserResponse) => {
            const user = response.data;

            this.userForm.patchValue({
              username: user.attributes.username,
              email: user.attributes.email,
              name: user.attributes.name,
              lastname: user.attributes.lastname,
              isActive: user.attributes.isActive,
              role: user.attributes.role || "",
            });
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        });
      });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const formValue = this.userForm.value;
    const userData: UpdateUserRequest = {
      ...formValue,
    };

    this.updateUserService
      .updateUser(this.userId, userData)
      .pipe(
        tap(() => {
          this.saving.set(false);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "user.update.success",
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

  roleOptions(): RoleOption[] {
    const currentIsGod = this.userForm.get("role")?.value === USER_ROLES.GOD;

    return this.availableRoles
      .filter((role) => role !== USER_ROLES.GOD || currentIsGod)
      .map((role) => ({
        value: role,
        icon: role === USER_ROLES.GOD ? "shield" : "user",
        tone: role === USER_ROLES.GOD ? "accent" : "brand",
        name: this.translationService.translate(
          getRoleFullLabelKey(role),
          this.MODULE_PATH,
        ),
        description: this.translationService.translate(
          getRoleDescriptionKey(role),
          this.MODULE_PATH,
        ),
      }));
  }

  cancel(): void {
    this.router.navigate(["/users"]);
  }
}
