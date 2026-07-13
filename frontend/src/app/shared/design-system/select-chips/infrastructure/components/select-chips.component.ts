import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export interface SelectChipOption {
  value: string;
  label: string;
}

@Component({
  selector: "ds-select-chips",
  standalone: true,
  template: `
    <div class="ds-select-chips" role="group">
      @for (option of options; track option.value) {
        <button
          type="button"
          class="ds-select-chip"
          [class.is-selected]="value === option.value"
          [disabled]="disabled"
          [attr.aria-pressed]="value === option.value"
          (click)="toggle(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .ds-select-chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ds-space-2, 8px);
      }
      .ds-select-chip {
        appearance: none;
        cursor: pointer;
        border: 1px solid var(--ds-border, #d8d3c6);
        background: var(--ds-surface, #fff);
        color: var(--ds-text, #20201b);
        border-radius: var(--ds-radius-pill, 999px);
        padding: 6px 14px;
        font: inherit;
        font-size: var(--ds-text-base, 0.875rem);
        line-height: 1.2;
        transition:
          background 0.15s ease,
          border-color 0.15s ease,
          color 0.15s ease;
      }
      .ds-select-chip:hover:not(:disabled):not(.is-selected) {
        border-color: var(--ds-primary, #2f6b4f);
      }
      .ds-select-chip.is-selected {
        background: var(--ds-primary, #2f6b4f);
        border-color: var(--ds-primary, #2f6b4f);
        color: var(--ds-on-primary, #fff);
        font-weight: var(--ds-weight-bold, 700);
      }
      .ds-select-chip:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectChipsComponent),
      multi: true,
    },
  ],
})
export class SelectChipsComponent implements ControlValueAccessor {
  @Input() options: SelectChipOption[] = [];

  value: string | null = null;
  disabled = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? null;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle(value: string): void {
    if (this.disabled) {
      return;
    }

    this.value = this.value === value ? null : value;
    this.onChange(this.value);
    this.onTouched();
  }
}
