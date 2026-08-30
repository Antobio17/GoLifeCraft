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
        <span class="ds-inline-qty__picker">
          <span class="ds-inline-qty__unit">{{ selectedLabel }}</span>
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
        </span>
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
        gap: var(--ds-space-1);
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-md);
        padding: var(--ds-space-1) var(--ds-space-1-5);
      }
      .ds-inline-qty--sm {
        gap: var(--ds-space-1);
        border-radius: var(--ds-radius-md);
      }
      .ds-inline-qty__input {
        width: 3.25rem;
        text-align: right;
        background: transparent;
        border: none;
        outline: none;
        padding: 0;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-md);
        font-weight: 800;
        color: var(--ds-text);
        -moz-appearance: textfield;
        appearance: textfield;
      }
      .ds-inline-qty--sm .ds-inline-qty__input {
        width: 2.75rem;
        font-size: var(--ds-text-base);
      }
      .ds-inline-qty__unit {
        font-size: var(--ds-text-xs);
        font-weight: 700;
        color: var(--ds-text-meta);
        white-space: nowrap;
      }
      .ds-inline-qty--sm .ds-inline-qty__unit {
        font-size: var(--ds-text-xs);
      }
      .ds-inline-qty__picker {
        position: relative;
        display: inline-flex;
        align-items: center;
        max-width: 6rem;
        border-radius: var(--ds-radius-sm);
      }
      .ds-inline-qty__picker:focus-within {
        outline: 2px solid var(--ds-primary);
        outline-offset: 2px;
      }
      .ds-inline-qty__picker .ds-inline-qty__unit {
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
      }
      .ds-inline-qty__select {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        appearance: none;
        border: none;
        outline: none;
        background: transparent;
        padding: 0;
        opacity: 0;
        font-family: inherit;
        font-size: var(--ds-text-xs);
        font-weight: 700;
        cursor: pointer;
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

  get selectedLabel(): string {
    const selected = this.unitOptions.find(
      (option) => option.value === this.unit,
    );

    return (selected?.label ?? this.unitLabel) || this.unit;
  }

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
