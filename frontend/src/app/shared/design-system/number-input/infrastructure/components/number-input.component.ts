import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-number-input",
  standalone: true,
  imports: [IconComponent],
  template: `
    <div
      class="ds-num"
      [class.ds-num--stepper]="stepper"
      [class.ds-num--boxed]="variant === 'boxed'"
    >
      @if (stepper) {
        <button
          type="button"
          class="ds-num__step"
          [disabled]="disabled || value <= min"
          [attr.aria-label]="decrementLabel || null"
          (click)="nudge(-1)"
        >
          <ds-icon name="minus" [size]="14" [stroke]="2.4" />
        </button>
      }
      <input
        class="ds-num__field"
        type="text"
        [attr.inputmode]="precision > 0 ? 'decimal' : 'numeric'"
        [value]="raw"
        [disabled]="disabled"
        [attr.aria-label]="ariaLabel || null"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
      @if (unit) {
        <span class="ds-num__unit">{{ unit }}</span>
      }
      @if (stepper) {
        <button
          type="button"
          class="ds-num__step"
          [disabled]="disabled || (max !== null && value >= max)"
          [attr.aria-label]="incrementLabel || null"
          (click)="nudge(1)"
        >
          <ds-icon name="plus" [size]="14" [stroke]="2.4" />
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-num {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ds-num--stepper {
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-pill);
        padding: 3px;
      }
      .ds-num__field {
        min-width: 0;
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--ds-border-input);
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface);
        padding: 10px 12px;
        font: inherit;
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text);
        text-align: center;
        -moz-appearance: textfield;
        appearance: textfield;
      }
      .ds-num__field::-webkit-outer-spin-button,
      .ds-num__field::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .ds-num--stepper .ds-num__field {
        border: none;
        background: transparent;
        padding: 6px 2px;
        width: 44px;
      }
      .ds-num__field:focus {
        outline: none;
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
      .ds-num--stepper .ds-num__field:focus {
        box-shadow: none;
      }
      .ds-num__step {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        width: 30px;
        height: 30px;
        border: none;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface);
        color: var(--ds-text-body);
        cursor: pointer;
        box-shadow: var(--ds-shadow-xs);
        transition:
          background var(--ds-transition-fast),
          color var(--ds-transition-fast);
      }
      .ds-num__step:hover:not(:disabled) {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-num__step:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .ds-num__unit {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-meta);
      }
      .ds-num--boxed {
        gap: 3px;
        background: transparent;
        border-radius: 0;
        padding: 0;
      }
      .ds-num--boxed .ds-num__step {
        width: 24px;
        height: 28px;
        border: 1px solid var(--ds-border);
        border-radius: 7px;
        background: var(--ds-surface);
        color: var(--ds-primary);
        box-shadow: none;
      }
      .ds-num--boxed .ds-num__step:hover:not(:disabled) {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-num--boxed .ds-num__field {
        flex: 1 1 0;
        width: 0;
        min-width: 0;
        border: 1px solid var(--ds-border);
        border-radius: 7px;
        background: var(--ds-surface);
        padding: 6px 2px;
        font-size: 13px;
        font-weight: var(--ds-weight-bold);
      }
      .ds-num--boxed .ds-num__field:focus {
        box-shadow: none;
        border-color: var(--ds-border-focus);
      }
      .ds-num--boxed .ds-num__unit {
        margin-left: 3px;
      }
    `,
  ],
})
export class NumberInputComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true });

  @Input() stepper = false;
  @Input() variant: "pill" | "boxed" = "pill";
  @Input() step = 1;
  @Input() min = 0;
  @Input() max: number | null = null;
  @Input() precision = 0;
  @Input() unit = "";
  @Input() ariaLabel = "";
  @Input() incrementLabel = "";
  @Input() decrementLabel = "";

  value = 0;
  raw = "0";
  disabled = false;

  private onChange: (value: number) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value: number | null): void {
    this.value = value ?? 0;
    this.raw = this.format(this.value);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.raw = text;

    const normalized = text.replace(",", ".").trim();
    const parsed = Number(normalized);
    if (normalized === "" || Number.isNaN(parsed)) {
      return;
    }

    this.value = this.clamp(parsed);
    this.onChange(this.value);
  }

  onBlur(): void {
    const normalized = this.raw.replace(",", ".").trim();
    const parsed = Number(normalized);
    this.value = this.clamp(
      normalized === "" || Number.isNaN(parsed) ? this.min : parsed,
    );
    this.raw = this.format(this.value);
    this.onChange(this.value);
    this.onTouched();
  }

  nudge(direction: number): void {
    this.value = this.clamp(this.value + direction * this.step);
    this.raw = this.format(this.value);
    this.onChange(this.value);
    this.onTouched();
  }

  private clamp(next: number): number {
    const clampedLow = Math.max(this.min, next);
    const clamped =
      this.max === null ? clampedLow : Math.min(this.max, clampedLow);
    const factor = 10 ** this.precision;
    return Math.round(clamped * factor) / factor;
  }

  private format(value: number): string {
    return Number.isFinite(value) ? String(value) : "";
  }
}
