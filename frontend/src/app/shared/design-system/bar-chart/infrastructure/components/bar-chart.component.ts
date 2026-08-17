import { Component, Input } from "@angular/core";
import { BarChartBar } from "../../domain/models/bar-chart-bar.model";

const MIN_HEIGHT = 6;
const EMPTY_HEIGHT = 4;

@Component({
  selector: "ds-bar-chart",
  template: `
    <div class="ds-bars" [style.height.px]="height">
      @for (bar of bars; track bar.label) {
        <div class="ds-bars__col">
          <span
            class="ds-bars__bar"
            [class.is-selected]="bar.selected"
            [style.height.%]="heightOf(bar)"
            [attr.aria-label]="bar.label + ' ' + bar.valueLabel"
          ></span>
          <span class="ds-bars__label" [class.is-selected]="bar.selected">{{
            bar.label
          }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-bars {
        display: flex;
        align-items: flex-end;
        gap: var(--ds-space-2);
      }
      .ds-bars__col {
        flex: 1 1 0;
        min-width: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        gap: var(--ds-space-1-5);
      }
      .ds-bars__bar {
        display: block;
        width: 100%;
        min-height: 0.25rem;
        border-radius: var(--ds-radius-sm) var(--ds-radius-sm) 0 0;
        background: var(--ds-data-3);
        transition: height var(--ds-transition-base);
      }
      .ds-bars__bar.is-selected {
        background: var(--ds-data-1);
      }
      .ds-bars__label {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-bars__label.is-selected {
        font-weight: var(--ds-weight-extrabold);
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
