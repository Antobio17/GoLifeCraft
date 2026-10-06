import { Component, Input } from "@angular/core";
import { StatStripItem } from "../../domain/models/stat-strip-item.model";

@Component({
  selector: "ds-stat-strip",
  template: `
    <dl
      class="ds-sstrip"
      [class.ds-sstrip--compact]="compact"
      [style.--sstrip-cols]="items.length"
    >
      @for (item of items; track item.label) {
        <div class="ds-sstrip__cell">
          <dt class="ds-sstrip__label">{{ item.label }}</dt>
          <dd class="ds-sstrip__value">
            {{ item.value }}
            @if (item.unit) {
              <span class="ds-sstrip__unit">{{ item.unit }}</span>
            }
          </dd>
        </div>
      }
    </dl>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-sstrip {
        display: grid;
        grid-template-columns: repeat(var(--sstrip-cols, 3), minmax(0, 1fr));
        margin: 0;
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border-hairline);
        border-radius: var(--ds-radius-surface);
      }
      .ds-sstrip__cell {
        display: flex;
        flex-direction: column-reverse;
        justify-content: flex-end;
        gap: 2px;
        min-width: 0;
        padding: var(--ds-space-3);
      }
      .ds-sstrip__cell + .ds-sstrip__cell {
        border-left: 1px solid var(--ds-border-hairline);
      }
      .ds-sstrip__value {
        margin: 0;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-xl);
        font-weight: var(--ds-weight-bold);
        line-height: var(--ds-leading-tight);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-sstrip__unit {
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-sstrip__label {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-sstrip--compact {
        border-radius: var(--ds-radius-inner);
      }
      .ds-sstrip--compact .ds-sstrip__cell {
        padding: var(--ds-space-2) var(--ds-space-4);
      }
      .ds-sstrip--compact .ds-sstrip__value {
        font-size: var(--ds-text-lg);
      }
    `,
  ],
})
export class StatStripComponent {
  @Input() items: StatStripItem[] = [];
  @Input() compact = false;
}
