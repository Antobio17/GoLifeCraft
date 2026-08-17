import { Component, Input } from "@angular/core";
import { TransactionRowTag } from "../../domain/models/transaction-row-tag.model";

@Component({
  selector: "ds-transaction-row",
  template: `
    <div class="ds-tx">
      <span class="ds-tx__chip" [class.is-income]="income">{{ emoji }}</span>
      <span class="ds-tx__body">
        <span class="ds-tx__head">
          <span class="ds-tx__title">{{ title }}</span>
          @for (tag of tags; track tag.label) {
            <span class="ds-tx__tag" [class.is-highlighted]="tag.highlighted">{{
              tag.label
            }}</span>
          }
        </span>
        <span class="ds-tx__sub">{{ subtitle }}</span>
      </span>
      <span class="ds-tx__amount" [class.is-income]="income">{{
        amountLabel
      }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-tx {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-2) var(--ds-space-3);
      }
      .ds-tx__chip {
        width: 2.5rem;
        height: 2.5rem;
        flex: 0 0 auto;
        border-radius: var(--ds-radius-md);
        background: var(--ds-surface-inset);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--ds-text-lg);
      }
      .ds-tx__chip.is-income {
        background: var(--ds-primary-soft);
      }
      .ds-tx__body {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
      .ds-tx__head {
        display: flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        min-width: 0;
      }
      .ds-tx__title {
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-tx__tag {
        flex: 0 0 auto;
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.04em;
        border-radius: var(--ds-radius-sm);
        padding: 0.125rem var(--ds-space-1);
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
      }
      .ds-tx__tag.is-highlighted {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-tx__sub {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-tx__amount {
        flex: 0 0 auto;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-md);
        color: var(--ds-text);
        white-space: nowrap;
      }
      .ds-tx__amount.is-income {
        color: var(--ds-success);
      }
    `,
  ],
})
export class TransactionRowComponent {
  @Input() emoji = "";
  @Input() title = "";
  @Input() subtitle = "";
  @Input() amountLabel = "";
  @Input() income = false;
  @Input() tags: TransactionRowTag[] = [];
}
