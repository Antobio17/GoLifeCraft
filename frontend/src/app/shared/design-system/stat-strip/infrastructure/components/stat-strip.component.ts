import { Component, Input } from "@angular/core";
import { StatStripItem } from "../../domain/models/stat-strip-item.model";
import { BarComponent } from "../../../bar/infrastructure/components/bar.component";

@Component({
  selector: "ds-stat-strip",
  imports: [BarComponent],
  template: `
    <dl
      class="ds-sstrip"
      [class.ds-sstrip--compact]="compact"
      [style.--sstrip-cols]="items.length"
    >
      @for (item of items; track item.label) {
        <div class="ds-sstrip__cell">
          <dt class="ds-sstrip__label">
            @if (item.tone) {
              <span
                class="ds-sstrip__dot"
                [style.background]="'var(--ds-bar-' + item.tone + ')'"
                aria-hidden="true"
              ></span>
            }
            {{ item.label }}
          </dt>
          <dd class="ds-sstrip__value">
            {{ item.value }}
            @if (item.unit) {
              <span class="ds-sstrip__unit">{{ item.unit }}</span>
            }
          </dd>
          @if (item.percent !== undefined) {
            <dd class="ds-sstrip__bar">
              <ds-bar
                [value]="item.percent"
                [over]="item.overPercent ?? 0"
                [tone]="item.tone ?? 'brand'"
                [ariaLabel]="item.label"
              />
            </dd>
          }
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-sstrip__dot {
        display: inline-block;
        width: 0.4375rem;
        height: 0.4375rem;
        margin-right: var(--ds-space-1);
        border-radius: var(--ds-radius-pill);
        vertical-align: 0.0625rem;
      }
      .ds-sstrip__bar {
        order: -1;
        margin: var(--ds-space-1-5) 0 0;
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
