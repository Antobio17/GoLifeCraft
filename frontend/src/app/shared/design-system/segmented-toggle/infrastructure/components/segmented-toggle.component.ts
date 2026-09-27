import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export interface SegmentedOption {
  value: string;
  label: string;
}

type SegmentedVariant = "underline" | "pill";

@Component({
  selector: "ds-segmented-toggle",
  template: `
    <div
      class="ds-segmented"
      [class.is-stretch]="stretch"
      [class.ds-segmented--pill]="variant === 'pill'"
      [style.--seg-count]="options.length"
      [style.--seg-index]="activeIndex"
      role="radiogroup"
    >
      @if (variant === "pill" && activeIndex >= 0) {
        <span class="ds-segmented__thumb" aria-hidden="true"></span>
      }
      @for (option of options; track option.value) {
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
        display: flex;
        flex-wrap: wrap;
        gap: var(--ds-space-6);
        border-bottom: 1px solid var(--ds-border);
      }
      .ds-segmented.is-stretch {
        gap: var(--ds-space-2);
      }
      .ds-segmented__option {
        flex: 0 0 auto;
        appearance: none;
        border: none;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        background: transparent;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        padding: var(--ds-space-2) 0 var(--ds-space-3);
        font: inherit;
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
        transition:
          color var(--ds-transition-fast),
          border-color var(--ds-transition-fast);
      }
      .ds-segmented.is-stretch .ds-segmented__option {
        flex: 1 1 0;
        min-width: fit-content;
        text-align: center;
      }
      .ds-segmented__option.is-active {
        color: var(--ds-text);
        font-weight: var(--ds-weight-bold);
        border-bottom-color: var(--ds-primary);
      }
      .ds-segmented__option:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
      :host {
        --seg-thumb: var(--ds-surface);
        --seg-thumb-shadow:
          0 1px 2px rgba(9, 20, 15, 0.08), 0 2px 8px rgba(9, 20, 15, 0.06);
      }
      :host-context([data-theme="dark"]) {
        --seg-thumb: var(--ds-gray-800);
        --seg-thumb-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
      }
      .ds-segmented--pill {
        position: relative;
        flex-wrap: nowrap;
        --seg-inset: var(--ds-space-1);
        gap: 0;
        padding: var(--seg-inset);
        border: none;
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface-inset);
        isolation: isolate;
      }
      .ds-segmented__thumb {
        position: absolute;
        top: var(--seg-inset);
        bottom: var(--seg-inset);
        left: var(--seg-inset);
        width: calc((100% - 2 * var(--seg-inset)) / var(--seg-count));
        border-radius: calc(var(--ds-radius-lg) - var(--seg-inset));
        background: var(--seg-thumb);
        box-shadow: var(--seg-thumb-shadow);
        transform: translateX(calc(100% * var(--seg-index)));
        transition: transform var(--ds-dur-3) var(--ds-ease-out);
        z-index: -1;
      }
      .ds-segmented--pill .ds-segmented__option,
      .ds-segmented--pill.is-stretch .ds-segmented__option {
        flex: 1 1 0;
        min-width: 0;
        margin: 0;
        border: none;
        padding: var(--ds-space-2) var(--ds-space-2);
        border-radius: calc(var(--ds-radius-lg) - var(--seg-inset));
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--ds-text-meta);
        font-weight: var(--ds-weight-semibold);
      }
      .ds-segmented--pill .ds-segmented__option:hover:not(.is-active) {
        color: var(--ds-text);
      }
      .ds-segmented--pill .ds-segmented__option.is-active {
        color: var(--ds-text);
        font-weight: var(--ds-weight-bold);
      }
      .ds-segmented--pill .ds-segmented__option:focus-visible {
        outline: 2px solid var(--ds-primary);
        outline-offset: -2px;
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-segmented__thumb {
          transition: none;
        }
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
  @Input() stretch = true;
  @Input() variant: SegmentedVariant = "underline";

  value = "";
  disabled = false;

  get activeIndex(): number {
    return this.options.findIndex((option) => option.value === this.value);
  }

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

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
