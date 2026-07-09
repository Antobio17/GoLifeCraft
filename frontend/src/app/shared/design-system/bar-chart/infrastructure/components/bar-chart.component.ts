import { Component, Input } from "@angular/core";

export interface BarDatum {
  id: string;
  label: string;
  value: number;
  display: string;
}

@Component({
  selector: "ds-bar-chart",
  standalone: true,
  template: `
    <div class="ds-bars" [style.height]="chartHeight">
      @for (bar of bars; track bar.id) {
        <div class="ds-bars__col">
          @if (showValues) {
            <span class="ds-bars__value">{{ bar.display }}</span>
          }
          <div
            class="ds-bars__bar"
            [class.ds-bars__bar--top]="highlightTop && isTop(bar.value)"
            [style.height]="height(bar.value)"
          ></div>
          <span class="ds-bars__label" [title]="bar.label">{{
            bar.label
          }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ds-bars {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        height: 148px;
      }
      .ds-bars__col {
        flex: 1 1 0;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        height: 100%;
      }
      .ds-bars__value {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text-meta);
      }
      .ds-bars__bar {
        width: 100%;
        max-width: 34px;
        border-radius: 6px 6px 3px 3px;
        background: var(--ds-bar-rest, var(--ds-primary-soft));
        transition: height var(--ds-transition-smooth);
      }
      .ds-bars__bar--top {
        background: var(--ds-bar-top, var(--ds-primary));
      }
      .ds-bars__label {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--ds-text-xs);
        color: var(--ds-text-meta);
      }
    `,
  ],
})
export class BarChartComponent {
  @Input() bars: BarDatum[] = [];
  @Input() highlightTop = true;
  @Input() showValues = true;
  @Input() chartHeight = "148px";

  private get max(): number {
    return Math.max(...this.bars.map((bar) => bar.value), 1);
  }

  height(value: number): string {
    return `${Math.max(6, Math.round((value / this.max) * 100))}%`;
  }

  isTop(value: number): boolean {
    return value > 0 && value === this.max;
  }
}
