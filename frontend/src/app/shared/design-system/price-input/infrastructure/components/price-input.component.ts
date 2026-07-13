import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";

@Component({
  selector: "ds-price-input",
  standalone: true,
  template: `
    <div class="ds-price">
      <input
        class="ds-price__input"
        type="text"
        inputmode="decimal"
        [value]="value"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [attr.aria-label]="ariaLabel || null"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      <span class="ds-price__unit">{{ unit }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-price {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border-input);
        border-radius: var(--ds-radius-xl);
        padding: 0 13px;
      }
      .ds-price:focus-within {
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
      .ds-price__input {
        flex: 1 1 0;
        min-width: 0;
        border: none;
        background: transparent;
        padding: 11px 0;
        font: inherit;
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
        outline: none;
      }
      .ds-price__unit {
        font-weight: var(--ds-weight-extrabold);
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class PriceInputComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true });

  @Input() unit = "€";
  @Input() placeholder = "0,00";
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
