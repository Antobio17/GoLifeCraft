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
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface);
        overflow: hidden;
      }
      .ds-pus__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 11px 14px;
        border-bottom: 1px solid var(--ds-border);
      }
      .ds-pus__title {
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: var(--ds-text);
      }
      .ds-pus__badge {
        font-size: 10px;
        font-weight: 800;
        color: var(--ds-text-muted);
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-pill);
        padding: 3px 9px;
        white-space: nowrap;
      }
      .ds-pus__cells {
        display: flex;
        gap: 8px;
        padding: 11px 14px;
      }
      .ds-pus__cell {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-pus__cell-label {
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: var(--ds-text-meta);
      }
      .ds-pus__cell-value {
        font-size: 13px;
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
        padding: 11px 14px;
        font-size: 11px;
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
