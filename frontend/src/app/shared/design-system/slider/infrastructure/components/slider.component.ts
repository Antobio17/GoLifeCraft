import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";

@Component({
  selector: "ds-slider",
  template: `
    <div class="ds-slider" [class.is-disabled]="disabled">
      <span class="ds-slider__track" aria-hidden="true"></span>
      <span
        class="ds-slider__fill"
        aria-hidden="true"
        [style.width.%]="fill"
      ></span>

      <input
        class="ds-slider__input"
        type="range"
        [min]="min"
        [max]="max"
        [step]="step"
        [value]="value"
        [disabled]="disabled"
        [attr.aria-label]="ariaLabel || null"
        [attr.aria-valuetext]="valueText || null"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .ds-slider {
        position: relative;
        display: flex;
        align-items: center;
        height: 2.25rem;
      }
      .ds-slider.is-disabled {
        opacity: 0.5;
      }
      .ds-slider__track,
      .ds-slider__fill {
        position: absolute;
        left: 0;
        height: 0.375rem;
        border-radius: var(--ds-radius-pill);
        pointer-events: none;
      }
      .ds-slider__track {
        right: 0;
        background: var(--ds-surface-inset);
      }
      .ds-slider__fill {
        background: var(--ds-primary);
        transition: width var(--ds-transition-base);
      }
      .ds-slider__input {
        position: absolute;
        left: 0;
        right: 0;
        width: 100%;
        margin: 0;
        height: 2.25rem;
        appearance: none;
        background: transparent;
        cursor: pointer;
      }
      .ds-slider__input:disabled {
        cursor: not-allowed;
      }
      .ds-slider__input:focus-visible {
        outline: none;
      }
      .ds-slider__input::-webkit-slider-thumb {
        appearance: none;
        width: 1.125rem;
        height: 1.125rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface);
        border: 2px solid var(--ds-primary);
        box-shadow: var(--ds-shadow-sm);
      }
      .ds-slider__input::-moz-range-thumb {
        width: 1.125rem;
        height: 1.125rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface);
        border: 2px solid var(--ds-primary);
        box-shadow: var(--ds-shadow-sm);
      }
      .ds-slider__input:focus-visible::-webkit-slider-thumb {
        border-color: var(--ds-border-focus);
      }
      .ds-slider__input:focus-visible::-moz-range-thumb {
        border-color: var(--ds-border-focus);
      }
    `,
  ],
})
export class SliderComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true });

  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() ariaLabel = "";
  @Input() valueText = "";

  value = 0;
  disabled = false;

  private onChange: (value: number) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get fill(): number {
    const span = this.max - this.min;

    if (span <= 0) return 0;

    return Math.min(100, Math.max(0, ((this.value - this.min) / span) * 100));
  }

  writeValue(value: number | null): void {
    this.value = value ?? this.min;
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
    if (this.disabled) return;

    this.value = Number((event.target as HTMLInputElement).value);
    this.onChange(this.value);
  }
}
