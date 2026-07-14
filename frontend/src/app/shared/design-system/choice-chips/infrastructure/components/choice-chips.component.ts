import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export interface ChoiceChipOption {
  value: string | number;
  label: string;
}

@Component({
  selector: "ds-choice-chips",
  standalone: true,
  template: `
    <div
      class="ds-choice-chips"
      [class.ds-choice-chips--wrap]="wrap"
      role="radiogroup"
    >
      @for (option of options; track option.value) {
        <button
          type="button"
          class="ds-choice-chip"
          [class.is-selected]="value === option.value"
          [disabled]="disabled"
          role="radio"
          [attr.aria-checked]="value === option.value"
          (click)="select(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .ds-choice-chips {
        display: flex;
        gap: 10px;
      }
      .ds-choice-chips--wrap {
        flex-wrap: wrap;
        gap: 8px;
      }
      .ds-choice-chip {
        flex: 1 1 0;
        appearance: none;
        cursor: pointer;
        text-align: center;
        padding: 10px;
        border-radius: var(--ds-radius-xl);
        border: 1px solid var(--ds-border-input);
        background: var(--ds-surface);
        color: var(--ds-text);
        font: inherit;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        transition:
          background 0.15s ease,
          border-color 0.15s ease,
          color 0.15s ease;
      }
      .ds-choice-chip:hover:not(:disabled):not(.is-selected) {
        border-color: var(--ds-primary-soft-border);
      }
      .ds-choice-chips--wrap .ds-choice-chip {
        flex: 0 0 auto;
        padding: 8px 14px;
        border-radius: var(--ds-radius-pill);
      }
      .ds-choice-chip.is-selected {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
        color: var(--ds-on-primary);
        font-weight: var(--ds-weight-bold);
      }
      .ds-choice-chip:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChoiceChipsComponent),
      multi: true,
    },
  ],
})
export class ChoiceChipsComponent implements ControlValueAccessor {
  @Input() options: ChoiceChipOption[] = [];
  @Input() wrap = false;

  value: string | number | null = null;
  disabled = false;

  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  select(value: string | number): void {
    if (this.disabled) return;
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}
