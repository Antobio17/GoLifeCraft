import { Component, computed, inject, input, signal } from "@angular/core";
import { Router } from "@angular/router";
import { toObservable, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DestroyRef } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { StatComponent } from "@shared/design-system/stat/infrastructure/components/stat.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { GetInventoryService } from "@nutrition/pantry/inventory/application/services/get-inventory.service";
import { CountInventoryLineService } from "@nutrition/pantry/inventory/application/services/count-inventory-line.service";
import { ValidateInventoryService } from "@nutrition/pantry/inventory/application/services/validate-inventory.service";
import { DiscardInventoryService } from "@nutrition/pantry/inventory/application/services/discard-inventory.service";
import { InventoryViewService } from "@nutrition/pantry/inventory/application/services/inventory-view.service";
import { InventoryDetailAttributes } from "../../domain/models/inventory-detail-attributes.model";
import { InventoryLine } from "../../domain/models/inventory-line.model";
import { InventoryLineRow } from "../../domain/models/inventory-line-row.model";
import { InventoryStatus } from "../../domain/models/inventory-status.model";

@Component({
  selector: "app-get-inventory",
  templateUrl: "./get-inventory.component.html",
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    StackComponent,
    CardComponent,
    HeadingComponent,
    TextComponent,
    ChipComponent,
    StatComponent,
    ButtonComponent,
    NumberInputComponent,
    NoteComponent,
    EmptyStateComponent,
    SkeletonComponent,
    ConfirmActionModalComponent,
  ],
})
export class GetInventoryComponent {
  private translationService = inject(TranslationService);
  private getInventoryService = inject(GetInventoryService);
  private countInventoryLineService = inject(CountInventoryLineService);
  private validateInventoryService = inject(ValidateInventoryService);
  private discardInventoryService = inject(DiscardInventoryService);
  private inventoryView = inject(InventoryViewService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/pantry/inventory";

  readonly id = input.required<string>();

  attributes = signal<InventoryDetailAttributes | null>(null);
  loading = signal(true);
  validating = signal(false);
  discarding = signal(false);
  showDiscardModal = signal(false);
  form = signal<FormGroup>(new FormGroup({}));

  isDraft = computed(() => InventoryStatus.DRAFT === this.attributes()?.status);

  shiftLabel = computed(() => {
    const attributes = this.attributes();

    if (null === attributes) return "";

    return this.t(this.inventoryView.shiftKey(attributes.shift));
  });

  statusLabel = computed(() => {
    const attributes = this.attributes();

    if (null === attributes) return "";

    return this.t(this.inventoryView.statusKey(attributes.status));
  });

  locationLabel = computed(
    () => this.attributes()?.locationName ?? this.t("getInventory.wholePantry"),
  );

  progressLabel = computed(() => {
    const attributes = this.attributes();

    if (null === attributes) return "";

    return `${attributes.countedLines}/${attributes.totalLines}`;
  });

  rows = computed<InventoryLineRow[]>(() =>
    (this.attributes()?.lines ?? []).map((line) =>
      this.inventoryView.rowOf(line, (quantity, unit) =>
        this.t("getInventory.expected")
          .replace("{quantity}", quantity)
          .replace("{unit}", unit),
      ),
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
              this.buildForm(response.data.attributes.lines);
              this.loading.set(false);
            });
        },
        error: () => this.loading.set(false),
      });
  }

  protected t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  onClear(row: InventoryLineRow): void {
    this.form().controls[row.line.id]?.setValue(row.line.expectedQuantity, {
      emitEvent: false,
    });
    this.save(row.line.id, null);
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
        this.router.navigate(["/inventory"]);
      },
      error: () => {
        this.discarding.set(false);
        this.showDiscardModal.set(false);
      },
    });
  }

  back(): void {
    this.router.navigate(["/inventory"]);
  }

  private buildForm(lines: InventoryLine[]): void {
    const group = new FormGroup({});

    for (const line of lines) {
      const control = new FormControl<number>(
        line.countedQuantity ?? line.expectedQuantity,
        { nonNullable: true },
      );

      if (!this.isDraft()) {
        control.disable({ emitEvent: false });
      }

      control.valueChanges
        .pipe(
          debounceTime(600),
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((value) => this.save(line.id, value));

      group.addControl(line.id, control);
    }

    this.form.set(group);
  }

  private save(lineId: string, countedQuantity: number | null): void {
    this.countInventoryLineService
      .countInventoryLine(this.id(), lineId, { countedQuantity })
      .subscribe({
        next: () => this.refresh(),
      });
  }

  private refresh(): void {
    this.getInventoryService.getInventory(this.id()).subscribe({
      next: (response) => this.attributes.set(response.data.attributes),
    });
  }
}
