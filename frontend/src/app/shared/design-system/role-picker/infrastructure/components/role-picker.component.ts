import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { RoleOption } from "../../domain/models/role-option.model";

@Component({
  selector: "ds-role-picker",
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="ds-roles">
      @for (option of options; track option.value) {
        <button
          type="button"
          class="ds-role"
          [attr.data-tone]="option.tone"
          [class.is-selected]="option.value === value"
          [disabled]="disabled"
          (click)="select(option.value)"
        >
          <span class="ds-role__icon">
            <ds-icon [name]="option.icon" [size]="24" />
          </span>
          <span class="ds-role__content">
            <span class="ds-role__name">{{ option.name }}</span>
            <span class="ds-role__desc">{{ option.description }}</span>
          </span>
          <span class="ds-role__check">
            <ds-icon name="check" [size]="16" [stroke]="2.5" />
          </span>
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-roles {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .ds-role {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        width: 100%;
        text-align: left;
        background: var(--ds-surface);
        border: 2px solid var(--ds-primary-soft-border);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }
      .ds-role:hover {
        background: var(--ds-surface-hover);
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-shadow-sm);
        transform: translateX(4px);
      }
      .ds-role:disabled {
        cursor: not-allowed;
      }
      .ds-role__icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ds-surface-subtle);
        border-radius: 10px;
        color: var(--ds-text-muted);
        transition: all 0.3s ease;
      }
      .ds-role__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .ds-role__name {
        font-size: 15px;
        font-weight: 700;
        color: var(--ds-text-body);
        letter-spacing: 0.3px;
      }
      .ds-role__desc {
        font-size: 12px;
        font-weight: 500;
        color: var(--ds-text-muted);
        line-height: 1.4;
      }
      .ds-role__check {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--ds-text-disabled);
        border-radius: 50%;
        color: transparent;
        transition: all 0.3s ease;
      }
      .ds-role.is-selected[data-tone="accent"] {
        background: var(--ds-accent-soft);
        border-color: var(--ds-accent);
      }
      .ds-role.is-selected[data-tone="accent"] .ds-role__icon {
        background: var(--ds-accent-soft);
        color: var(--ds-accent-soft-text);
      }
      .ds-role.is-selected[data-tone="accent"] .ds-role__name {
        color: var(--ds-accent-soft-text);
      }
      .ds-role.is-selected[data-tone="accent"] .ds-role__check {
        background: var(--ds-danger);
        border-color: var(--ds-danger);
        color: var(--ds-on-primary);
      }
      .ds-role.is-selected[data-tone="brand"] {
        background: var(--ds-primary-soft);
        border-color: var(--ds-primary);
      }
      .ds-role.is-selected[data-tone="brand"] .ds-role__icon {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-role.is-selected[data-tone="brand"] .ds-role__name {
        color: var(--ds-primary-soft-text);
      }
      .ds-role.is-selected[data-tone="brand"] .ds-role__check {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
        color: var(--ds-on-primary);
      }
    `,
  ],
})
export class RolePickerComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true });

  @Input() options: RoleOption[] = [];

  value = "";
  disabled = false;

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  select(value: string): void {
    if (this.disabled) return;
    this.value = value;
    this.onChange(value);
    this.onTouched();
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
}
