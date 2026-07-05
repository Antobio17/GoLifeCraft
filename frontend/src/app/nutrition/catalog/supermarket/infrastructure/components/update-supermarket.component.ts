import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
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
import { GetSupermarketService } from "../../application/services/get-supermarket.service";
import { UpdateSupermarketService } from "../../application/services/update-supermarket.service";
import { GetSupermarketResponse } from "../../domain/models/get-supermarket-response.model";

@Component({
  selector: "app-update-supermarket",
  templateUrl: "./update-supermarket.component.html",
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
export class UpdateSupermarketComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private getSupermarketService = inject(GetSupermarketService);
  private updateSupermarketService = inject(UpdateSupermarketService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly MODULE_PATH = "nutrition/catalog/supermarket";
  readonly ICONS = FORM_SECTION_ICONS;

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);
  private id = "";

  constructor() {
    this.form = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get("id") ?? "";

    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.getSupermarketService.getSupermarket(this.id).subscribe({
          next: (response: GetSupermarketResponse) => {
            this.form.patchValue({ name: response.data.attributes.name });
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        });
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.updateSupermarketService
      .updateSupermarket(this.id, { name: this.form.value.name ?? "" })
      .pipe(
        tap(() => {
          this.saving.set(false);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "supermarket.update.success",
            details: [],
          });
        }),
        delay(900),
      )
      .subscribe({
        next: () => this.router.navigate(["/supermarkets"]),
        error: () => this.saving.set(false),
      });
  }

  cancel(): void {
    this.router.navigate(["/supermarkets"]);
  }
}
