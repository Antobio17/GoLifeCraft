import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";
import { SelectOption } from "../../domain/models/select-option.model";

type SelectVariant = "pill" | "bare";

@Component({
  selector: "ds-select",
  standalone: true,
  imports: [IconComponent],
  template: `
    <span
      class="ds-select"
      [class.ds-select--pill]="variant === 'pill'"
      [class.ds-select--bare]="variant === 'bare'"
      [class.is-active]="variant === 'pill' && value !== ''"
    >
      @if (leadingIcon) {
        <ds-icon class="ds-select__lead" [name]="leadingIcon" [size]="16" />
      }
      <select
        class="ds-select__native"
        [disabled]="disabled"
        [attr.aria-label]="ariaLabel || placeholder || null"
        (change)="onSelect($event)"
      >
        @if (placeholder) {
          <option value="" [selected]="value === ''">{{ placeholder }}</option>
        }
        @for (option of normalized; track option.value) {
          <option [value]="option.value" [selected]="option.value === value">
            {{ option.label }}
          </option>
        }
      </select>
      <ds-icon class="ds-select__chevron" name="chevronDown" [size]="14" />
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .ds-select {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }
      .ds-select__native {
        appearance: none;
        border: none;
        background: transparent;
        font: inherit;
        color: inherit;
        cursor: pointer;
        width: 100%;
      }
      .ds-select__native:focus-visible {
        outline: none;
      }
      .ds-select__chevron {
        position: absolute;
        right: 10px;
        pointer-events: none;
        color: var(--ds-text-meta);
      }
      .ds-select__lead {
        position: absolute;
        left: 11px;
        pointer-events: none;
        color: var(--ds-text-meta);
      }
      .ds-select--pill {
        border: 1px solid var(--ds-border-strong);
        background: var(--ds-surface);
        color: var(--ds-text);
        border-radius: 20px;
        padding: 7px 12px;
      }
      .ds-select--pill .ds-select__native {
        padding-right: 18px;
        font-size: 11.5px;
        font-weight: 600;
      }
      .ds-select--pill.is-active {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .ds-select--pill.is-active .ds-select__chevron {
        color: var(--ds-on-primary);
      }
      .ds-select--bare {
        border: 1px solid var(--ds-border-input);
        background: var(--ds-surface);
        color: var(--ds-text);
        border-radius: var(--ds-radius-lg);
        padding: 8px 12px;
      }
      .ds-select--bare .ds-select__native {
        padding-left: 22px;
        padding-right: 18px;
        font-size: var(--ds-text-sm);
        font-weight: 600;
      }
    `,
  ],
})
export class SelectComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true });

  @Input() options: Array<string | SelectOption> = [];
  @Input() placeholder = "";
  @Input() ariaLabel = "";
  @Input() variant: SelectVariant = "pill";
  @Input() leadingIcon?: DsIconName;

  value = "";
  disabled = false;

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get normalized(): SelectOption[] {
    return this.options.map((option) =>
      typeof option === "string" ? { value: option, label: option } : option,
    );
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

  onSelect(event: Event): void {
    this.value = (event.target as HTMLSelectElement).value;
    this.onChange(this.value);
    this.onTouched();
  }
}
