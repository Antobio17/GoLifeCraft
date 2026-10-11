import { Component, input, model, output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-receipt-line",
  imports: [IconComponent],
  template: `
    <button
      data-testid="receipt-line-toggle"
      type="button"
      class="ds-rline"
      [class.ds-rline--open]="expanded()"
      [attr.aria-expanded]="expanded()"
      [attr.aria-controls]="actionsId"
      (click)="expanded.set(!expanded())"
    >
      <span data-testid="receipt-line-quantity" class="ds-rline__qty">{{
        quantity()
      }}</span>
      <span class="ds-rline__name">
        <span class="ds-rline__label">{{ name() }}</span>
        <span class="ds-rline__leader" aria-hidden="true"></span>
      </span>
      <span class="ds-rline__price">{{ priceLabel() }}</span>
      @if (meta()) {
        <span class="ds-rline__meta">{{ meta() }}</span>
      }
    </button>

    @if (expanded()) {
      <div class="ds-rline__actions" [id]="actionsId">
        <button
          data-testid="receipt-line-return"
          type="button"
          class="ds-rline__return"
          (click)="onReturn()"
        >
          <ds-icon name="restore" [size]="15" [stroke]="2.2" />
          {{ returnLabel() }}
        </button>
        <span class="ds-rline__stepper">
          <button
            data-testid="receipt-line-decrement"
            type="button"
            class="ds-rline__step"
            [disabled]="quantity() <= 1"
            [attr.aria-label]="decrementLabel()"
            (click)="decrement.emit()"
          >
            <ds-icon name="minus" [size]="13" [stroke]="2.6" />
          </button>
          <span class="ds-rline__step-qty">{{ quantity() }}</span>
          <button
            data-testid="receipt-line-increment"
            type="button"
            class="ds-rline__step"
            [attr.aria-label]="incrementLabel()"
            (click)="increment.emit()"
          >
            <ds-icon name="plus" [size]="13" [stroke]="2.6" />
          </button>
        </span>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-rline {
        appearance: none;
        display: grid;
        grid-template-columns: 2.6ch minmax(0, 1fr) auto;
        column-gap: var(--ds-space-2);
        align-items: baseline;
        width: calc(100% + 2 * var(--ds-space-1-5));
        margin: 0 calc(-1 * var(--ds-space-1-5));
        padding: var(--ds-space-1-5);
        border: 0;
        border-radius: var(--ds-radius-mark);
        background: transparent;
        font: inherit;
        text-align: left;
        color: var(--ds-text);
        font-variant-numeric: tabular-nums;
        cursor: pointer;
        transition: background var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-rline--open {
        background: var(--ds-surface-inset);
      }
      .ds-rline:focus-visible {
        outline: none;
        box-shadow: var(--ds-focus-ring);
      }
      .ds-rline__qty {
        font-size: var(--ds-text-md);
        color: var(--ds-text-meta);
      }
      .ds-rline__name {
        display: flex;
        align-items: baseline;
        gap: var(--ds-space-1-5);
        min-width: 0;
        font-size: var(--ds-text-md);
      }
      .ds-rline__label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-rline__leader {
        flex: 1 1 auto;
        min-width: 0.875rem;
        border-bottom: 2px dotted var(--ds-border-strong);
        transform: translateY(-0.25rem);
      }
      .ds-rline__price {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-semibold);
        text-align: right;
        white-space: nowrap;
      }
      .ds-rline__meta {
        grid-column: 2 / 4;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-meta);
      }
      .ds-rline__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ds-space-2);
        padding: var(--ds-space-1) 0 var(--ds-space-2) 3.4ch;
      }
      .ds-rline__return {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        height: 2rem;
        padding: 0 var(--ds-space-3);
        border: 1.5px solid var(--ds-primary-soft-border);
        border-radius: var(--ds-radius-cta);
        background: transparent;
        font: inherit;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-primary-soft-text);
        cursor: pointer;
      }
      .ds-rline__return:focus-visible,
      .ds-rline__step:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
      .ds-rline__stepper {
        display: inline-flex;
        align-items: center;
        height: 1.625rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
      }
      .ds-rline__step {
        appearance: none;
        width: 1.625rem;
        height: 1.625rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: var(--ds-radius-control-sm);
        background: transparent;
        color: var(--ds-primary);
        cursor: pointer;
      }
      .ds-rline__step:disabled {
        cursor: default;
        color: var(--ds-text-muted);
        opacity: 0.5;
      }
      .ds-rline__step-qty {
        min-width: 1rem;
        text-align: center;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-bold);
        font-variant-numeric: tabular-nums;
      }
    `,
  ],
})
export class ReceiptLineComponent {
  private static nextId = 0;
  readonly actionsId = `receipt-line-${ReceiptLineComponent.nextId++}`;
  readonly quantity = input(1);
  readonly name = input("");
  readonly meta = input<string | null>(null);
  readonly priceLabel = input("");
  readonly returnLabel = input("");
  readonly incrementLabel = input("");
  readonly decrementLabel = input("");
  readonly expanded = model(false);
  readonly returned = output<void>();
  readonly increment = output<void>();
  readonly decrement = output<void>();

  onReturn(): void {
    this.expanded.set(false);
    this.returned.emit();
  }
}
