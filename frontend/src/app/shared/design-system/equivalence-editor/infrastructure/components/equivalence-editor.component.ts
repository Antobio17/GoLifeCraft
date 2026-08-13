import { Component, Input, forwardRef } from "@angular/core";
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { SelectComponent } from "../../../select/infrastructure/components/select.component";
import { SegmentedToggleComponent } from "../../../segmented-toggle/infrastructure/components/segmented-toggle.component";
import { NumberInputComponent } from "../../../number-input/infrastructure/components/number-input.component";
import { SwipeToDeleteComponent } from "../../../swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { AddTileComponent } from "../../../add-tile/infrastructure/components/add-tile.component";
import { SelectOption } from "../../../select/domain/models/select-option.model";
import {
  EquivalenceEditorValue,
  EquivalenceLine,
} from "../../domain/models/equivalence-editor.model";

const BASE_UNITS = ["g", "ml"];

@Component({
  selector: "ds-equivalence-editor",
  imports: [
    FormsModule,
    IconComponent,
    SelectComponent,
    SegmentedToggleComponent,
    NumberInputComponent,
    SwipeToDeleteComponent,
    AddTileComponent,
  ],
  template: `
    <section
      class="ds-eq"
      [class.ds-eq--disabled]="disabled"
      [attr.aria-disabled]="disabled"
    >
      <header class="ds-eq__head">{{ title }}</header>

      <div class="ds-eq__base">
        <div class="ds-eq__base-copy">
          <span class="ds-eq__base-label">{{ baseLabel }}</span>
          <span class="ds-eq__base-hint">{{ baseHint }}</span>
        </div>
        <ds-segmented-toggle
          [options]="baseOptions"
          [ngModel]="value.baseUnit"
          [ngModelOptions]="{ standalone: true }"
          (ngModelChange)="onBaseUnit($event)"
        />
      </div>

      <div class="ds-eq__lines">
        <span class="ds-eq__section">{{ equivalencesLabel }}</span>

        @for (line of value.equivalences; track $index) {
          <ds-swipe-to-delete
            [radius]="12"
            [disabled]="disabled"
            [removeLabel]="removeLabel"
            (remove)="onRemove($index)"
          >
            <div class="ds-eq__row">
              <span class="ds-eq__one">1</span>
              <ds-select
                variant="bare"
                [fluid]="true"
                [options]="unitOptions"
                [placeholder]="unitPlaceholder"
                [ngModel]="line.unit"
                [ngModelOptions]="{ standalone: true }"
                (ngModelChange)="onLineUnit($index, $event)"
              />
              <span class="ds-eq__eq">=</span>
              <div class="ds-eq__qty">
                <ds-number-input
                  variant="boxed"
                  [precision]="1"
                  [min]="0"
                  [ngModel]="line.quantity"
                  [ngModelOptions]="{ standalone: true }"
                  (ngModelChange)="onLineQuantity($index, $event)"
                  [ariaLabel]="quantityLabel"
                />
              </div>
              <span class="ds-eq__unit">{{ value.baseUnit }}</span>
              <button
                type="button"
                class="ds-eq__pack"
                [disabled]="disabled"
                [class.ds-eq__pack--on]="isPack(line)"
                [attr.aria-pressed]="isPack(line)"
                [attr.aria-label]="packLabel"
                [title]="packLabel"
                (click)="onPack($index)"
              >
                <ds-icon name="package" [size]="12" />
                <span class="ds-eq__pack-text">{{ packLabel }}</span>
              </button>
            </div>
          </ds-swipe-to-delete>
        }

        @if (!disabled) {
          <ds-add-tile
            variant="dashed"
            icon="plus"
            [label]="addLabel"
            (clicked)="onAdd()"
          />
        }

        <p class="ds-eq__help">{{ hint }}</p>

        @if (packSummary) {
          <div class="ds-eq__pack-card">
            <ds-icon name="package" [size]="18" />
            <div class="ds-eq__pack-copy">
              <span class="ds-eq__pack-title">{{ packCardLabel }}</span>
              <span class="ds-eq__pack-summary">{{ packSummary }}</span>
            </div>
          </div>
        }
      </div>

      <div class="ds-eq__defaults">
        <div class="ds-eq__default">
          <span class="ds-eq__default-label">{{ recipeLabel }}</span>
          <ds-select
            variant="bare"
            [fluid]="true"
            [options]="defaultOptions"
            [ngModel]="value.recipeUnit"
            [ngModelOptions]="{ standalone: true }"
            (ngModelChange)="onRecipeUnit($event)"
          />
        </div>
        <div class="ds-eq__default">
          <span class="ds-eq__default-label">{{ diaryLabel }}</span>
          <ds-select
            variant="bare"
            [fluid]="true"
            [options]="defaultOptions"
            [ngModel]="value.diaryUnit"
            [ngModelOptions]="{ standalone: true }"
            (ngModelChange)="onDiaryUnit($event)"
          />
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-eq {
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface);
        overflow: hidden;
      }
      .ds-eq--disabled {
        opacity: 0.6;
      }
      .ds-eq--disabled .ds-eq__base,
      .ds-eq--disabled .ds-eq__lines,
      .ds-eq--disabled .ds-eq__defaults {
        pointer-events: none;
      }
      .ds-eq__head {
        padding: 0.8125rem 1rem;
        border-bottom: 1px solid var(--ds-border);
        font-size: 0.6875rem;
        font-weight: 800;
        letter-spacing: 0.07em;
        color: var(--ds-text);
      }
      .ds-eq__base {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.625rem;
        padding: 0.8125rem 1rem;
        border-bottom: 1px solid var(--ds-border);
      }
      .ds-eq__base-copy {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .ds-eq__base-label {
        font-size: 0.84375rem;
        font-weight: 700;
        color: var(--ds-text);
      }
      .ds-eq__base-hint {
        font-size: 0.65625rem;
        color: var(--ds-text-muted);
      }
      .ds-eq__base ds-segmented-toggle {
        flex: 0 0 auto;
        width: 6rem;
      }
      .ds-eq__lines {
        padding: 0.8125rem 1rem;
        border-bottom: 1px solid var(--ds-border);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .ds-eq__section {
        font-size: 0.625rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: var(--ds-text-meta);
      }
      .ds-eq__row {
        display: flex;
        align-items: center;
        gap: 0.4375rem;
        padding: 0.1875rem 2px;
        background: var(--ds-surface);
      }
      .ds-eq__one {
        font-size: 0.8125rem;
        font-weight: 800;
        color: var(--ds-text-muted);
        flex: 0 0 auto;
      }
      .ds-eq__eq {
        font-size: 0.875rem;
        font-weight: 800;
        color: var(--ds-text-muted);
        flex: 0 0 auto;
      }
      .ds-eq__qty {
        flex: 0 0 auto;
        width: 3.625rem;
      }
      .ds-eq__unit {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--ds-text-meta);
        flex: 0 0 auto;
        min-width: 1.125rem;
      }
      .ds-eq__help {
        margin: 1px 0 0;
        font-size: 0.65625rem;
        color: var(--ds-text-meta);
        line-height: 1.45;
      }
      .ds-eq__pack {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.4375rem 0.5rem;
        border: 1px solid var(--ds-border-input);
        border-radius: var(--ds-radius-md);
        background: var(--ds-surface-inset);
        color: var(--ds-text-meta);
        font-family: inherit;
        font-size: 0.65625rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        cursor: pointer;
      }
      .ds-eq__pack--on {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .ds-eq__pack-text {
        white-space: nowrap;
      }
      .ds-eq__pack-card {
        display: flex;
        align-items: center;
        gap: 0.5625rem;
        margin-top: 0.1875rem;
        padding: 0.6875rem 0.8125rem;
        border: 1px solid var(--ds-primary-soft-border);
        border-radius: var(--ds-radius-lg);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-eq__pack-copy {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }
      .ds-eq__pack-title {
        font-size: 0.59375rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .ds-eq__pack-summary {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--ds-text);
      }
      @media (max-width: 400px) {
        .ds-eq__pack-text {
          display: none;
        }
      }
      .ds-eq__defaults {
        display: flex;
        gap: 0.625rem;
        padding: 0.8125rem 1rem;
      }
      .ds-eq__default {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }
      .ds-eq__default-label {
        font-size: 0.625rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        color: var(--ds-text-meta);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EquivalenceEditorComponent),
      multi: true,
    },
  ],
})
export class EquivalenceEditorComponent implements ControlValueAccessor {
  @Input() title = "";
  @Input() baseLabel = "";
  @Input() baseHint = "";
  @Input() equivalencesLabel = "";
  @Input() addLabel = "";
  @Input() hint = "";
  @Input() recipeLabel = "";
  @Input() diaryLabel = "";
  @Input() removeLabel = "";
  @Input() quantityLabel = "";
  @Input() unitPlaceholder = "";
  @Input() packLabel = "";
  @Input() packCardLabel = "";
  @Input() unitCatalog: SelectOption[] = [];

  value: EquivalenceEditorValue = {
    baseUnit: "g",
    recipeUnit: "g",
    diaryUnit: "g",
    packUnit: null,
    equivalences: [],
  };

  disabled = false;

  private onChange: (value: EquivalenceEditorValue) => void = () => {};
  private onTouched: () => void = () => {};

  get baseOptions(): SelectOption[] {
    return BASE_UNITS.map((unit) => ({ value: unit, label: unit }));
  }

  get unitOptions(): SelectOption[] {
    const options = [...this.unitCatalog];
    const known = new Set(options.map((option) => option.value));

    this.value.equivalences.forEach((line) => {
      if ("" !== line.unit && !known.has(line.unit)) {
        options.push({ value: line.unit, label: line.unit });
        known.add(line.unit);
      }
    });

    return options;
  }

  get defaultOptions(): SelectOption[] {
    const options: SelectOption[] = [
      { value: this.value.baseUnit, label: this.value.baseUnit },
    ];

    this.value.equivalences.forEach((line) => {
      if ("" !== line.unit) {
        options.push({ value: line.unit, label: this.labelOf(line.unit) });
      }
    });

    return options;
  }

  get packSummary(): string | null {
    const line = this.value.equivalences.find((item) => this.isPack(item));
    if (undefined === line || null === line.quantity) {
      return null;
    }

    return `1 ${this.labelOf(line.unit)} = ${line.quantity} ${this.value.baseUnit}`;
  }

  isPack(line: EquivalenceLine): boolean {
    return "" !== line.unit && line.unit === this.value.packUnit;
  }

  private labelOf(key: string): string {
    return (
      this.unitCatalog.find((option) => option.value === key)?.label ?? key
    );
  }

  writeValue(value: EquivalenceEditorValue | null): void {
    this.value = this.normalize(value);
  }

  registerOnChange(fn: (value: EquivalenceEditorValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onBaseUnit(baseUnit: string): void {
    const previousBase = this.value.baseUnit;
    const recipeUnit =
      this.value.recipeUnit === previousBase ? baseUnit : this.value.recipeUnit;
    const diaryUnit =
      this.value.diaryUnit === previousBase ? baseUnit : this.value.diaryUnit;

    this.emit({ ...this.value, baseUnit, recipeUnit, diaryUnit });
  }

  onLineUnit(index: number, unit: string): void {
    const previousUnit = this.value.equivalences[index]?.unit;
    const packUnit =
      this.value.packUnit === previousUnit ? unit : this.value.packUnit;

    this.emit({
      ...this.value,
      packUnit,
      equivalences: this.mapLine(index, (line) => ({ ...line, unit })),
    });
  }

  onPack(index: number): void {
    const line = this.value.equivalences[index];
    if (undefined === line || "" === line.unit) {
      return;
    }

    this.emit({
      ...this.value,
      packUnit: this.isPack(line) ? null : line.unit,
    });
  }

  onLineQuantity(index: number, quantity: number | null): void {
    this.emit({
      ...this.value,
      equivalences: this.mapLine(index, (line) => ({ ...line, quantity })),
    });
  }

  onAdd(): void {
    this.emit({
      ...this.value,
      equivalences: [...this.value.equivalences, { unit: "", quantity: null }],
    });
  }

  onRemove(index: number): void {
    const equivalences = this.value.equivalences.filter((_, i) => i !== index);
    const removedUnit = this.value.equivalences[index]?.unit;
    const recipeUnit =
      this.value.recipeUnit === removedUnit
        ? this.value.baseUnit
        : this.value.recipeUnit;
    const diaryUnit =
      this.value.diaryUnit === removedUnit
        ? this.value.baseUnit
        : this.value.diaryUnit;
    const packUnit =
      this.value.packUnit === removedUnit ? null : this.value.packUnit;

    this.emit({
      ...this.value,
      equivalences,
      recipeUnit,
      diaryUnit,
      packUnit,
    });
  }

  onRecipeUnit(recipeUnit: string): void {
    this.emit({ ...this.value, recipeUnit });
  }

  onDiaryUnit(diaryUnit: string): void {
    this.emit({ ...this.value, diaryUnit });
  }

  private emit(value: EquivalenceEditorValue): void {
    if (this.disabled) {
      return;
    }

    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  private mapLine(
    index: number,
    project: (line: EquivalenceLine) => EquivalenceLine,
  ): EquivalenceLine[] {
    return this.value.equivalences.map((line, i) =>
      i === index ? project(line) : line,
    );
  }

  private normalize(
    value: EquivalenceEditorValue | null,
  ): EquivalenceEditorValue {
    const baseUnit = value?.baseUnit ?? "g";

    return {
      baseUnit,
      recipeUnit: value?.recipeUnit ?? baseUnit,
      diaryUnit: value?.diaryUnit ?? baseUnit,
      packUnit: value?.packUnit ?? null,
      equivalences: (value?.equivalences ?? []).map((line) => ({
        unit: line.unit ?? "",
        quantity: line.quantity ?? null,
      })),
    };
  }
}
