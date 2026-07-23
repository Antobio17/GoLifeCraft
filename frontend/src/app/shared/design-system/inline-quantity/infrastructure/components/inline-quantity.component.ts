import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-inline-quantity",
  standalone: true,
  template: `
    <span class="ds-inline-qty">
      <input
        class="ds-inline-qty__input"
        type="text"
        inputmode="decimal"
        [value]="quantity"
        [attr.aria-label]="ariaLabel || null"
        (change)="onCommit($event)"
        (keydown.enter)="onEnter($event)"
      />
      @if (unit) {
        <span class="ds-inline-qty__unit">{{ unit }}</span>
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
        gap: 4px;
        background: var(--ds-surface-inset);
        border-radius: 10px;
        padding: 4px 8px;
      }
      .ds-inline-qty__input {
        width: 42px;
        text-align: right;
        background: transparent;
        border: none;
        outline: none;
        padding: 0;
        font-family: var(--ds-font-display);
        font-size: 13px;
        font-weight: 800;
        color: var(--ds-text);
        -moz-appearance: textfield;
        appearance: textfield;
      }
      .ds-inline-qty__unit {
        font-size: 10.5px;
        font-weight: 700;
        color: var(--ds-text-meta);
        white-space: nowrap;
      }
    `,
  ],
})
export class InlineQuantityComponent {
  @Input() quantity = 0;
  @Input() unit = "";
  @Input() ariaLabel = "";

  @Output() quantityChange = new EventEmitter<number>();

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
}
