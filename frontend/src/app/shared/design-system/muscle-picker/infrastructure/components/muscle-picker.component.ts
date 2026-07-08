import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export interface MuscleRegion {
  region: string;
  items: string[];
}

@Component({
  selector: "ds-muscle-picker",
  standalone: true,
  template: `
    <div class="ds-muscle-picker">
      @for (group of groups; track group.region) {
        <div class="ds-muscle-picker__group">
          <span class="ds-muscle-picker__region">{{ group.region }}</span>
          <div class="ds-muscle-picker__chips" role="group">
            @for (item of group.items; track item) {
              <button
                type="button"
                class="ds-muscle-chip"
                [class.is-selected]="isSelected(item)"
                [disabled]="disabled"
                [attr.aria-pressed]="isSelected(item)"
                (click)="toggle(item)"
              >
                @if (isSelected(item)) {
                  <svg
                    class="ds-muscle-chip__check"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                }
                {{ item }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ds-muscle-picker {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .ds-muscle-picker__group {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .ds-muscle-picker__region {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .ds-muscle-picker__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .ds-muscle-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        appearance: none;
        cursor: pointer;
        border: 1px solid var(--ds-border-input);
        background: var(--ds-surface);
        color: var(--ds-text-muted);
        border-radius: var(--ds-radius-pill);
        padding: 8px 13px;
        font: inherit;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        line-height: 1;
        user-select: none;
        transition: all 0.14s ease;
      }
      .ds-muscle-chip:hover:not(:disabled):not(.is-selected) {
        border-color: var(--ds-primary-soft-border);
        color: var(--ds-text);
      }
      .ds-muscle-chip.is-selected {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
        color: var(--ds-on-primary);
        font-weight: var(--ds-weight-bold);
        box-shadow: 0 2px 8px -2px var(--ds-primary);
      }
      .ds-muscle-chip__check {
        margin-left: -2px;
      }
      .ds-muscle-chip:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MusclePickerComponent),
      multi: true,
    },
  ],
})
export class MusclePickerComponent implements ControlValueAccessor {
  @Input() groups: MuscleRegion[] = [];

  value: string[] = [];
  disabled = false;

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  isSelected(item: string): boolean {
    return this.value.includes(item);
  }

  writeValue(value: string[] | null): void {
    this.value = Array.isArray(value) ? [...value] : [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle(item: string): void {
    if (this.disabled) return;
    this.value = this.isSelected(item)
      ? this.value.filter((m) => m !== item)
      : [...this.value, item];
    this.onChange(this.value);
    this.onTouched();
  }
}
