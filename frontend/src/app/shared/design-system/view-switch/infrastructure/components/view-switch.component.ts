import { Component, Input, forwardRef, signal } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ViewSwitchOption } from "@shared/design-system/view-switch/domain/models/view-switch-option.model";

type ViewSwitchSize = "md" | "sm";

@Component({
  selector: "ds-view-switch",
  imports: [IconComponent],
  template: `
    <div
      class="ds-vswitch"
      [class.ds-vswitch--sm]="size === 'sm'"
      role="radiogroup"
      [attr.aria-label]="ariaLabel || null"
    >
      @for (option of options; track option.value) {
        <button
          type="button"
          class="ds-vswitch__option"
          role="radio"
          [class.is-active]="value() === option.value"
          [class.has-icon]="!!option.icon"
          [attr.aria-checked]="value() === option.value"
          [attr.aria-label]="option.icon ? option.label : null"
          [attr.title]="option.icon ? option.label : null"
          [disabled]="disabled()"
          (click)="select(option.value)"
        >
          @if (option.icon) {
            <ds-icon [name]="option.icon" [size]="size === 'sm' ? 16 : 19" />
          } @else {
            {{ option.label }}
          }
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 0 0 auto;
      }
      .ds-vswitch {
        --vswitch-inset: var(--ds-space-1);
        --vswitch-radius: var(--ds-radius-control);
        display: flex;
        gap: 2px;
        padding: var(--vswitch-inset);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border-input);
        border-radius: var(--vswitch-radius);
      }
      .ds-vswitch__option {
        appearance: none;
        min-height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 var(--ds-space-3);
        font: inherit;
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-semibold);
        white-space: nowrap;
        border: none;
        border-radius: calc(var(--vswitch-radius) - var(--vswitch-inset) - 1px);
        background: transparent;
        color: var(--ds-text-meta);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition:
          background var(--ds-dur-2) var(--ds-ease-out),
          color var(--ds-dur-2) var(--ds-ease-out),
          transform var(--ds-dur-1) var(--ds-ease-out);
      }
      .ds-vswitch__option.has-icon {
        width: 2.5rem;
        padding: 0;
      }
      .ds-vswitch--sm .ds-vswitch__option {
        min-height: 1.5rem;
        padding: 0 var(--ds-space-2);
        font-size: var(--ds-text-sm);
      }
      .ds-vswitch--sm .ds-vswitch__option.has-icon {
        width: 2rem;
        padding: 0;
      }
      .ds-vswitch__option:hover:not(.is-active):not(:disabled) {
        color: var(--ds-text);
      }
      .ds-vswitch__option:active:not(:disabled) {
        transform: scale(0.92);
      }
      .ds-vswitch__option.is-active {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-vswitch__option:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
      .ds-vswitch__option:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: -2px;
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-vswitch__option {
          transition: none;
        }
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ViewSwitchComponent),
      multi: true,
    },
  ],
})
export class ViewSwitchComponent implements ControlValueAccessor {
  @Input() options: ViewSwitchOption[] = [];
  @Input() ariaLabel = "";
  @Input() size: ViewSwitchSize = "md";

  value = signal("");
  disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? "");
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  select(value: string): void {
    if (this.disabled() || value === this.value()) return;
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }
}
