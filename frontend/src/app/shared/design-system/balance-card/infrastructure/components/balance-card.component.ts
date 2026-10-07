import { Component, Input } from "@angular/core";
import { LineChartComponent } from "../../../line-chart/infrastructure/components/line-chart.component";

@Component({
  selector: "ds-balance-card",
  imports: [LineChartComponent],
  template: `
    <div class="ds-balance">
      <div class="ds-balance__top">
        <span class="ds-balance__eyebrow">{{ eyebrow }}</span>
        <span class="ds-balance__actions">
          @if (trendLabel) {
            <span class="ds-balance__trend" [class.is-down]="!positive">
              <span aria-hidden="true">{{ positive ? "↗" : "↘" }}</span>
              {{ trendLabel }}
            </span>
          }
          <ng-content select="[slot=action]"></ng-content>
        </span>
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
        --ds-surface: var(--ds-sheet-surface);
        --ds-surface-inset: var(--ds-sheet-surface-inset);
        background: var(--ds-hero-bg);
        color: var(--ds-text);
        border: 1px solid var(--ds-sheet-border);
        border-radius: var(--ds-radius-surface);
        box-shadow: var(--ds-hero-shadow);
        padding: var(--ds-space-4);
        overflow: hidden;
      }
      @media (min-width: 768px) {
        .ds-balance {
          padding: var(--ds-space-5);
        }
      }
      .ds-balance__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-2);
        min-height: 1.875rem;
      }
      .ds-balance__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-2);
        min-width: 0;
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ds-accent-soft-text, var(--ds-accent));
      }
      .ds-balance__eyebrow::before {
        content: "";
        flex: none;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-accent);
        box-shadow: 0 0 0 0.1875rem
          color-mix(in srgb, var(--ds-accent) 20%, transparent);
      }
      .ds-balance__actions {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-2);
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
        --line-dot-stroke: var(--ds-module-hero-base);
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
