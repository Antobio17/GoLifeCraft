import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SkeletonFieldsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-fields.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { GetPantryLocationsService } from "@nutrition/pantry/location/application/services/get-pantry-locations.service";
import { StartInventoryService } from "@nutrition/pantry/inventory/application/services/start-inventory.service";
import { PantryLocation } from "@nutrition/pantry/location/domain/models/pantry-location.model";
import { InventoryShift } from "../../domain/models/inventory-shift.model";

@Component({
  selector: "app-start-inventory",
  templateUrl: "./start-inventory.component.html",
  imports: [
    ReactiveFormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    FieldComponent,
    StackComponent,
    TextInputComponent,
    ButtonComponent,
    DateInputComponent,
    SegmentedToggleComponent,
    NoteComponent,
    SkeletonFieldsComponent,
  ],
})
export class StartInventoryComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private getPantryLocationsService = inject(GetPantryLocationsService);
  private startInventoryService = inject(StartInventoryService);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/pantry/inventory";

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
  ]);

  stockedLocations = computed(
    () =>
      this.locations().filter(
        (location) =>
          location.attributes.articleCount + location.attributes.recipeCount >
          0,
      ).length,
  );

  scopeLabel = computed(() =>
    this.t("startInventory.scope.willCount")
      .replace("{count}", String(this.stockedLocations()))
      .replace("{total}", String(this.locations().length)),
  );

  hasNothingToCount = computed(
    () => !this.loading() && 0 === this.stockedLocations(),
  );

  constructor() {
    this.form = this.formBuilder.group({
      countedOn: [this.today(), [Validators.required]],
      shift: [this.suggestedShift(), [Validators.required]],
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

    return InventoryShift.AFTERNOON;
  }
}
