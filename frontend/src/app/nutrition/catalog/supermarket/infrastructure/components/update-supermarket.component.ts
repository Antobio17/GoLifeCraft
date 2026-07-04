import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { of } from "rxjs";
import { delay } from "rxjs/operators";
import { TranslationService } from "@shared/shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/shared/page-wrapper/infrastructure/components/page-wrapper.component";
import { SectionPageWrapperComponent } from "@shared/shared/section-page-wrapper/infrastructure/components/section-page-wrapper.component";
import { FormActionsComponent } from "@shared/shared/form-actions/infrastructure/components/form-actions.component";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FormSectionComponent } from "@shared/shared/form-section/infrastructure/components/form-section.component";
import { FormInputComponent } from "@shared/shared/form-input/infrastructure/components/form-input.component";
import { FORM_SECTION_ICONS } from "@shared/shared/form-section/constants/form-section-icons.constants";
import { FloatingToastService } from "@shared/shared/floating-toasts/application/services/floating-toast.service";
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
  loading = true;
  saving = false;
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
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          },
        });
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) =>
        this.form.controls[key].markAsTouched(),
      );
      return;
    }

    this.saving = true;

    this.updateSupermarketService
      .updateSupermarket(this.id, { name: this.form.value.name ?? "" })
      .subscribe({
        next: () => {
          this.saving = false;
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "supermarket.update.success",
            details: [],
          });

          of(null)
            .pipe(delay(900))
            .subscribe(() => this.router.navigate(["/supermarkets"]));
        },
        error: () => {
          this.saving = false;
        },
      });
  }

  cancel(): void {
    this.router.navigate(["/supermarkets"]);
  }
}
