import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";

type TextInputVariant = "default" | "outlined";

@Component({
  selector: "ds-text-input",
  standalone: true,
  template: `
    <input
      class="ds-text-input"
      [class.ds-text-input--outlined]="variant === 'outlined'"
      [class.is-invalid]="isInvalid"
      [type]="type"
      [value]="value"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [attr.maxlength]="maxLength"
      [attr.autocomplete]="autocomplete"
      [attr.aria-label]="ariaLabel || null"
      (input)="onInput($event)"
      (blur)="onTouched()"
    />
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-text-input {
        width: 100%;
        box-sizing: border-box;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border-input);
        border-radius: var(--ds-radius-xl);
        padding: 12px 13px;
        font: inherit;
        font-size: var(--ds-text-base);
        color: var(--ds-text);
        transition:
          border-color var(--ds-transition-fast),
          box-shadow var(--ds-transition-fast);
      }
      .ds-text-input::placeholder {
        color: var(--ds-text-meta);
        font-weight: var(--ds-weight-regular);
      }
      .ds-text-input--outlined {
        border-width: 1.5px;
        border-color: var(--ds-primary);
        font-weight: var(--ds-weight-bold);
      }
      .ds-text-input:focus {
        outline: none;
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
      .ds-text-input.is-invalid,
      .ds-text-input.is-invalid:focus {
        border-color: var(--ds-danger);
        box-shadow: none;
      }
      .ds-text-input:disabled {
        background: var(--ds-surface-subtle);
        cursor: not-allowed;
        opacity: 0.65;
      }
    `,
  ],
})
export class TextInputComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true });

  @Input() variant: TextInputVariant = "default";
  @Input() type = "text";
  @Input() placeholder = "";
  @Input() maxLength?: number;
  @Input() autocomplete = "off";
  @Input() ariaLabel = "";

  value = "";
  disabled = false;

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get isInvalid(): boolean {
    return !!(this.ngControl?.invalid && this.ngControl?.touched);
  }

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

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }
}
