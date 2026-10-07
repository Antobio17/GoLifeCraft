import { Component, computed, input } from "@angular/core";
import { BarTone } from "../../domain/models/bar-tone.enum";

@Component({
  selector: "ds-bar",
  template: `
    <span
      class="ds-bar"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="fill()"
      [attr.aria-label]="ariaLabel() || null"
    >
      <span class="ds-bar__track">
        @if (fill() > 0) {
          <span class="ds-bar__fill" [style.width.%]="fill()"></span>
        }
        @if (overFill() > 0) {
          <span class="ds-bar__over" [style.width.%]="overFill()"></span>
        }
      </span>
      @if (paceFill() !== null) {
        <span
          class="ds-bar__pace"
          [style.left.%]="paceFill()"
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
      .ds-bar {
        position: relative;
        display: block;
        height: var(--ds-bar-height);
      }
      .ds-bar__track {
        display: flex;
        height: 100%;
        border-radius: var(--ds-bar-segment-radius);
        background: color-mix(
          in srgb,
          var(--ds-bar-color) var(--ds-bar-track-tint),
          transparent
        );
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
      .ds-bar__fill {
        display: block;
        height: 100%;
        background: var(--ds-bar-color);
        transition: var(--ds-motion-fill);
      }
      .ds-bar__over {
        display: block;
        height: 100%;
        background: var(--ds-bar-danger);
        transition: var(--ds-motion-fill);
      }
      .ds-bar__pace {
        position: absolute;
        top: -0.25rem;
        bottom: -0.25rem;
        width: 2px;
        margin-left: -1px;
        border-radius: var(--ds-radius-mark);
        background: var(--ds-text);
        opacity: 0.6;
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-bar__fill,
        .ds-bar__over {
          transition: none;
        }
      }
    `,
  ],
  host: {
    "[style.--ds-bar-color]": "barColor()",
  },
})
export class BarComponent {
  readonly value = input(0);
  readonly over = input(0);
  readonly pace = input<number | null>(null);
  readonly tone = input<`${BarTone}`>(BarTone.Brand);
  readonly color = input("");
  readonly ariaLabel = input("");

  readonly fill = computed(() => this.clamp(this.value()));
  readonly overFill = computed(() => this.clamp(this.over()));
  readonly paceFill = computed(() => {
    const pace = this.pace();
    if (pace === null) {
      return null;
    }
    return this.clamp(pace);
  });
  readonly barColor = computed(
    () => this.color() || `var(--ds-bar-${this.tone()})`,
  );

  private clamp(percent: number): number {
    return Math.min(100, Math.max(0, Math.round(percent)));
  }
}
