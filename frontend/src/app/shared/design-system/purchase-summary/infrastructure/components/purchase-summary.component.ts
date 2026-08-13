import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-purchase-summary",
  template: `
    <section class="ds-pus">
      <header class="ds-pus__head">
        <span class="ds-pus__title">{{ title }}</span>
        @if (priceBadge) {
          <span class="ds-pus__badge">{{ priceBadge }}</span>
        }
      </header>

      @if (hasPack) {
        <div class="ds-pus__cells">
          <div class="ds-pus__cell">
            <span class="ds-pus__cell-label">{{ packLabel }}</span>
            <span class="ds-pus__cell-value">{{ packValue }}</span>
          </div>
          <div class="ds-pus__cell">
            <span class="ds-pus__cell-label">{{ costLabel }}</span>
            <span class="ds-pus__cell-value ds-pus__cell-value--accent">
              {{ costValue || "—" }}
            </span>
          </div>
        </div>
      } @else {
        <p class="ds-pus__empty">{{ emptyText }}</p>
      }

      <div class="ds-pus__extra">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-pus {
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface);
        overflow: hidden;
      }
      .ds-pus__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-2);
        padding: var(--ds-space-3);
        border-bottom: 1px solid var(--ds-border);
      }
      .ds-pus__title {
        font-size: var(--ds-text-xs);
        font-weight: 800;
        letter-spacing: 0.06em;
        color: var(--ds-text);
      }
      .ds-pus__badge {
        font-size: var(--ds-text-xs);
        font-weight: 800;
        color: var(--ds-text-muted);
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-pill);
        padding: var(--ds-space-1) var(--ds-space-2);
        white-space: nowrap;
      }
      .ds-pus__cells {
        display: flex;
        gap: var(--ds-space-2);
        padding: var(--ds-space-3);
      }
      .ds-pus__cell {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-pus__cell-label {
        font-size: var(--ds-text-xs);
        font-weight: 800;
        letter-spacing: 0.04em;
        color: var(--ds-text-meta);
      }
      .ds-pus__cell-value {
        font-size: var(--ds-text-md);
        font-weight: 700;
        color: var(--ds-text);
      }
      .ds-pus__cell-value--accent {
        color: var(--ds-primary);
      }
      .ds-pus__extra:has(*) {
        border-top: 1px solid var(--ds-border);
      }
      .ds-pus__empty {
        margin: 0;
        padding: var(--ds-space-3);
        font-size: var(--ds-text-sm);
        line-height: 1.4;
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class PurchaseSummaryComponent {
  @Input() title = "";
  @Input() priceBadge: string | null = null;
  @Input() hasPack = false;
  @Input() packLabel = "";
  @Input() packValue = "";
  @Input() costLabel = "";
  @Input() costValue: string | null = null;
  @Input() emptyText = "";
}
