import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export interface SegmentedOption {
  value: string;
  label: string;
}

@Component({
  selector: "ds-segmented-toggle",
  template: `
    <div class="ds-segmented" [class.is-stretch]="stretch" role="radiogroup">
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

  value = "";
  disabled = false;

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
