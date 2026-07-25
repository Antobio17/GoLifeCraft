import { Component, Input, forwardRef } from "@angular/core";
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { SelectComponent } from "../../../select/infrastructure/components/select.component";
import { SegmentedToggleComponent } from "../../../segmented-toggle/infrastructure/components/segmented-toggle.component";
import { NumberInputComponent } from "../../../number-input/infrastructure/components/number-input.component";
import { IconButtonComponent } from "../../../icon-button/infrastructure/components/icon-button.component";
import { AddTileComponent } from "../../../add-tile/infrastructure/components/add-tile.component";
import { SelectOption } from "../../../select/domain/models/select-option.model";
import {
  EquivalenceEditorValue,
  EquivalenceLine,
} from "../../domain/models/equivalence-editor.model";

const BASE_UNITS = ["g", "ml"];

@Component({
  selector: "ds-equivalence-editor",
  standalone: true,
  imports: [
    FormsModule,
    SelectComponent,
    SegmentedToggleComponent,
    NumberInputComponent,
    IconButtonComponent,
    AddTileComponent,
  ],
  template: `
    <section class="ds-eq">
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
            <ds-icon-button
              icon="trash"
              variant="danger"
              [iconSize]="15"
              [ariaLabel]="removeLabel"
              (clicked)="onRemove($index)"
            />
          </div>
        }

        <ds-add-tile
          variant="dashed"
          icon="plus"
          [label]="addLabel"
          (clicked)="onAdd()"
        />

        <p class="ds-eq__help">{{ hint }}</p>
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
      .ds-eq__head {
        padding: 13px 16px;
        border-bottom: 1px solid var(--ds-border);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.07em;
        color: var(--ds-text);
      }
      .ds-eq__base {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 13px 16px;
        border-bottom: 1px solid var(--ds-border);
      }
      .ds-eq__base-copy {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .ds-eq__base-label {
        font-size: 13.5px;
        font-weight: 700;
        color: var(--ds-text);
      }
      .ds-eq__base-hint {
        font-size: 10.5px;
        color: var(--ds-text-muted);
      }
      .ds-eq__base ds-segmented-toggle {
        flex: 0 0 auto;
        width: 96px;
      }
      .ds-eq__lines {
        padding: 13px 16px;
        border-bottom: 1px solid var(--ds-border);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ds-eq__section {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: var(--ds-text-meta);
      }
      .ds-eq__row {
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .ds-eq__one {
        font-size: 13px;
        font-weight: 800;
        color: var(--ds-text-muted);
        flex: 0 0 auto;
      }
      .ds-eq__eq {
        font-size: 14px;
        font-weight: 800;
        color: var(--ds-text-muted);
        flex: 0 0 auto;
      }
      .ds-eq__qty {
        flex: 0 0 auto;
        width: 84px;
      }
      .ds-eq__unit {
        font-size: 12px;
        font-weight: 700;
        color: var(--ds-text-meta);
        flex: 0 0 auto;
        min-width: 18px;
      }
      .ds-eq__help {
        margin: 1px 0 0;
        font-size: 10.5px;
        color: var(--ds-text-meta);
        line-height: 1.45;
      }
      .ds-eq__defaults {
        display: flex;
        gap: 10px;
        padding: 13px 16px;
      }
      .ds-eq__default {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ds-eq__default-label {
        font-size: 10px;
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
  @Input() unitCatalog: SelectOption[] = [];

  value: EquivalenceEditorValue = {
    baseUnit: "g",
    recipeUnit: "g",
    diaryUnit: "g",
    equivalences: [],
  };

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

  onBaseUnit(baseUnit: string): void {
    const previousBase = this.value.baseUnit;
    const recipeUnit =
      this.value.recipeUnit === previousBase ? baseUnit : this.value.recipeUnit;
    const diaryUnit =
      this.value.diaryUnit === previousBase ? baseUnit : this.value.diaryUnit;

    this.emit({ ...this.value, baseUnit, recipeUnit, diaryUnit });
  }

  onLineUnit(index: number, unit: string): void {
    this.emit({
      ...this.value,
      equivalences: this.mapLine(index, (line) => ({ ...line, unit })),
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

    this.emit({ ...this.value, equivalences, recipeUnit, diaryUnit });
  }

  onRecipeUnit(recipeUnit: string): void {
    this.emit({ ...this.value, recipeUnit });
  }

  onDiaryUnit(diaryUnit: string): void {
    this.emit({ ...this.value, diaryUnit });
  }

  private emit(value: EquivalenceEditorValue): void {
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
      equivalences: (value?.equivalences ?? []).map((line) => ({
        unit: line.unit ?? "",
        quantity: line.quantity ?? null,
      })),
    };
  }
}
