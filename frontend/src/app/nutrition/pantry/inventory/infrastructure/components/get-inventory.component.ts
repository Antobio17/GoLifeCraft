import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { toObservable, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { switchMap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { MacroBadgesComponent } from "@shared/design-system/macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";
import { ProgressBarComponent } from "@shared/design-system/progress-bar/infrastructure/components/progress-bar.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { LocationCardComponent } from "@shared/design-system/location-card/infrastructure/components/location-card.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { GetInventoryService } from "@nutrition/pantry/inventory/application/services/get-inventory.service";
import { ValidateInventoryService } from "@nutrition/pantry/inventory/application/services/validate-inventory.service";
import { DiscardInventoryService } from "@nutrition/pantry/inventory/application/services/discard-inventory.service";
import { ReopenInventoryService } from "@nutrition/pantry/inventory/application/services/reopen-inventory.service";
import { RescheduleInventoryService } from "@nutrition/pantry/inventory/application/services/reschedule-inventory.service";
import { InventoryViewService } from "@nutrition/pantry/inventory/application/services/inventory-view.service";
import { InventoryDetailAttributes } from "../../domain/models/inventory-detail-attributes.model";
import { InventoryLocationRow } from "../../domain/models/inventory-location-row.model";
import { InventoryStatus } from "../../domain/models/inventory-status.model";
import { InventoryShift } from "../../domain/models/inventory-shift.model";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";

@Component({
  selector: "app-get-inventory",
  templateUrl: "./get-inventory.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    SplitViewComponent,
    StackComponent,
    GridComponent,
    CardComponent,
    TextComponent,
    MacroBadgesComponent,
    ProgressBarComponent,
    ButtonComponent,
    LocationCardComponent,
    EmptyStateComponent,
    SkeletonComponent,
    SkeletonScreenHeaderComponent,
    SectionHeaderComponent,
    ConfirmActionModalComponent,
    ModalSheetComponent,
    DateInputComponent,
    SegmentedToggleComponent,
    FieldComponent,
    RevealDirective,
  ],
})
export class GetInventoryComponent {
  private translationService = inject(TranslationService);
  private backNavigation = inject(BackNavigationService);
  private getInventoryService = inject(GetInventoryService);
  private validateInventoryService = inject(ValidateInventoryService);
  private discardInventoryService = inject(DiscardInventoryService);
  private reopenInventoryService = inject(ReopenInventoryService);
  private rescheduleInventoryService = inject(RescheduleInventoryService);
  private inventoryView = inject(InventoryViewService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/pantry/inventory";

  readonly id = input.required<string>();

  attributes = signal<InventoryDetailAttributes | null>(null);
  loading = signal(true);
  validating = signal(false);
  reopening = signal(false);
  discarding = signal(false);
  showDiscardModal = signal(false);
  showScheduleSheet = signal(false);
  rescheduling = signal(false);
  scheduleCountedOn = signal("");
  scheduleShift = signal<InventoryShift>(InventoryShift.MORNING);

  shiftOptions = computed<SegmentedOption[]>(() => [
    { value: InventoryShift.MORNING, label: this.t("inventoryShift.morning") },
    {
      value: InventoryShift.AFTERNOON,
      label: this.t("inventoryShift.afternoon"),
    },
  ]);

  scheduleChanged = computed(() => {
    const attributes = this.attributes();

    if (null === attributes || "" === this.scheduleCountedOn()) return false;

    return (
      this.scheduleCountedOn() !== attributes.countedOn.slice(0, 10) ||
      this.scheduleShift() !== attributes.shift
    );
  });

  isDraft = computed(() => InventoryStatus.DRAFT === this.attributes()?.status);

  dateLabel = computed(() => {
    const attributes = this.attributes();

    if (null === attributes) return "";

    return this.inventoryView.dateLabel(attributes.countedOn);
  });

  headerSubtitle = computed(() => {
    const attributes = this.attributes();

    if (null === attributes) return "";

    return [
      this.t(this.inventoryView.shiftKey(attributes.shift)),
      this.t(this.inventoryView.statusKey(attributes.status)),
      this.t("getInventory.locationsCounted").replace(
        "{count}",
        String(attributes.totalLocations),
      ),
    ].join(" · ");
  });

  summaryBadges = computed<MacroBadge[]>(() => {
    const attributes = this.attributes();

    if (null === attributes) return [];

    return [
      {
        label: `${attributes.countedItems}/${attributes.totalItems}`,
        value: this.t("getInventory.stat.counted"),
      },
      {
        label: `${attributes.adjustedItems}`,
        value: this.t("getInventory.stat.adjusted"),
      },
    ];
  });

  progressPercent = computed(() => {
    const attributes = this.attributes();

    if (null === attributes || 0 === attributes.totalItems) return 0;

    return Math.round((attributes.countedItems / attributes.totalItems) * 100);
  });

  hint = computed(() =>
    this.isDraft()
      ? this.t("getInventory.draftHint")
      : this.t("getInventory.validatedHint"),
  );

  locationRows = computed<InventoryLocationRow[]>(() =>
    (this.attributes()?.locations ?? []).map((location) =>
      this.inventoryView.locationRowOf(location, (key) => this.t(key)),
    ),
  );

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((inventoryId) => {
          this.loading.set(true);

          return this.getInventoryService.getInventory(inventoryId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.translationService
            .loadModuleTranslations(this.MODULE_PATH)
            .then(() => {
              this.attributes.set(response.data.attributes);
              this.loading.set(false);
            });
        },
        error: () => this.loading.set(false),
      });
  }

  protected t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  onOpen(row: InventoryLocationRow): void {
    this.router.navigate([
      "/inventory",
      this.id(),
      "locations",
      row.location.id,
    ]);
  }

  onValidate(): void {
    this.validating.set(true);

    this.validateInventoryService.validateInventory(this.id()).subscribe({
      next: () => {
        this.validating.set(false);
        this.router.navigate(["/inventory"]);
      },
      error: () => this.validating.set(false),
    });
  }

  onReopen(): void {
    this.reopening.set(true);

    this.reopenInventoryService.reopenInventory(this.id()).subscribe({
      next: () => this.refresh(),
      error: () => this.reopening.set(false),
    });
  }

  onEditSchedule(): void {
    const attributes = this.attributes();

    if (null === attributes) return;

    this.scheduleCountedOn.set(attributes.countedOn.slice(0, 10));
    this.scheduleShift.set(attributes.shift);
    this.showScheduleSheet.set(true);
  }

  onCloseSchedule(): void {
    this.showScheduleSheet.set(false);
  }

  onSaveSchedule(): void {
    if (!this.scheduleChanged()) return;

    this.rescheduling.set(true);

    this.rescheduleInventoryService
      .rescheduleInventory(this.id(), {
        countedOn: this.scheduleCountedOn(),
        shift: this.scheduleShift(),
      })
      .subscribe({
        next: () => {
          this.attributes.update((attributes) =>
            null === attributes
              ? attributes
              : {
                  ...attributes,
                  countedOn: this.scheduleCountedOn(),
                  shift: this.scheduleShift(),
                },
          );
          this.rescheduling.set(false);
          this.showScheduleSheet.set(false);
        },
        error: () => this.rescheduling.set(false),
      });
  }

  onDiscard(): void {
    this.showDiscardModal.set(true);
  }

  onCancelDiscard(): void {
    this.showDiscardModal.set(false);
  }

  onConfirmDiscard(): void {
    this.discarding.set(true);

    this.discardInventoryService.discardInventory(this.id()).subscribe({
      next: () => {
        this.discarding.set(false);
        this.showDiscardModal.set(false);
        this.backNavigation.leave(["/inventory"]);
      },
      error: () => {
        this.discarding.set(false);
        this.showDiscardModal.set(false);
      },
    });
  }

  back(): void {
    this.backNavigation.back(["/inventory"]);
  }

  private refresh(): void {
    this.getInventoryService.getInventory(this.id()).subscribe({
      next: (response) => {
        this.attributes.set(response.data.attributes);
        this.reopening.set(false);
      },
      error: () => this.reopening.set(false),
    });
  }
}
