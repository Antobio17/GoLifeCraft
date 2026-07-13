import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";

@Component({
  selector: "ds-toggle-switch",
  standalone: true,
  template: `
    <button
      type="button"
      class="ds-toggle"
      role="switch"
      [class.is-on]="value"
      [attr.aria-checked]="value"
      [attr.aria-label]="ariaLabel || null"
      [disabled]="disabled"
      (click)="toggle()"
    >
      <span class="ds-toggle__knob"></span>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .ds-toggle {
        width: 46px;
        height: 26px;
        flex: 0 0 auto;
        border: none;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border-strong);
        padding: 2px;
        cursor: pointer;
        transition:
          background var(--ds-transition-base),
          border-color var(--ds-transition-base);
      }
      .ds-toggle.is-on {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
      }
      .ds-toggle:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .ds-toggle__knob {
        display: block;
        width: 20px;
        height: 20px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-raised);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        transition: transform var(--ds-transition-base);
      }
      .ds-toggle.is-on .ds-toggle__knob {
        transform: translateX(20px);
      }
    `,
  ],
})
export class ToggleSwitchComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true });

  @Input() ariaLabel = "";

  value = false;
  disabled = false;

  private onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  toggle(): void {
    if (this.disabled) return;
    this.value = !this.value;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: boolean | null): void {
    this.value = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
