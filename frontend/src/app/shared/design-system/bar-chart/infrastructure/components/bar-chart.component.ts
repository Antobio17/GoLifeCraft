import { Component, Input } from "@angular/core";
import { BarChartBar } from "../../domain/models/bar-chart-bar.model";

const MIN_HEIGHT = 8;
const EMPTY_HEIGHT = 4;

@Component({
  selector: "ds-bar-chart",
  template: `
    <div class="ds-bars">
      <div class="ds-bars__plot" [style.height.px]="height">
        @for (bar of bars; track bar.label) {
          <div class="ds-bars__col">
            <span
              class="ds-bars__bar"
              [class.is-selected]="bar.selected"
              [style.height.%]="heightOf(bar)"
              [attr.aria-label]="bar.label + ' ' + bar.valueLabel"
            ></span>
          </div>
        }
      </div>

      <div class="ds-bars__axis">
        @for (bar of bars; track bar.label) {
          <span class="ds-bars__label" [class.is-selected]="bar.selected">{{
            bar.label
          }}</span>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        --ds-bar-width: 0.5rem;
      }
      .ds-bars {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-2);
      }
      .ds-bars__plot {
        display: flex;
        align-items: flex-end;
        gap: var(--ds-space-2);
        padding-bottom: var(--ds-space-2);
        border-bottom: 1px solid var(--ds-border-hairline);
      }
      .ds-bars__col {
        flex: 1 1 0;
        min-width: 0;
        height: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      .ds-bars__bar {
        display: block;
        width: 100%;
        max-width: var(--ds-bar-width);
        min-height: var(--ds-bar-width);
        border-radius: var(--ds-radius-pill);
        background: color-mix(in srgb, var(--ds-data-1) 22%, transparent);
        transition:
          height var(--ds-transition-smooth),
          background var(--ds-transition-base);
      }
      .ds-bars__bar.is-selected {
        background: color-mix(in srgb, var(--ds-data-1) 80%, transparent);
      }
      .ds-bars__axis {
        display: flex;
        gap: var(--ds-space-2);
      }
      .ds-bars__label {
        flex: 1 1 0;
        min-width: 0;
        text-align: center;
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-regular);
        color: var(--ds-text-muted);
        transition: color var(--ds-transition-base);
      }
      .ds-bars__label.is-selected {
        font-weight: var(--ds-weight-medium);
        color: var(--ds-text);
      }
    `,
  ],
})
export class BarChartComponent {
  @Input() bars: BarChartBar[] = [];
  @Input() height = 112;

  heightOf(bar: BarChartBar): number {
    const max = Math.max(...this.bars.map((item) => item.value), 0);

    if (bar.value === 0 || max === 0) return EMPTY_HEIGHT;

    return Math.max(MIN_HEIGHT, Math.round((bar.value / max) * 100));
  }
}
