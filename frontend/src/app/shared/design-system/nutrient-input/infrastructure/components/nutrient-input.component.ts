import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type NutrientVariant = "default" | "energy" | "sub";

@Component({
  selector: "ds-nutrient-input",
  standalone: true,
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
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--ds-border);
        cursor: text;
      }
      .ds-nrow--sub {
        padding: 10px 16px 10px 30px;
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
        gap: 9px;
        font-size: 14px;
        font-weight: 700;
        color: var(--ds-text);
      }
      .ds-nrow--sub .ds-nrow__name {
        font-size: 12.5px;
        font-weight: 500;
        color: var(--ds-text-muted);
      }
      .ds-nrow--energy .ds-nrow__name {
        font-size: 13.5px;
        font-weight: 800;
      }
      .ds-nrow__icon {
        flex: 0 0 auto;
        color: var(--ds-primary);
      }
      .ds-nrow__field {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .ds-nrow__unit {
        font-size: 12px;
        font-weight: 600;
        color: var(--ds-text-meta);
      }
      .ds-nrow__unit--energy {
        font-size: 12px;
        font-weight: 700;
        color: var(--ds-text-muted);
      }
      .ds-nrow__input {
        width: 56px;
        box-sizing: border-box;
        text-align: right;
        background: transparent;
        border: none;
        border-bottom: 1.5px solid var(--ds-border-strong);
        padding: 3px 2px;
        font: inherit;
        font-size: 16px;
        font-weight: 800;
        font-family: var(--ds-font-display, inherit);
        color: var(--ds-text);
        outline: none;
      }
      .ds-nrow__input:focus {
        border-bottom-color: var(--ds-primary);
      }
      .ds-nrow__input--sub {
        font-size: 15px;
        font-weight: 700;
        color: var(--ds-text-muted);
      }
      .ds-nrow__input--energy {
        width: 74px;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border-input);
        border-radius: 9px;
        padding: 6px 9px;
        font-size: 15px;
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
