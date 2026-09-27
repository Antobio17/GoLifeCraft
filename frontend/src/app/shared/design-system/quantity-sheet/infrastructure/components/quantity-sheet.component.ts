import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subscription, timer } from "rxjs";
import { ModalSheetComponent } from "../../../modal-sheet/infrastructure/components/modal-sheet.component";
import { SegmentedToggleComponent } from "../../../segmented-toggle/infrastructure/components/segmented-toggle.component";
import { ScaleRulerComponent } from "../../../scale-ruler/infrastructure/components/scale-ruler.component";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { SelectOption } from "../../../select/domain/models/select-option.model";
import { QuantityMacros } from "../../domain/models/quantity-macros.model";
import { QuantityDraft } from "../../domain/models/quantity-draft.model";
import { QuantityScaleService } from "../../application/services/quantity-scale.service";

@Component({
  selector: "ds-quantity-sheet",
  imports: [
    FormsModule,
    ModalSheetComponent,
    SegmentedToggleComponent,
    ScaleRulerComponent,
    IconComponent,
  ],
  templateUrl: "./quantity-sheet.component.html",
  styleUrls: ["./quantity-sheet.component.css"],
})
export class QuantitySheetComponent {
  private scaleService = inject(QuantityScaleService);
  private repeat: Subscription | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopRepeat());
  }

  open = input(false);
  title = input("");
  quantity = input(0);
  unit = input("");
  unitLabel = input("");
  unitOptions = input<SelectOption[]>([]);
  unitFactors = input<Record<string, number>>({});
  macros = input<QuantityMacros | null>(null);
  closeLabel = input("");
  confirmLabel = input("");
  rulerAriaLabel = input("");
  quantityAriaLabel = input("");
  decrementLabel = input("");
  incrementLabel = input("");
  kcalLabel = input("kcal");
  proteinLabel = input("P");
  fatLabel = input("G");
  carbsLabel = input("H");

  closed = output<void>();
  saved = output<QuantityDraft>();

  private seed = computed(() => ({
    open: this.open(),
    quantity: this.quantity(),
    unit: this.unit(),
  }));

  draftText = linkedSignal({
    source: this.seed,
    computation: (seed) => this.format(seed.quantity),
  });

  draftUnit = linkedSignal({
    source: this.seed,
    computation: (seed) => seed.unit,
  });

  draftQuantity = computed(() => this.parse(this.draftText()));

  inputWidth = computed(() => Math.max(1.5, this.draftText().length));

  canDecrease = computed(() =>
    this.scaleService.canDecrease(this.draftQuantity() ?? 0),
  );

  valid = computed(() => {
    const quantity = this.draftQuantity();

    return null !== quantity && quantity > 0;
  });

  changed = computed(
    () =>
      this.draftQuantity() !== this.quantity() ||
      this.draftUnit() !== this.unit(),
  );

  draftUnitLabel = computed(() => {
    const option = this.unitOptions().find(
      (candidate) => candidate.value === this.draftUnit(),
    );

    return option?.label ?? this.unitLabel();
  });

  unitChoices = computed(() =>
    this.unitOptions().length > 1 ? this.unitOptions() : [],
  );

  scale = computed(() =>
    this.scaleService.scale(this.draftUnit(), this.quantity()),
  );

  preview = computed(() => {
    const macros = this.macros();
    const ratio = this.ratio();
    if (null === macros || null === ratio) return [];

    return [
      {
        key: "kcal",
        label: this.kcalLabel(),
        value: this.format(Math.round(macros.calories * ratio)),
      },
      {
        key: "protein",
        label: this.proteinLabel(),
        value: `${this.format(macros.protein * ratio, 1)} g`,
      },
      {
        key: "fat",
        label: this.fatLabel(),
        value: `${this.format(macros.fat * ratio, 1)} g`,
      },
      {
        key: "carbs",
        label: this.carbsLabel(),
        value: `${this.format(macros.carbs * ratio, 1)} g`,
      },
    ];
  });

  onText(event: Event): void {
    this.draftText.set((event.target as HTMLInputElement).value);
  }

  onUnit(unit: string): void {
    this.draftUnit.set(String(unit));
  }

  onRuler(value: number): void {
    this.draftText.set(this.format(value));
  }

  onStepKey(event: MouseEvent, direction: 1 | -1): void {
    if (0 !== event.detail) return;

    this.nudge(direction);
  }

  startRepeat(event: PointerEvent, direction: 1 | -1): void {
    if (0 !== event.button) return;

    event.preventDefault();
    this.stopRepeat();
    this.nudge(direction);
    this.repeat = timer(380, 70).subscribe(() => this.nudge(direction));
  }

  stopRepeat(): void {
    this.repeat?.unsubscribe();
    this.repeat = null;
  }

  private nudge(direction: 1 | -1): void {
    const current = this.draftQuantity() ?? 0;
    const next = this.scaleService.nudge(current, direction);
    if (next === current) {
      this.stopRepeat();

      return;
    }

    this.draftText.set(this.format(next));
  }

  onEnter(event: Event): void {
    (event.target as HTMLInputElement).blur();
    this.save();
  }

  save(): void {
    const quantity = this.draftQuantity();
    if (null === quantity || quantity <= 0) return;

    if (quantity === this.quantity() && this.draftUnit() === this.unit()) {
      this.closed.emit();

      return;
    }

    this.saved.emit({
      quantity: this.scaleService.round(quantity),
      unit: this.draftUnit(),
    });
  }

  private ratio(): number | null {
    const quantity = this.draftQuantity();
    const original = this.quantity();
    if (null === quantity || original <= 0) return null;

    if (this.draftUnit() === this.unit()) return quantity / original;

    const from = this.unitFactors()[this.unit()];
    const to = this.unitFactors()[this.draftUnit()];
    if (!from || !to) return null;

    return (quantity * to) / (original * from);
  }

  private parse(text: string): number | null {
    const parsed = Number.parseFloat(text.replace(",", "."));

    return Number.isFinite(parsed) ? parsed : null;
  }

  private format(value: number, digits = 2): string {
    return new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: digits,
      useGrouping: false,
    }).format(value);
  }
}
