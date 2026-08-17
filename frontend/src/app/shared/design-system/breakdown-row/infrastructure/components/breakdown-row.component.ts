import { Component, Input } from "@angular/core";

const MIN_FILL = 4;

@Component({
  selector: "ds-breakdown-row",
  template: `
    <div class="ds-breakdown">
      <div class="ds-breakdown__head">
        @if (color) {
          <span class="ds-breakdown__dot" [style.background]="color"></span>
        }
        @if (emoji) {
          <span class="ds-breakdown__emoji">{{ emoji }}</span>
        }
        <span class="ds-breakdown__label">{{ label }}</span>
        @if (percentageLabel) {
          <span class="ds-breakdown__pct">{{ percentageLabel }}</span>
        }
        <span class="ds-breakdown__amount">{{ amountLabel }}</span>
      </div>
      <div class="ds-breakdown__track" [class.is-indented]="!!color">
        <span
          class="ds-breakdown__fill"
          [style.width.%]="fill"
          [style.background]="color || 'var(--ds-primary)'"
        ></span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-breakdown {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
      }
      .ds-breakdown__head {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
      }
      .ds-breakdown__dot {
        width: var(--ds-space-2);
        height: var(--ds-space-2);
        border-radius: var(--ds-radius-sm);
        flex: 0 0 auto;
      }
      .ds-breakdown__emoji {
        font-size: var(--ds-text-lg);
        line-height: 1;
      }
      .ds-breakdown__label {
        flex: 1 1 auto;
        min-width: 0;
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-breakdown__pct {
        flex: 0 0 auto;
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text-meta);
      }
      .ds-breakdown__amount {
        flex: 0 0 auto;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-base);
        color: var(--ds-text);
        white-space: nowrap;
      }
      .ds-breakdown__track {
        height: 0.5rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        overflow: hidden;
      }
      /* El punto y el hueco miden un paso cada uno, así que la barra
         arranca bajo la etiqueta en dos pasos exactos. */
      .ds-breakdown__track.is-indented {
        margin-left: var(--ds-space-4);
      }
      .ds-breakdown__fill {
        display: block;
        height: 100%;
        border-radius: var(--ds-radius-pill);
        transition: width var(--ds-transition-base);
      }
    `,
  ],
})
export class BreakdownRowComponent {
  @Input() label = "";
  @Input() amountLabel = "";
  @Input() percentageLabel = "";
  @Input() emoji = "";
  @Input() color = "";
  @Input() ratio = 0;

  get fill(): number {
    return Math.max(MIN_FILL, Math.round(this.ratio * 100));
  }
}
