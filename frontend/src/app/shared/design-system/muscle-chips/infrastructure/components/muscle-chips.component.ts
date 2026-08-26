import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "ds-muscle-chips",
  template: `
    <div class="ds-muscle-chips" role="group">
      @for (muscle of options; track muscle) {
        <button
          type="button"
          class="ds-muscle-chip"
          [class.is-selected]="isSelected(muscle)"
          [disabled]="disabled"
          [attr.aria-pressed]="isSelected(muscle)"
          (click)="toggle(muscle)"
        >
          {{ muscle }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .ds-muscle-chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ds-space-2);
      }
      .ds-muscle-chip {
        appearance: none;
        cursor: pointer;
        border: 1px solid var(--ds-border);
        background: var(--ds-surface);
        color: var(--ds-text);
        border-radius: var(--ds-radius-pill);
        padding: var(--ds-space-1-5) var(--ds-space-3);
        font: inherit;
        font-size: var(--ds-text-md);
        line-height: 1.2;
        transition:
          background var(--ds-dur-2) var(--ds-ease-out),
          border-color var(--ds-dur-2) var(--ds-ease-out),
          color var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-muscle-chip:hover:not(:disabled) {
        border-color: var(--ds-primary);
      }
      .ds-muscle-chip.is-selected {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
        color: var(--ds-on-primary);
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
      useExisting: forwardRef(() => MuscleChipsComponent),
      multi: true,
    },
  ],
})
export class MuscleChipsComponent implements ControlValueAccessor {
  @Input() options: string[] = [];

  value: string[] = [];
  disabled = false;

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

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

  isSelected(muscle: string): boolean {
    return this.value.includes(muscle);
  }

  toggle(muscle: string): void {
    if (this.disabled) {
      return;
    }

    this.value = this.isSelected(muscle)
      ? this.value.filter((item) => item !== muscle)
      : [...this.value, muscle];

    this.onChange(this.value);
    this.onTouched();
  }
}
