import { Component, OnInit, computed, inject, signal } from "@angular/core";
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
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import {
  SelectChipOption,
  SelectChipsComponent,
} from "@shared/design-system/select-chips/infrastructure/components/select-chips.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { FORM_SECTION_ICONS } from "@shared/design-system/form-section/constants/form-section-icons.constants";
import { GetPantryLocationsService } from "@nutrition/pantry/location/application/services/get-pantry-locations.service";
import { StartInventoryService } from "@nutrition/pantry/inventory/application/services/start-inventory.service";
import { PantryLocation } from "@nutrition/pantry/location/domain/models/pantry-location.model";
import { InventoryShift } from "../../domain/models/inventory-shift.model";

const WHOLE_PANTRY = "";

@Component({
  selector: "app-start-inventory",
  templateUrl: "./start-inventory.component.html",
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ContextualTranslatePipe,
    FormSectionComponent,
    FormInputComponent,
    FieldComponent,
    StackComponent,
    DateInputComponent,
    SegmentedToggleComponent,
    SelectChipsComponent,
    NoteComponent,
    PageWrapperComponent,
    SectionPageWrapperComponent,
    FormActionsComponent,
  ],
})
export class StartInventoryComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private getPantryLocationsService = inject(GetPantryLocationsService);
  private startInventoryService = inject(StartInventoryService);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/pantry/inventory";
  readonly ICONS = FORM_SECTION_ICONS;

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);
  locations = signal<PantryLocation[]>([]);

  shiftOptions = computed<SegmentedOption[]>(() => [
    { value: InventoryShift.MORNING, label: this.t("inventoryShift.morning") },
    {
      value: InventoryShift.AFTERNOON,
      label: this.t("inventoryShift.afternoon"),
    },
    { value: InventoryShift.NIGHT, label: this.t("inventoryShift.night") },
  ]);

  locationOptions = computed<SelectChipOption[]>(() => [
    { value: WHOLE_PANTRY, label: this.t("startInventory.field.wholePantry") },
    ...this.locations().map((location) => ({
      value: location.id,
      label: `${location.attributes.emoji} ${location.attributes.name}`.trim(),
    })),
  ]);

  constructor() {
    this.form = this.formBuilder.group({
      countedOn: [this.today(), [Validators.required]],
      shift: [this.suggestedShift(), [Validators.required]],
      locationId: [WHOLE_PANTRY],
      note: ["", [Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.getPantryLocationsService.getPantryLocations(1, 100).subscribe({
          next: (response) => {
            this.locations.set(response.data);
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

    this.startInventoryService
      .startInventory({
        countedOn: this.form.value.countedOn ?? this.today(),
        shift: this.form.value.shift ?? InventoryShift.MORNING,
        locationId: this.form.value.locationId || null,
        note: this.form.value.note ?? "",
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(["/inventory"]);
        },
        error: () => this.saving.set(false),
      });
  }

  cancel(): void {
    this.router.navigate(["/inventory"]);
  }

  protected t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  private today(): string {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const day = `${now.getDate()}`.padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
  }

  private suggestedShift(): InventoryShift {
    const hour = new Date().getHours();

    if (hour < 13) return InventoryShift.MORNING;
    if (hour < 20) return InventoryShift.AFTERNOON;

    return InventoryShift.NIGHT;
  }
}
