import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from "@angular/core";

const WIDTH = 300;
const HEIGHT = 100;
const PAD_TOP = 14;
const PAD_BOTTOM = 14;

interface Point {
  x: number;
  y: number;
}

interface Marker {
  left: number;
  top: number;
  label: string;
}

interface Caption {
  left: number;
  label: string;
}

@Component({
  selector: "ds-line-chart",
  template: `
    <div #scroller class="ds-line-scroll" [class.is-scrollable]="scrollable">
      <div class="ds-line-wrap" [style.min-width.px]="minWidth">
        <div class="ds-line-plot">
          <svg
            class="ds-line"
            [attr.viewBox]="viewBox"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path [attr.d]="areaPath" class="ds-line__area" />
            @if (!dots) {
              <polyline [attr.points]="linePoints" class="ds-line__stroke" />
            }
            @if (labels.length === 0 && !dots) {
              <circle
                [attr.cx]="last.x"
                [attr.cy]="last.y"
                r="4"
                class="ds-line__dot"
              />
            }
          </svg>

          @if (labels.length > 0 || dots) {
            <div class="ds-line__markers">
              @for (marker of markers; track $index) {
                <span
                  class="ds-line__marker"
                  [style.left.%]="marker.left"
                  [style.top.%]="marker.top"
                >
                  @if (marker.label) {
                    <span class="ds-line__value">{{ marker.label }}</span>
                  }
                  <span class="ds-line__point" [class.is-large]="dots"></span>
                </span>
              }
            </div>
          }
        </div>

        @if (captions.length > 0) {
          <div class="ds-line__axis">
            @for (caption of axisCaptions; track $index) {
              <span class="ds-line__caption" [style.left.%]="caption.left">{{
                caption.label
              }}</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-line-scroll {
        position: relative;
        width: 100%;
        height: 100%;
      }
      .ds-line-scroll.is-scrollable {
        box-sizing: border-box;
        padding: var(--ds-space-3) var(--ds-space-8) 0;
        overflow-x: auto;
        overflow-y: hidden;
        overscroll-behavior-x: contain;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      .ds-line-scroll.is-scrollable::-webkit-scrollbar {
        display: none;
      }
      .ds-line-wrap {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }
      .ds-line-plot {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
      }
      .ds-line {
        display: block;
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
      .ds-line__markers {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .ds-line__marker {
        position: absolute;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .ds-line__value {
        position: absolute;
        bottom: 100%;
        margin-bottom: var(--ds-space-1);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold, 800);
        line-height: 1;
        white-space: nowrap;
        color: inherit;
        opacity: 0.75;
      }
      .ds-line__point {
        width: 0.3125rem;
        height: 0.3125rem;
        border-radius: 50%;
        background: var(--line-stroke, var(--ds-primary));
        border: 1.5px solid var(--line-dot-stroke, var(--ds-surface));
        box-sizing: border-box;
      }
      .ds-line__point.is-large {
        width: 0.5rem;
        height: 0.5rem;
        border-width: 2px;
      }
      .ds-line__axis {
        position: relative;
        flex: 0 0 auto;
        height: 1rem;
        margin-top: var(--ds-space-2);
      }
      .ds-line__caption {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold, 700);
        line-height: 1;
        white-space: nowrap;
        text-transform: capitalize;
        opacity: 0.55;
      }
    `,
  ],
})
export class LineChartComponent implements OnChanges, AfterViewChecked {
  @Input() points: number[] = [];
  @Input() labels: string[] = [];
  @Input() captions: string[] = [];
  @Input() scrollable = false;
  @Input() dots = false;
  @Input() pointSpacing = 44;

  @ViewChild("scroller") scroller?: ElementRef<HTMLElement>;

  readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;

  private pendingScroll = false;

  get minWidth(): number | null {
    if (!this.scrollable) {
      return null;
    }
    return this.points.length * this.pointSpacing;
  }

  ngOnChanges(): void {
    this.pendingScroll = this.scrollable;
  }

  ngAfterViewChecked(): void {
    if (!this.pendingScroll || !this.scroller) {
      return;
    }

    this.pendingScroll = false;
    const element = this.scroller.nativeElement;
    element.scrollLeft = element.scrollWidth;
  }

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

  get markers(): Marker[] {
    return this.coords.map((point, i) => ({
      left: +((point.x / WIDTH) * 100).toFixed(2),
      top: +((point.y / HEIGHT) * 100).toFixed(2),
      label: this.labels[i] ?? "",
    }));
  }

  get axisCaptions(): Caption[] {
    return this.coords.map((point, i) => ({
      left: +((point.x / WIDTH) * 100).toFixed(2),
      label: this.captions[i] ?? "",
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
