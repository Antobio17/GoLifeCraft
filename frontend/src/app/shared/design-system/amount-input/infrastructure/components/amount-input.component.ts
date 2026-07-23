import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";

type AmountInputLayout = "row" | "stacked";

@Component({
  selector: "ds-amount-input",
  standalone: true,
  template: `
    <label
      class="ds-amount"
      [class.ds-amount--stacked]="layout === 'stacked'"
      [class.ds-amount--large]="large"
    >
      @if (layout === "stacked") {
        <span class="ds-amount__label">{{ label }}</span>
      } @else if (emoji) {
        <span class="ds-amount__emoji" aria-hidden="true">{{ emoji }}</span>
      }

      <input
        class="ds-amount__input"
        type="text"
        [attr.inputmode]="inputmode"
        [value]="value"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [attr.aria-label]="ariaLabel || label || null"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />

      @if (layout === "row" && unit) {
        <span class="ds-amount__unit">{{ unit }}</span>
      }
    </label>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      :host([grow]) {
        flex: 1 1 0;
      }
      .ds-amount {
        display: flex;
        align-items: center;
        gap: 11px;
        box-sizing: border-box;
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border);
        border-radius: 14px;
        padding: 11px 14px;
        cursor: text;
      }
      .ds-amount--stacked {
        flex-direction: column;
        align-items: stretch;
        gap: 5px;
        padding: 9px 11px;
      }
      .ds-amount:focus-within {
        border-color: var(--ds-border-focus);
      }
      .ds-amount__emoji {
        flex: 0 0 auto;
        font-size: 20px;
        line-height: 1;
      }
      .ds-amount__label {
        font-size: 10.5px;
        font-weight: 700;
        color: var(--ds-text-muted);
      }
      .ds-amount__input {
        flex: 1 1 auto;
        min-width: 0;
        width: 100%;
        box-sizing: border-box;
        border: none;
        outline: none;
        background: transparent;
        padding: 0;
        font: inherit;
        font-family: var(--ds-font-display, inherit);
        font-size: 17px;
        font-weight: 800;
        color: var(--ds-text);
      }
      .ds-amount--large .ds-amount__input {
        font-size: 22px;
      }
      .ds-amount__input::placeholder {
        color: var(--ds-text-meta);
      }
      .ds-amount__unit {
        flex: 0 0 auto;
        font-size: 13px;
        font-weight: 700;
        color: var(--ds-text-muted);
      }
    `,
  ],
  host: {
    "[attr.grow]": "grow ? '' : null",
  },
})
export class AmountInputComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true });

  @Input() layout: AmountInputLayout = "row";
  @Input() emoji = "";
  @Input() label = "";
  @Input() unit = "";
  @Input() placeholder = "0";
  @Input() inputmode = "decimal";
  @Input() large = false;
  @Input() grow = false;
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
