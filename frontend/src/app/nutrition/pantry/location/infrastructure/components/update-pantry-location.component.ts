import { Component, OnInit, inject, input, signal } from "@angular/core";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SectionPageWrapperComponent } from "@shared/design-system/section-page-wrapper/infrastructure/components/section-page-wrapper.component";
import { FormActionsComponent } from "@shared/design-system/form-actions/infrastructure/components/form-actions.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FormSectionComponent } from "@shared/design-system/form-section/infrastructure/components/form-section.component";
import { FormInputComponent } from "@shared/design-system/form-input/infrastructure/components/form-input.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { EmojiPickerComponent } from "@shared/design-system/emoji-picker/infrastructure/components/emoji-picker.component";
import { FORM_SECTION_ICONS } from "@shared/design-system/form-section/constants/form-section-icons.constants";
import { GetPantryLocationService } from "@nutrition/pantry/location/application/services/get-pantry-location.service";
import { UpdatePantryLocationService } from "@nutrition/pantry/location/application/services/update-pantry-location.service";
import { PantryLocationEmojiCatalogService } from "@nutrition/pantry/location/application/services/pantry-location-emoji-catalog.service";
import { GetPantryLocationResponse } from "../../domain/models/get-pantry-location-response.model";

@Component({
  selector: "app-update-pantry-location",
  templateUrl: "./update-pantry-location.component.html",
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ContextualTranslatePipe,
    FormSectionComponent,
    FormInputComponent,
    FieldComponent,
    EmojiPickerComponent,
    PageWrapperComponent,
    SectionPageWrapperComponent,
    FormActionsComponent,
  ],
})
export class UpdatePantryLocationComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private getPantryLocationService = inject(GetPantryLocationService);
  private updatePantryLocationService = inject(UpdatePantryLocationService);
  private emojiCatalog = inject(PantryLocationEmojiCatalogService);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/pantry/location";
  readonly ICONS = FORM_SECTION_ICONS;
  readonly emojiGroups = this.emojiCatalog.groups();
  readonly fallbackEmoji = "📦";
  readonly id = input.required<string>();

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);

  constructor() {
    this.form = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(60)]],
      emoji: [""],
      description: ["", [Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.getPantryLocationService.getPantryLocation(this.id()).subscribe({
          next: (response: GetPantryLocationResponse) => {
            this.form.patchValue({
              name: response.data.attributes.name,
              emoji: response.data.attributes.emoji,
              description: response.data.attributes.description,
            });
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.updatePantryLocationService
      .updatePantryLocation(this.id(), {
        name: this.form.value.name ?? "",
        emoji: this.form.value.emoji ?? "",
        description: this.form.value.description ?? "",
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(["/locations"]);
        },
        error: () => this.saving.set(false),
      });
  }

  cancel(): void {
    this.router.navigate(["/locations"]);
  }
}
