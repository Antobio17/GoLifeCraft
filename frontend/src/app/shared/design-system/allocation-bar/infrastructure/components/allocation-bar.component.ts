import { Component, Input } from "@angular/core";
import { AllocationSegment } from "../../domain/models/allocation-segment.model";

@Component({
  selector: "ds-allocation-bar",
  template: `
    <div class="ds-allocation">
      <div class="ds-allocation__bar" [attr.aria-label]="ariaLabel || null">
        @for (segment of segments; track segment.key) {
          <span
            class="ds-allocation__segment"
            [style.width.%]="segment.percentage"
            [style.background]="segment.color"
            [attr.title]="segment.label"
          ></span>
        }
      </div>

      @if (legend) {
        <div class="ds-allocation__legend">
          @for (segment of segments; track segment.key) {
            <span class="ds-allocation__item">
              <span
                class="ds-allocation__dot"
                [style.background]="segment.color"
              ></span>
              {{ segment.label }}
            </span>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-allocation {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-3);
      }
      .ds-allocation__bar {
        display: flex;
        height: 0.75rem;
        border-radius: var(--ds-radius-pill);
        overflow: hidden;
        background: var(--ds-surface-inset);
      }
      .ds-allocation__segment {
        display: block;
        height: 100%;
        transition: width var(--ds-transition-smooth);
      }
      .ds-allocation__legend {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ds-space-2) var(--ds-space-4);
      }
      .ds-allocation__item {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text-meta);
      }
      .ds-allocation__dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: var(--ds-radius-pill);
        flex: 0 0 auto;
      }
    `,
  ],
})
export class AllocationBarComponent {
  @Input() segments: AllocationSegment[] = [];
  @Input() legend = true;
  @Input() ariaLabel = "";
}
