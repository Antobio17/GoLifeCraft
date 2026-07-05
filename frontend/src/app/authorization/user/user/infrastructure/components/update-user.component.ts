import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SectionPageWrapperComponent } from "@shared/design-system/section-page-wrapper/infrastructure/components/section-page-wrapper.component";
import { FormActionsComponent } from "@shared/design-system/form-actions/infrastructure/components/form-actions.component";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { of } from "rxjs";
import { delay } from "rxjs/operators";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FormSectionComponent } from "@shared/design-system/form-section/infrastructure/components/form-section.component";
import { FormInputComponent } from "@shared/design-system/form-input/infrastructure/components/form-input.component";
import { FORM_SECTION_ICONS } from "@shared/design-system/form-section/constants/form-section-icons.constants";
import { UpdateUserService } from "../../application/services/update-user.service";
import { UpdateUserRequest } from "../../domain/models/update-user-request.model";
import { GetUserResponse } from "../../domain/models/get-user-response.model";
import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";
import { UserRole } from "@authorization/domain/models/user-role.model";
import { getAvailableRoles } from "@authorization/domain/utils/role.utils";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { TranslationService } from "@shared/i18n/application/services/translation.service";

@Component({
  selector: "app-update-user",
  templateUrl: "./update-user.component.html",
  styleUrls: ["./update-user.component.css"],
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
  loading: boolean = false;
  saving: boolean = false;
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
    this.loading = true;

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
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          },
        });
      });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.controls[key].markAsTouched();
      });
      return;
    }

    this.saving = true;

    const formValue = this.userForm.value;
    const userData: UpdateUserRequest = {
      ...formValue,
    };

    this.updateUserService.updateUser(this.userId, userData).subscribe({
      next: () => {
        this.saving = false;
        this.floatingToastService.showToast({
          status: 200,
          keyTranslation: "user.update.success",
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

  cancel(): void {
    this.router.navigate(["/users"]);
  }
}
