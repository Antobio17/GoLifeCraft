import { Component, OnInit, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { delay, tap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SectionPageWrapperComponent } from "@shared/design-system/section-page-wrapper/infrastructure/components/section-page-wrapper.component";
import { FormActionsComponent } from "@shared/design-system/form-actions/infrastructure/components/form-actions.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FormSectionComponent } from "@shared/design-system/form-section/infrastructure/components/form-section.component";
import { FormInputComponent } from "@shared/design-system/form-input/infrastructure/components/form-input.component";
import { FORM_SECTION_ICONS } from "@shared/design-system/form-section/constants/form-section-icons.constants";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { CreateCategoryService } from "../../application/services/create-category.service";

@Component({
  selector: "app-create-category",
  templateUrl: "./create-category.component.html",
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
export class CreateCategoryComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private createCategoryService = inject(CreateCategoryService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/catalog/category";
  readonly ICONS = FORM_SECTION_ICONS;

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);

  constructor() {
    this.form = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.loading.set(false);
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.createCategoryService
      .createCategory({ name: this.form.value.name ?? "" })
      .pipe(
        tap(() => {
          this.saving.set(false);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "category.create.success",
            details: [],
          });
        }),
        delay(900),
      )
      .subscribe({
        next: () => this.router.navigate(["/categories"]),
        error: () => this.saving.set(false),
      });
  }

  cancel(): void {
    this.router.navigate(["/categories"]);
  }
}
