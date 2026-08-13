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
        gap: var(--skmet-gap, var(--ds-space-2));
      }
      .skmet__card {
        flex: 1 1 0;
        min-width: 0;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--skmet-radius, var(--ds-radius-lg));
        padding: var(--skmet-padding, var(--ds-space-3) var(--ds-space-3));
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
        height: 1.25rem;
        border-radius: var(--ds-radius-md);
      }
      .skmet__label {
        width: 78%;
        height: 0.625rem;
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
  @Input() gap = "var(--ds-space-2)";
  @Input() radius = "var(--ds-radius-lg)";
  @Input() padding = "var(--ds-space-3) var(--ds-space-3)";
  @Input() feature = false;

  get metricArray(): number[] {
    return Array.from({ length: this.count }, (_, index) => index);
  }

  delayFor(index: number): string {
    return `${index * 0.08}s`;
  }
}
