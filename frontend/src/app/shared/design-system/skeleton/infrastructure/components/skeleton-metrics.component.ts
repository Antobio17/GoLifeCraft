import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-metrics",
  template: `
    <div class="skmet">
      @for (metric of metricArray; track metric; let i = $index) {
        <div
          class="skmet__card"
          [class.skmet__card--feature]="feature && i === metricArray.length - 1"
          [style.--ds-sk-delay]="delayFor(i)"
        >
          <span class="ds-sk skmet__value"></span>
          <span class="ds-sk skmet__label"></span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .skmet {
        display: flex;
        gap: var(--skmet-gap, 8px);
      }
      .skmet__card {
        flex: 1 1 0;
        min-width: 0;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 7px;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--skmet-radius, 14px);
        padding: var(--skmet-padding, 12px 13px);
      }
      .skmet__card--feature {
        --ds-skeleton-base: color-mix(
          in srgb,
          var(--ds-on-surface-brand) 15%,
          transparent
        );
        --ds-skeleton-highlight: color-mix(
          in srgb,
          var(--ds-on-surface-brand) 26%,
          transparent
        );
        background: var(--ds-surface-brand);
        border-color: transparent;
      }
      .skmet__value {
        width: 58%;
        height: 20px;
        border-radius: var(--ds-radius-md);
      }
      .skmet__label {
        width: 78%;
        height: 10px;
      }
    `,
  ],
  host: {
    "[style.--skmet-gap]": "gap",
    "[style.--skmet-radius]": "radius",
    "[style.--skmet-padding]": "padding",
  },
})
export class SkeletonMetricsComponent {
  @Input() count = 3;
  @Input() gap = "8px";
  @Input() radius = "14px";
  @Input() padding = "12px 13px";
  @Input() feature = false;

  get metricArray(): number[] {
    return Array.from({ length: this.count }, (_, index) => index);
  }

  delayFor(index: number): string {
    return `${index * 0.08}s`;
  }
}
