import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export interface TypeToggleOption {
  value: string;
  label: string;
}

@Component({
  selector: "ds-type-toggle",
  standalone: true,
  template: `
    <div class="ds-type-toggle" role="radiogroup">
      @for (option of options; track option.value) {
        <button
          type="button"
          class="ds-type-toggle__option"
          [class.is-active]="value === option.value"
          [disabled]="disabled"
          [attr.aria-checked]="value === option.value"
          role="radio"
          (click)="select(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .ds-type-toggle {
        display: inline-flex;
        gap: 4px;
        padding: 4px;
        border-radius: var(--ds-radius-pill, 999px);
        background: var(--ds-surface-inset, #efece3);
        border: 1px solid var(--ds-border, #d8d3c6);
      }
      .ds-type-toggle__option {
        appearance: none;
        cursor: pointer;
        border: none;
        background: transparent;
        color: var(--ds-text-body, #55524a);
        border-radius: var(--ds-radius-pill, 999px);
        padding: 6px 18px;
        font: inherit;
        font-size: var(--ds-text-base, 0.875rem);
        font-weight: 600;
        transition:
          background 0.15s ease,
          color 0.15s ease;
      }
      .ds-type-toggle__option.is-active {
        background: var(--ds-primary, #2f6b4f);
        color: var(--ds-on-primary, #fff);
      }
      .ds-type-toggle__option:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeToggleComponent),
      multi: true,
    },
  ],
})
export class TypeToggleComponent implements ControlValueAccessor {
  @Input() options: TypeToggleOption[] = [];

  value = "";
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? "";
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  select(value: string): void {
    if (this.disabled) {
      return;
    }

    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}
