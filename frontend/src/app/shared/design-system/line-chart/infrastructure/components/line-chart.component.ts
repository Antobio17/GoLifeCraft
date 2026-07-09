import { Component, Input } from "@angular/core";

const WIDTH = 300;
const HEIGHT = 100;
const PAD_TOP = 14;
const PAD_BOTTOM = 14;

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: "ds-line-chart",
  standalone: true,
  template: `
    <svg
      class="ds-line"
      [attr.viewBox]="viewBox"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path [attr.d]="areaPath" class="ds-line__area" />
      <polyline [attr.points]="linePoints" class="ds-line__stroke" />
      <circle
        [attr.cx]="last.x"
        [attr.cy]="last.y"
        r="4"
        class="ds-line__dot"
      />
    </svg>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-line {
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .ds-line__area {
        fill: var(--line-area, var(--ds-primary-soft));
        opacity: var(--line-area-opacity, 0.5);
      }
      .ds-line__stroke {
        fill: none;
        stroke: var(--line-stroke, var(--ds-primary));
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
      .ds-line__dot {
        fill: var(--line-stroke, var(--ds-primary));
        stroke: var(--line-dot-stroke, var(--ds-surface));
        stroke-width: 2;
        vector-effect: non-scaling-stroke;
      }
    `,
  ],
})
export class LineChartComponent {
  @Input() points: number[] = [];

  readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;

  private get coords(): Point[] {
    const values = this.points;
    const min = Math.min(...values);
    const span = Math.max(...values) - min || 1;
    const usable = HEIGHT - PAD_TOP - PAD_BOTTOM;
    return values.map((value, i) => ({
      x: +((i / (values.length - 1)) * WIDTH).toFixed(1),
      y: +(HEIGHT - PAD_BOTTOM - ((value - min) / span) * usable).toFixed(1),
    }));
  }

  get linePoints(): string {
    return this.coords.map((point) => `${point.x},${point.y}`).join(" ");
  }

  get areaPath(): string {
    const coords = this.coords;
    const body = coords.map((point) => `${point.x},${point.y}`).join(" L");
    const last = coords[coords.length - 1];
    return `M${coords[0].x},${HEIGHT} L${body} L${last.x},${HEIGHT} Z`;
  }

  get last(): Point {
    const coords = this.coords;
    return coords[coords.length - 1];
  }
}
