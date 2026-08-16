import { Component, Input } from "@angular/core";

const WIDTH = 300;
const HEIGHT = 100;
const PAD = 14;

@Component({
  selector: "ds-balance-card",
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
        <svg
          class="ds-balance__spark"
          [attr.viewBox]="viewBox"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path [attr.d]="areaPath" class="ds-balance__area" />
          <polyline [attr.points]="linePoints" class="ds-balance__line" />
          <circle
            [attr.cx]="lastX"
            [attr.cy]="lastY"
            r="4"
            class="ds-balance__dot"
          />
        </svg>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-balance {
        background: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
        border-radius: var(--ds-radius-2xl);
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
        color: var(--ds-accent-on-brand);
      }
      .ds-balance__trend {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
        border-radius: var(--ds-radius-pill);
        padding: 0.25rem 0.5625rem;
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        background: color-mix(
          in srgb,
          var(--ds-accent-on-brand) 20%,
          transparent
        );
        color: var(--ds-accent-on-brand);
      }
      .ds-balance__trend.is-down {
        background: color-mix(in srgb, var(--ds-warning) 22%, transparent);
        color: var(--ds-warning);
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
        opacity: 0.55;
      }
      .ds-balance__caption {
        margin-top: var(--ds-space-1);
        font-size: var(--ds-text-sm);
        opacity: 0.65;
      }
      .ds-balance__spark {
        display: block;
        width: 100%;
        height: 4rem;
        margin-top: var(--ds-space-2);
        overflow: visible;
      }
      .ds-balance__area {
        fill: var(--ds-accent-on-brand);
        opacity: 0.16;
      }
      .ds-balance__line {
        fill: none;
        stroke: var(--ds-accent-on-brand);
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
      .ds-balance__dot {
        fill: var(--ds-accent-on-brand);
        stroke: var(--ds-surface-brand);
        stroke-width: 2;
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

  readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;

  get linePoints(): string {
    return this.coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  }

  get areaPath(): string {
    const coordinates = this.coordinates;

    if (coordinates.length === 0) return "";

    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const line = coordinates
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
      .join(" ");

    return `${line} L${last.x} ${HEIGHT} L${first.x} ${HEIGHT} Z`;
  }

  get lastX(): number {
    const coordinates = this.coordinates;

    return coordinates.length === 0 ? 0 : coordinates[coordinates.length - 1].x;
  }

  get lastY(): number {
    const coordinates = this.coordinates;

    return coordinates.length === 0 ? 0 : coordinates[coordinates.length - 1].y;
  }

  private get coordinates(): { x: number; y: number }[] {
    const points = this.points;

    if (points.length === 0) return [];

    const max = Math.max(...points);
    const min = Math.min(...points);
    const span = max - min || 1;
    const step = points.length > 1 ? WIDTH / (points.length - 1) : 0;
    const usable = HEIGHT - PAD * 2;

    return points.map((point, index) => ({
      x: Math.round(index * step),
      y: Math.round(PAD + usable - ((point - min) / span) * usable),
    }));
  }
}
