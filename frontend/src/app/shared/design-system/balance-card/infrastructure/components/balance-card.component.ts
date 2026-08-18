import { Component, Input } from "@angular/core";
import { LineChartComponent } from "../../../line-chart/infrastructure/components/line-chart.component";

@Component({
  selector: "ds-balance-card",
  imports: [LineChartComponent],
  template: `
    <div class="ds-balance">
      <div class="ds-balance__top">
        <span class="ds-balance__eyebrow">{{ eyebrow }}</span>
        @if (trendLabel) {
          <span class="ds-balance__trend" [class.is-down]="!positive">
            <span aria-hidden="true">{{ positive ? "↗" : "↘" }}</span>
            {{ trendLabel }}
          </span>
        }
      </div>

      <div class="ds-balance__value">
        {{ value }}<span class="ds-balance__unit">{{ unit }}</span>
      </div>

      @if (caption) {
        <div class="ds-balance__caption">{{ caption }}</div>
      }

      @if (points.length > 1) {
        <ds-line-chart
          class="ds-balance__chart"
          [class.is-scrollable]="scrollable"
          [points]="points"
          [labels]="pointLabels"
          [captions]="pointCaptions"
          [scrollable]="scrollable"
          [pointSpacing]="pointSpacing"
          [dots]="true"
        />
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-balance {
        --ds-accent: var(--ds-accent-on-chart);
        --ds-on-accent: var(--ds-on-accent-on-chart);
        --ds-primary: var(--ds-accent-on-chart);
        --ds-on-primary: var(--ds-on-accent-on-chart);
        background: var(--ds-surface-chart);
        color: var(--ds-on-surface-chart);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-4);
        overflow: hidden;
      }
      .ds-balance__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-2);
      }
      .ds-balance__eyebrow {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--ds-accent);
      }
      .ds-balance__trend {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
        border-radius: var(--ds-radius-pill);
        padding: var(--ds-space-1) var(--ds-space-2);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        background: var(--ds-surface-inset);
        color: var(--ds-accent);
      }
      .ds-balance__trend.is-down {
        color: var(--ds-danger);
      }
      .ds-balance__value {
        margin-top: var(--ds-space-2);
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-3xl);
        line-height: 1;
        letter-spacing: var(--ds-tracking-tight);
      }
      .ds-balance__unit {
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text-muted);
      }
      .ds-balance__caption {
        margin-top: var(--ds-space-1);
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
      }
      .ds-balance__chart {
        --line-stroke: var(--ds-accent);
        --line-area: var(--ds-accent);
        --line-area-opacity: 0.16;
        --line-dot-stroke: var(--ds-surface-chart);
        display: block;
        height: 4rem;
        margin-top: var(--ds-space-4);
      }
      .ds-balance__chart.is-scrollable {
        height: 7.5rem;
        margin-top: var(--ds-space-2);
      }
    `,
  ],
})
export class BalanceCardComponent {
  @Input() eyebrow = "";
  @Input() value: string | number = "";
  @Input() unit = "";
  @Input() caption = "";
  @Input() trendLabel = "";
  @Input() positive = true;
  @Input() points: number[] = [];
  @Input() pointLabels: string[] = [];
  @Input() pointCaptions: string[] = [];
  @Input() scrollable = false;
  @Input() pointSpacing = 76;
}
