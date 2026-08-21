import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export interface TypeToggleOption {
  value: string;
  label: string;
}

@Component({
  selector: "ds-type-toggle",
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
      :host {
        display: inline-flex;
        flex: 0 0 auto;
      }
      .ds-type-toggle {
        display: inline-flex;
        gap: var(--ds-space-1);
        padding: var(--ds-space-1);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
      }
      .ds-type-toggle__option {
        appearance: none;
        cursor: pointer;
        border: none;
        background: transparent;
        color: var(--ds-text-meta);
        border-radius: var(--ds-radius-pill);
        padding: var(--ds-space-1) var(--ds-space-3);
        font: inherit;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        white-space: nowrap;
        transition:
          background 0.15s ease,
          color 0.15s ease,
          box-shadow 0.15s ease;
      }
      .ds-type-toggle__option:hover:not(.is-active):not(:disabled) {
        color: var(--ds-text-body);
      }
      .ds-type-toggle__option.is-active {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        box-shadow: inset 0 0 0 1px var(--ds-primary-soft-border);
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
