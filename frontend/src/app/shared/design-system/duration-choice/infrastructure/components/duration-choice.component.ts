import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { DurationChoiceOption } from "../../domain/models/duration-choice-option.model";

@Component({
  selector: "ds-duration-choice",
  template: `
    <div class="ds-duration-choice">
      <div class="ds-duration-choice__chips" role="radiogroup">
        @for (option of options; track option.value) {
          <button
            type="button"
            class="ds-duration-choice__chip"
            [class.is-selected]="!custom && value === option.value"
            [disabled]="disabled"
            role="radio"
            [attr.aria-checked]="!custom && value === option.value"
            (click)="selectPreset(option.value)"
          >
            {{ option.label }}
          </button>
        }
        <button
          type="button"
          class="ds-duration-choice__chip"
          [class.is-selected]="custom"
          [disabled]="disabled"
          role="radio"
          [attr.aria-checked]="custom"
          (click)="enableCustom()"
        >
          {{ customLabel }}
        </button>
      </div>

      @if (custom) {
        <div class="ds-duration-choice__custom">
          <input
            class="ds-duration-choice__field"
            type="text"
            inputmode="numeric"
            [value]="raw"
            [disabled]="disabled"
            [attr.aria-label]="customAriaLabel || null"
            (input)="onCustomInput($event)"
            (blur)="onCustomBlur()"
          />
          @if (unit) {
            <span class="ds-duration-choice__unit">{{ unit }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-duration-choice {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-2);
      }
      .ds-duration-choice__chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ds-space-2);
      }
      .ds-duration-choice__chip {
        flex: 1 1 4.5rem;
        appearance: none;
        cursor: pointer;
        text-align: center;
        padding: var(--ds-space-2);
        border-radius: var(--ds-radius-lg);
        border: 1px solid var(--ds-border-input);
        background: var(--ds-surface);
        color: var(--ds-text);
        font: inherit;
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-semibold);
        transition:
          background var(--ds-dur-2) var(--ds-ease-out),
          border-color var(--ds-dur-2) var(--ds-ease-out),
          color var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-duration-choice__chip:hover:not(:disabled):not(.is-selected) {
        border-color: var(--ds-primary-soft-border);
      }
      .ds-duration-choice__chip.is-selected {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
        color: var(--ds-on-primary);
        font-weight: var(--ds-weight-bold);
      }
      .ds-duration-choice__chip:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .ds-duration-choice__custom {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border-input);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-3);
        transition:
          border-color var(--ds-transition-fast),
          box-shadow var(--ds-transition-fast);
      }
      .ds-duration-choice__custom:focus-within {
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
      .ds-duration-choice__field {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        font: inherit;
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
      }
      .ds-duration-choice__field:disabled {
        cursor: not-allowed;
        opacity: 0.65;
      }
      .ds-duration-choice__unit {
        flex: none;
        font-size: var(--ds-text-md);
        color: var(--ds-text-meta);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DurationChoiceComponent),
      multi: true,
    },
  ],
})
export class DurationChoiceComponent implements ControlValueAccessor {
  @Input() options: DurationChoiceOption[] = [];
  @Input() customLabel = "";
  @Input() customAriaLabel = "";
  @Input() unit = "";
  @Input() min = 0;
  @Input() max: number | null = null;

  value: number | null = null;
  raw = "";
  custom = false;
  disabled = false;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.value = value;
    this.raw = null === value ? "" : String(value);
    this.custom = this.isCustomValue(value);
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

  selectPreset(value: number): void {
    if (this.disabled) return;

    this.custom = false;
    this.commit(value);
  }

  enableCustom(): void {
    if (this.disabled) return;

    this.custom = true;
    this.onTouched();
  }

  onCustomInput(event: Event): void {
    if (this.disabled) return;

    const text = (event.target as HTMLInputElement).value;
    this.raw = text;

    const parsed = Number(text.trim());
    if (text.trim() === "" || Number.isNaN(parsed)) return;

    this.value = this.clamp(parsed);
    this.onChange(this.value);
  }

  onCustomBlur(): void {
    if (this.disabled) return;

    const parsed = Number(this.raw.trim());
    const fallback = this.value ?? this.min;

    this.commit(
      this.raw.trim() === "" || Number.isNaN(parsed) ? fallback : parsed,
    );
    this.onTouched();
  }

  private commit(value: number): void {
    this.value = this.clamp(value);
    this.raw = String(this.value);
    this.onChange(this.value);
  }

  private clamp(value: number): number {
    const rounded = Math.round(value);
    const floored = Math.max(this.min, rounded);

    return null === this.max ? floored : Math.min(this.max, floored);
  }

  private isCustomValue(value: number | null): boolean {
    if (null === value) return false;

    return !this.options.some((option) => option.value === value);
  }
}
