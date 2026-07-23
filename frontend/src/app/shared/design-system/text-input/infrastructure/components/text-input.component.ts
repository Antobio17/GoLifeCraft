import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type TextInputVariant = "default" | "outlined";

@Component({
  selector: "ds-text-input",
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (leadingIcon || passwordToggle || emojiPrefix) {
      <span class="ds-text-input__control" [class.is-invalid]="isInvalid">
        @if (emojiPrefix) {
          <span class="ds-text-input__emoji" aria-hidden="true">{{
            emojiPrefix
          }}</span>
        }
        @if (leadingIcon) {
          <ds-icon
            class="ds-text-input__lead"
            [name]="leadingIcon"
            [size]="17"
          />
        }
        <input
          class="ds-text-input__bare"
          [class.ds-text-input__bare--strong]="strong"
          [type]="effectiveType"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [attr.maxlength]="maxLength"
          [attr.inputmode]="inputmode || null"
          [attr.autocomplete]="autocomplete"
          [attr.aria-label]="ariaLabel || null"
          (input)="onInput($event)"
          (blur)="onTouched()"
        />
        @if (passwordToggle) {
          <button
            type="button"
            class="ds-text-input__toggle"
            tabindex="-1"
            [attr.aria-label]="togglePasswordLabel || null"
            (click)="toggleReveal()"
          >
            <ds-icon [name]="revealed ? 'eyeOff' : 'eye'" [size]="17" />
          </button>
        }
      </span>
    } @else {
      <input
        class="ds-text-input"
        [class.ds-text-input--outlined]="variant === 'outlined'"
        [class.is-invalid]="isInvalid"
        [type]="type"
        [value]="value"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [attr.maxlength]="maxLength"
        [attr.inputmode]="inputmode || null"
        [attr.autocomplete]="autocomplete"
        [attr.aria-label]="ariaLabel || null"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
    }
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
      .ds-text-input__control {
        position: relative;
        display: flex;
        align-items: center;
        gap: 9px;
        background: var(--ds-surface-raised);
        border: 1px solid var(--ds-border-input);
        border-radius: var(--ds-radius-xl);
        padding: 12px 13px;
        transition:
          border-color var(--ds-transition-fast),
          box-shadow var(--ds-transition-fast);
      }
      .ds-text-input__control:focus-within {
        border-color: var(--ds-border-focus);
        box-shadow: 0 0 0 3px var(--ds-primary-soft);
      }
      .ds-text-input__control.is-invalid,
      .ds-text-input__control.is-invalid:focus-within {
        border-color: var(--ds-danger);
        box-shadow: none;
      }
      .ds-text-input__emoji {
        flex: none;
        font-size: 22px;
        line-height: 1;
      }
      .ds-text-input__bare--strong {
        font-weight: var(--ds-weight-semibold);
      }
      .ds-text-input__lead {
        color: var(--ds-text-meta);
        flex: none;
      }
      .ds-text-input__bare {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        font: inherit;
        font-size: var(--ds-text-base);
        color: var(--ds-text);
      }
      .ds-text-input__bare::placeholder {
        color: var(--ds-text-meta);
      }
      .ds-text-input__toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: none;
        padding: 0;
        color: var(--ds-text-meta);
        cursor: pointer;
        transition: color var(--ds-transition-fast);
      }
      .ds-text-input__toggle:hover {
        color: var(--ds-primary);
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
  @Input() inputmode = "";
  @Input() leadingIcon?: DsIconName;
  @Input() emojiPrefix = "";
  @Input() strong = false;
  @Input() passwordToggle = false;
  @Input() togglePasswordLabel = "";

  value = "";
  disabled = false;
  revealed = false;

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

  get effectiveType(): string {
    if (!this.passwordToggle) return this.type;
    return this.revealed ? "text" : "password";
  }

  toggleReveal(): void {
    this.revealed = !this.revealed;
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
