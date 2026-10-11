import { Component, input } from "@angular/core";

@Component({
  selector: "ds-receipt-group",
  template: `
    <section class="ds-rgroup" [attr.aria-label]="label()">
      <span class="ds-rgroup__label">{{ label() }}</span>
      <div class="ds-rgroup__lines"><ng-content /></div>
      <div class="ds-rgroup__subtotal">
        <span>{{ subtotalLabel() }}</span>
        <span>{{ subtotal() }}</span>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-rgroup {
        display: flex;
        flex-direction: column;
        padding-bottom: var(--ds-space-1);
      }
      :host(:not(:last-child)) .ds-rgroup {
        margin-bottom: var(--ds-space-2);
        border-bottom: 1px solid var(--ds-border-hairline);
      }
      .ds-rgroup__label {
        padding-top: var(--ds-space-1);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ds-text-muted);
      }
      .ds-rgroup__lines {
        display: flex;
        flex-direction: column;
      }
      .ds-rgroup__subtotal {
        display: flex;
        justify-content: space-between;
        padding-top: var(--ds-space-1);
        font-size: var(--ds-text-sm);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class ReceiptGroupComponent {
  readonly label = input("");
  readonly subtotalLabel = input("");
  readonly subtotal = input("");
}
