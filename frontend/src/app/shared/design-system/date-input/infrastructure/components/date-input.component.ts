import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

type DateInputType = "date" | "time";

@Component({
  selector: "ds-date-input",
  standalone: true,
  template: `
    <input
      class="ds-date-input"
      [type]="type"
      [value]="value"
      [disabled]="disabled"
      [attr.min]="min || null"
      [attr.max]="max || null"
      [attr.aria-label]="ariaLabel || null"
      (input)="onInput($event)"
      (blur)="onTouched()"
    />
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
        --ds-date-input-min-height: 46px;
      }
      .ds-date-input {
        display: block;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        min-height: var(--ds-date-input-min-height);
        box-sizing: border-box;
        -webkit-appearance: none;
        appearance: none;
        border: 1px solid var(--ds-border-input);
        border-radius: var(--ds-radius-2xl);
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        font: inherit;
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
        line-height: normal;
        text-align: left;
        padding: 12px 13px;
        margin: 0;
        overflow: hidden;
        outline: none;
        color-scheme: light dark;
        transition:
          border-color var(--ds-transition-fast),
          box-shadow var(--ds-transition-fast);
      }
      .ds-date-input:focus {
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
      .ds-date-input:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
      .ds-date-input::-webkit-date-and-time-value {
        text-align: left;
        margin: 0;
        min-height: 0;
        line-height: normal;
      }
      .ds-date-input::-webkit-datetime-edit {
        padding: 0;
        line-height: normal;
        overflow: hidden;
      }
      .ds-date-input::-webkit-datetime-edit-fields-wrapper {
        padding: 0;
      }
      .ds-date-input::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0.55;
        margin: 0;
        padding: 0 0 0 4px;
        flex: 0 0 auto;
      }
      .ds-date-input::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
      }
      @media (pointer: coarse) {
        .ds-date-input {
          font-size: 16px;
          padding: 11px 10px;
        }
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true,
    },
  ],
})
export class DateInputComponent implements ControlValueAccessor {
  @Input() type: DateInputType = "date";
  @Input() min = "";
  @Input() max = "";
  @Input() ariaLabel = "";

  value = "";
  disabled = false;

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

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
