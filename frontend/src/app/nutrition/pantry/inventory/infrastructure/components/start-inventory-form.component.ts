import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { filter, map, switchMap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { SkeletonFieldsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-fields.component";
import { DateFieldComponent } from "@shared/design-system/date-field/infrastructure/components/date-field.component";
import { DateFieldCalendarService } from "@shared/design-system/date-field/application/services/date-field-calendar.service";
import { DateFieldFormatService } from "@shared/design-system/date-field/application/services/date-field-format.service";
import { WeekStripComponent } from "@shared/design-system/week-strip/infrastructure/components/week-strip.component";
import { WeekStripDay } from "@shared/design-system/week-strip/domain/models/week-strip-day.model";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { DisclosureComponent } from "@shared/design-system/disclosure/infrastructure/components/disclosure.component";
import { GetPantryLocationsService } from "@nutrition/pantry/location/application/services/get-pantry-locations.service";
import { StartInventoryService } from "@nutrition/pantry/inventory/application/services/start-inventory.service";
import { GetInventoriesService } from "@nutrition/pantry/inventory/application/services/get-inventories.service";
import { PantryLocation } from "@nutrition/pantry/location/domain/models/pantry-location.model";
import { InventoryShift } from "../../domain/models/inventory-shift.model";
import { InventoryStatus } from "../../domain/models/inventory-status.model";

@Component({
  selector: "app-start-inventory-form",
  templateUrl: "./start-inventory-form.component.html",
  providers: [DateFieldFormatService, DateFieldCalendarService],
  imports: [
    ReactiveFormsModule,
    ContextualTranslatePipe,
    FieldComponent,
    StackComponent,
    TextInputComponent,
    SkeletonFieldsComponent,
    DateFieldComponent,
    WeekStripComponent,
    SegmentedToggleComponent,
    NoteComponent,
    DisclosureComponent,
  ],
})
export class StartInventoryFormComponent {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private calendar = inject(DateFieldCalendarService);
  private getPantryLocationsService = inject(GetPantryLocationsService);
  private startInventoryService = inject(StartInventoryService);
  private getInventoriesService = inject(GetInventoriesService);

  private readonly MODULE_PATH = "nutrition/pantry/inventory";

  active = input(true);
  started = output<string | null>();

  loading = signal(true);
  saving = signal(false);
  noteOpen = signal(false);
  locations = signal<PantryLocation[]>([]);
  private todayIso = signal(this.calendar.todayIso());

  form = this.formBuilder.group({
    countedOn: [this.calendar.todayIso(), [Validators.required]],
    shift: [this.suggestedShift(), [Validators.required]],
    note: ["", [Validators.maxLength(255)]],
  });

  otherDate = new FormControl("", { nonNullable: true });

  countedOn = signal(this.calendar.todayIso());

  weekDays = computed<WeekStripDay[]>(() =>
    this.calendar.weekDays(this.todayIso(), this.todayIso()),
  );

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

  scopeLabel = computed(() => {
    if (this.loading()) return "";

    return this.t("startInventory.scope.willCount")
      .replace("{count}", String(this.stockedLocations()))
      .replace("{total}", String(this.locations().length));
  });

  hasNothingToCount = computed(
    () => !this.loading() && 0 === this.stockedLocations(),
  );

  canSubmit = computed(
    () => !this.loading() && !this.saving() && !this.hasNothingToCount(),
  );

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

    this.form.controls.countedOn.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.countedOn.set(value ?? ""));

    this.otherDate.valueChanges
      .pipe(
        filter((value) => "" !== value),
        takeUntilDestroyed(),
      )
      .subscribe((value) => this.form.controls.countedOn.setValue(value));

    toObservable(this.active)
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.prepare();
          return this.getPantryLocationsService.getPantryLocations(1, 100);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (response) => {
          this.locations.set(response.data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onDay(date: string): void {
    this.otherDate.setValue("", { emitEvent: false });
    this.form.controls.countedOn.setValue(date);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.canSubmit()) return;

    this.saving.set(true);

    this.startInventoryService
      .startInventory({
        countedOn: this.form.value.countedOn ?? this.calendar.todayIso(),
        shift: this.form.value.shift ?? InventoryShift.MORNING,
        note: this.form.value.note ?? "",
      })
      .pipe(
        switchMap(() =>
          this.getInventoriesService.getInventories(
            1,
            1,
            undefined,
            InventoryStatus.DRAFT,
          ),
        ),
        map((response) => response.data[0]?.id ?? null),
      )
      .subscribe({
        next: (id) => {
          this.saving.set(false);
          this.started.emit(id);
        },
        error: () => this.saving.set(false),
      });
  }

  protected t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  private prepare(): void {
    const today = this.calendar.todayIso();

    this.todayIso.set(today);
    this.loading.set(true);
    this.saving.set(false);
    this.noteOpen.set(false);
    this.otherDate.setValue("", { emitEvent: false });
    this.form.reset({
      countedOn: today,
      shift: this.suggestedShift(),
      note: "",
    });
  }

  private suggestedShift(): InventoryShift {
    const hour = new Date().getHours();

    if (hour < 13) return InventoryShift.MORNING;

    return InventoryShift.AFTERNOON;
  }
}
