import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type NutrientVariant = "default" | "energy" | "sub";

@Component({
  selector: "ds-nutrient-input",
  imports: [IconComponent],
  template: `
    <label
      class="ds-nrow"
      [class.ds-nrow--energy]="variant === 'energy'"
      [class.ds-nrow--sub]="variant === 'sub'"
      [class.ds-nrow--last]="last"
    >
      <span class="ds-nrow__name">
        @if (icon) {
          <ds-icon class="ds-nrow__icon" [name]="icon" [size]="16" />
        }
        {{ label }}
      </span>
      <span class="ds-nrow__field">
        <input
          class="ds-nrow__input"
          [class.ds-nrow__input--energy]="variant === 'energy'"
          [class.ds-nrow__input--sub]="variant === 'sub'"
          type="text"
          inputmode="decimal"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [attr.aria-label]="label || null"
          (input)="onInput($event)"
          (blur)="onTouched()"
        />
        <span
          class="ds-nrow__unit"
          [class.ds-nrow__unit--energy]="variant === 'energy'"
          >{{ unit }}</span
        >
      </span>
    </label>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-nrow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--ds-border);
        cursor: text;
      }
      .ds-nrow--sub {
        padding: 0.625rem 1rem 0.625rem 1.875rem;
      }
      .ds-nrow--last {
        border-bottom: none;
      }
      .ds-nrow--energy {
        background: var(--ds-surface-inset);
      }
      .ds-nrow__name {
        display: flex;
        align-items: center;
        gap: 0.5625rem;
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--ds-text);
      }
      .ds-nrow--sub .ds-nrow__name {
        font-size: 0.78125rem;
        font-weight: 500;
        color: var(--ds-text-muted);
      }
      .ds-nrow--energy .ds-nrow__name {
        font-size: 0.84375rem;
        font-weight: 800;
      }
      .ds-nrow__icon {
        flex: 0 0 auto;
        color: var(--ds-primary);
      }
      .ds-nrow__field {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .ds-nrow__unit {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--ds-text-meta);
      }
      .ds-nrow__unit--energy {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--ds-text-muted);
      }
      .ds-nrow__input {
        width: 3.5rem;
        box-sizing: border-box;
        text-align: right;
        background: transparent;
        border: none;
        border-bottom: 1.5px solid var(--ds-border-strong);
        padding: 0.1875rem 2px;
        font: inherit;
        font-size: 1rem;
        font-weight: 800;
        font-family: var(--ds-font-display, inherit);
        color: var(--ds-text);
        outline: none;
      }
      .ds-nrow__input:focus {
        border-bottom-color: var(--ds-primary);
      }
      .ds-nrow__input--sub {
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--ds-text-muted);
      }
      .ds-nrow__input--energy {
        width: 4.625rem;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border-input);
        border-radius: 0.5625rem;
        padding: 0.375rem 0.5625rem;
        font-size: 0.9375rem;
        color: var(--ds-primary);
      }
    `,
  ],
})
export class NutrientInputComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true });

  @Input() label = "";
  @Input() unit = "g";
  @Input() icon?: DsIconName;
  @Input() variant: NutrientVariant = "default";
  @Input() last = false;
  @Input() placeholder = "0";

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
