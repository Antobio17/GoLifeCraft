import { Component, computed, input } from "@angular/core";
import { StackedBarSegment } from "../../domain/models/stacked-bar-segment.model";

@Component({
  selector: "ds-stacked-bar",
  template: `
    <span class="ds-sbar" role="img" [attr.aria-label]="ariaLabel() || null">
      <span class="ds-sbar__track">
        @for (segment of visibleSegments(); track segment.label) {
          <span
            class="ds-sbar__segment"
            [style.width.%]="segment.value"
            [style.background]="'var(--ds-bar-' + segment.tone + ')'"
          ></span>
        }
      </span>
      @if (markerAt() !== null) {
        <span
          class="ds-sbar__marker"
          [style.left.%]="markerAt()"
          aria-hidden="true"
        ></span>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-sbar {
        --ds-bar-segments: 20;
        position: relative;
        display: block;
        height: calc(var(--ds-bar-height) * 1.6);
      }
      .ds-sbar__track {
        display: flex;
        height: 100%;
        border-radius: var(--ds-bar-segment-radius);
        background: var(--ds-surface-inset);
        -webkit-mask: repeating-linear-gradient(
          90deg,
          #000 0 calc(100% / var(--ds-bar-segments) - var(--ds-bar-segment-gap)),
          transparent
            calc(100% / var(--ds-bar-segments) - var(--ds-bar-segment-gap))
            calc(100% / var(--ds-bar-segments))
        );
        mask: repeating-linear-gradient(
          90deg,
          #000 0 calc(100% / var(--ds-bar-segments) - var(--ds-bar-segment-gap)),
          transparent
            calc(100% / var(--ds-bar-segments) - var(--ds-bar-segment-gap))
            calc(100% / var(--ds-bar-segments))
        );
      }
      .ds-sbar__segment {
        display: block;
        height: 100%;
        transition: var(--ds-motion-fill);
      }
      .ds-sbar__marker {
        position: absolute;
        top: -0.25rem;
        bottom: -0.25rem;
        width: 2px;
        margin-left: -1px;
        border-radius: var(--ds-radius-mark);
        background: var(--ds-danger);
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-sbar__segment {
          transition: none;
        }
      }
    `,
  ],
})
export class StackedBarComponent {
  readonly segments = input<StackedBarSegment[]>([]);
  readonly marker = input<number | null>(null);
  readonly ariaLabel = input("");

  readonly visibleSegments = computed(() =>
    this.segments()
      .map((segment) => ({ ...segment, value: this.clamp(segment.value) }))
      .filter((segment) => segment.value > 0),
  );

  readonly markerAt = computed(() => {
    const marker = this.marker();
    if (marker === null) return null;

    return this.clamp(marker);
  });

  private clamp(percent: number): number {
    return Math.min(100, Math.max(0, percent));
  }
}
