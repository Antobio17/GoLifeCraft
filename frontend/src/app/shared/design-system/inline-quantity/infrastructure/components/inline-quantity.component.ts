import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SelectOption } from "../../../select/domain/models/select-option.model";

type InlineQuantitySize = "md" | "sm";

@Component({
  selector: "ds-inline-quantity",
  template: `
    <span class="ds-inline-qty" [class.ds-inline-qty--sm]="size === 'sm'">
      <input
        class="ds-inline-qty__input"
        type="text"
        inputmode="decimal"
        [value]="quantity"
        [attr.aria-label]="ariaLabel || null"
        (change)="onCommit($event)"
        (keydown.enter)="onEnter($event)"
      />
      @if (unitOptions.length > 1) {
        <select
          class="ds-inline-qty__select"
          [attr.aria-label]="unitAriaLabel || null"
          (change)="onUnit($event)"
        >
          @for (option of unitOptions; track option.value) {
            <option [value]="option.value" [selected]="option.value === unit">
              {{ option.label }}
            </option>
          }
        </select>
      } @else if (unitLabel || unit) {
        <span class="ds-inline-qty__unit">{{ unitLabel || unit }}</span>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: block;
        flex: 0 0 auto;
        align-self: center;
      }
      .ds-inline-qty {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        background: var(--ds-surface-inset);
        border-radius: 0.625rem;
        padding: 0.25rem 0.4375rem;
      }
      .ds-inline-qty--sm {
        gap: 0.1875rem;
        border-radius: 0.5625rem;
      }
      .ds-inline-qty__input {
        width: 2rem;
        text-align: right;
        background: transparent;
        border: none;
        outline: none;
        padding: 0;
        font-family: var(--ds-font-display);
        font-size: 0.8125rem;
        font-weight: 800;
        color: var(--ds-text);
        -moz-appearance: textfield;
        appearance: textfield;
      }
      .ds-inline-qty--sm .ds-inline-qty__input {
        width: 1.875rem;
        font-size: 0.75rem;
      }
      .ds-inline-qty__unit {
        font-size: 0.65625rem;
        font-weight: 700;
        color: var(--ds-text-meta);
        white-space: nowrap;
      }
      .ds-inline-qty--sm .ds-inline-qty__unit {
        font-size: 0.625rem;
      }
      .ds-inline-qty__select {
        appearance: none;
        border: none;
        outline: none;
        background: transparent;
        padding: 0;
        max-width: 4.625rem;
        font-family: inherit;
        font-size: 0.65625rem;
        font-weight: 700;
        color: var(--ds-text-meta);
        cursor: pointer;
      }
      .ds-inline-qty--sm .ds-inline-qty__select {
        max-width: 3.625rem;
        font-size: 0.625rem;
      }
    `,
  ],
})
export class InlineQuantityComponent {
  @Input() quantity = 0;
  @Input() unit = "";
  @Input() unitLabel = "";
  @Input() unitOptions: SelectOption[] = [];
  @Input() ariaLabel = "";
  @Input() unitAriaLabel = "";
  @Input() size: InlineQuantitySize = "md";

  @Output() quantityChange = new EventEmitter<number>();
  @Output() unitChange = new EventEmitter<string>();

  onCommit(event: Event): void {
    const input = event.target as HTMLInputElement;
    const parsed = Number.parseFloat(input.value.replace(",", "."));

    if (!Number.isFinite(parsed) || parsed <= 0) {
      input.value = String(this.quantity);

      return;
    }

    if (parsed === this.quantity) return;

    this.quantityChange.emit(parsed);
  }

  onEnter(event: Event): void {
    (event.target as HTMLInputElement).blur();
  }

  onUnit(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    if (value === this.unit) return;

    this.unitChange.emit(value);
  }
}
