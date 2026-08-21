import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, FormsModule, NgControl } from "@angular/forms";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { SliderComponent } from "@shared/design-system/slider/infrastructure/components/slider.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";

@Component({
  selector: "ds-slider-stepper",
  imports: [FormsModule, StackComponent, IconButtonComponent, SliderComponent],
  template: `
    <ds-stack direction="row" align="center" [gap]="'var(--ds-space-2)'">
      <ds-icon-button
        icon="minus"
        variant="outlined"
        [size]="32"
        [iconSize]="14"
        [disabled]="disabled || atMin"
        [ariaLabel]="decreaseAriaLabel"
        (clicked)="decrement()"
      />

      <ds-stack [grow]="true">
        <ds-slider
          [min]="min"
          [max]="max"
          [step]="step"
          [ariaLabel]="ariaLabel"
          [valueText]="valueText"
          [ngModel]="value"
          [ngModelOptions]="{ standalone: true }"
          (ngModelChange)="onSliderChange($event)"
        />
      </ds-stack>

      <ds-icon-button
        icon="plus"
        variant="outlined"
        [size]="32"
        [iconSize]="14"
        [disabled]="disabled || atMax"
        [ariaLabel]="increaseAriaLabel"
        (clicked)="increment()"
      />
    </ds-stack>
  `,
})
export class SliderStepperComponent implements ControlValueAccessor {
  private ngControl = inject(NgControl, { optional: true, self: true });

  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() ariaLabel = "";
  @Input() valueText = "";
  @Input() decreaseAriaLabel = "Decrease";
  @Input() increaseAriaLabel = "Increase";

  value = 0;
  disabled = false;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get atMin(): boolean {
    return this.value <= this.min;
  }

  get atMax(): boolean {
    return this.value >= this.max;
  }

  writeValue(value: number | null): void {
    const candidate = value ?? this.min;
    this.value = this.clamp(candidate);
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

  onSliderChange(value: number): void {
    this.commit(value);
  }

  decrement(): void {
    if (this.disabled || this.atMin) return;

    this.commit(this.value - this.step);
  }

  increment(): void {
    if (this.disabled || this.atMax) return;

    this.commit(this.value + this.step);
  }

  private commit(value: number): void {
    const next = this.quantize(this.clamp(value));

    this.value = next;
    this.onTouched();
    this.onChange(next);
  }

  private clamp(value: number): number {
    return Math.min(this.max, Math.max(this.min, value));
  }

  private quantize(value: number): number {
    if (this.step <= 0) return value;

    const raw =
      Math.round((value - this.min) / this.step) * this.step + this.min;
    const decimals = this.decimalsOf(this.step);

    return Number(raw.toFixed(decimals));
  }

  private decimalsOf(value: number): number {
    const text = `${value}`;
    const index = text.indexOf(".");

    if (index < 0) return 0;

    return text.length - index - 1;
  }
}
