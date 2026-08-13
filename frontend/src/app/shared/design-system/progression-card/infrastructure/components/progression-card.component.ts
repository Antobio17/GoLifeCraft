import { Component, Input } from "@angular/core";
import { LineChartComponent } from "../../../line-chart/infrastructure/components/line-chart.component";

export type ProgressionTrend = "up" | "down" | "neutral";

@Component({
  selector: "ds-progression-card",
  imports: [LineChartComponent],
  template: `
    <div class="ds-progression">
      <div class="ds-progression__head">
        <div class="ds-progression__lead">
          <span class="ds-progression__metric">{{ metricLabel }}</span>
          <span class="ds-progression__value">{{ value }}</span>
        </div>
        <div class="ds-progression__aside">
          @if (delta) {
            <span
              class="ds-progression__delta"
              [class.is-up]="trend === 'up'"
              [class.is-down]="trend === 'down'"
            >
              {{ delta }}
            </span>
          }
          @if (prLabel) {
            <span class="ds-progression__pr">{{ prLabel }}</span>
          }
        </div>
      </div>

      @if (points.length > 1) {
        <ds-line-chart
          class="ds-progression__chart"
          [class.is-scrollable]="scrollable"
          [points]="points"
          [labels]="pointLabels"
          [scrollable]="scrollable"
        />
        <div class="ds-progression__axis">
          <span>{{ firstLabel }}</span>
          <span>{{ lastLabel }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-progression {
        background: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
        border-radius: var(--ds-radius-2xl);
        padding: 0.9375rem 1rem;
      }
      .ds-progression__head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 0.625rem;
      }
      .ds-progression__lead {
        min-width: 0;
      }
      .ds-progression__metric {
        display: block;
        font-size: 0.59375rem;
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ds-accent);
      }
      .ds-progression__value {
        display: block;
        margin-top: 0.375rem;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: 1.875rem;
        line-height: 1;
      }
      .ds-progression__aside {
        flex: 0 0 auto;
        text-align: right;
      }
      .ds-progression__delta {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: var(--ds-weight-extrabold);
        color: color-mix(in srgb, var(--ds-on-surface-brand) 60%, transparent);
        background: rgba(255, 255, 255, 0.12);
        border-radius: 62.4375rem;
        padding: 0.25rem 0.5625rem;
      }
      .ds-progression__delta.is-up {
        color: var(--ds-accent);
      }
      .ds-progression__delta.is-down {
        color: var(--ds-coral-400, #ff9d84);
      }
      .ds-progression__pr {
        display: block;
        margin-top: 0.3125rem;
        font-size: 0.59375rem;
        font-weight: var(--ds-weight-semibold);
        opacity: 0.6;
      }
      .ds-progression__chart {
        --line-stroke: var(--ds-accent);
        --line-area: var(--ds-accent);
        --line-area-opacity: 0.16;
        --line-dot-stroke: var(--ds-surface-brand);
        display: block;
        height: 6rem;
        margin-top: 1.25rem;
      }
      .ds-progression__chart.is-scrollable {
        height: 6.75rem;
        margin-top: 0.5rem;
      }
      .ds-progression__axis {
        display: flex;
        justify-content: space-between;
        margin-top: 0.3125rem;
        font-size: 0.59375rem;
        font-weight: var(--ds-weight-bold);
        text-transform: capitalize;
        opacity: 0.55;
      }
    `,
  ],
})
export class ProgressionCardComponent {
  @Input() metricLabel = "";
  @Input() value = "";
  @Input() delta: string | null = null;
  @Input() trend: ProgressionTrend = "neutral";
  @Input() prLabel = "";
  @Input() points: number[] = [];
  @Input() pointLabels: string[] = [];
  @Input() scrollable = false;
  @Input() firstLabel = "";
  @Input() lastLabel = "";
}
