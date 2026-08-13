import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export interface SegmentedOption {
  value: string;
  label: string;
}

@Component({
  selector: "ds-segmented-toggle",
  template: `
    <div
      class="ds-segmented"
      role="radiogroup"
      [style.--ds-seg-count]="options.length"
    >
      <span
        class="ds-segmented__indicator"
        [style.transform]="'translateX(' + activeIndex * 100 + '%)'"
        [style.opacity]="activeIndex >= 0 ? 1 : 0"
        aria-hidden="true"
      ></span>
      @for (option of options; track option.value; let i = $index) {
        <button
          type="button"
          class="ds-segmented__option"
          [class.is-active]="value === option.value"
          [disabled]="disabled"
          role="radio"
          [attr.aria-checked]="value === option.value"
          (click)="select(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .ds-segmented {
        position: relative;
        display: grid;
        grid-template-columns: repeat(var(--ds-seg-count, 2), 1fr);
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-1);
        isolation: isolate;
      }
      .ds-segmented__indicator {
        position: absolute;
        z-index: 0;
        top: 0.25rem;
        bottom: 0.25rem;
        left: 0.25rem;
        width: calc((100% - 0.5rem) / var(--ds-seg-count, 2));
        border-radius: var(--ds-radius-md);
        background: var(--ds-primary);
        box-shadow: 0 2px 0.5rem -2px var(--ds-primary);
        transition: transform 0.22s cubic-bezier(0.4, 0.2, 0.2, 1);
      }
      .ds-segmented__option {
        position: relative;
        z-index: 1;
        appearance: none;
        border: none;
        background: transparent;
        cursor: pointer;
        user-select: none;
        padding: var(--ds-space-2);
        font: inherit;
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
        transition:
          color 0.18s ease,
          font-weight 0.18s ease;
      }
      .ds-segmented__option.is-active {
        color: var(--ds-on-primary);
        font-weight: var(--ds-weight-extrabold);
      }
      .ds-segmented__option:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SegmentedToggleComponent),
      multi: true,
    },
  ],
})
export class SegmentedToggleComponent implements ControlValueAccessor {
  @Input() options: SegmentedOption[] = [];

  value = "";
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get activeIndex(): number {
    return this.options.findIndex((option) => option.value === this.value);
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

  select(value: string): void {
    if (this.disabled) return;
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}
