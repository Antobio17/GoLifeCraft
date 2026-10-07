import { Component, Input } from "@angular/core";
import { BarComponent } from "../../../bar/infrastructure/components/bar.component";
import { GlyphComponent } from "../../../glyph/infrastructure/components/glyph.component";
import { DsGlyph } from "../../../glyph/domain/models/ds-glyph.enum";

const MIN_FILL = 4;

@Component({
  selector: "ds-breakdown-row",
  imports: [GlyphComponent, BarComponent],
  template: `
    <div class="ds-breakdown">
      <div class="ds-breakdown__head">
        @if (glyph) {
          <ds-glyph [name]="glyph" [tile]="true" [size]="18" [color]="color" />
        } @else if (color) {
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
      <ds-bar
        class="ds-breakdown__track"
        [class.is-indented]="!!color && !glyph"
        [class.is-glyph-indented]="!!glyph"
        [value]="fill"
        [color]="color"
        [ariaLabel]="label"
      />
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
        border-radius: var(--ds-radius-mark);
        flex: 0 0 auto;
      }
      .ds-breakdown {
        --ds-glyph-box: 2rem;
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
      /* El punto y el hueco miden un paso cada uno, así que la barra
         arranca bajo la etiqueta en dos pasos exactos. */
      .ds-breakdown__track.is-indented {
        margin-left: var(--ds-space-4);
      }
      .ds-breakdown__track.is-glyph-indented {
        margin-left: calc(var(--ds-space-8) + var(--ds-space-2));
      }
    `,
  ],
})
export class BreakdownRowComponent {
  @Input() label = "";
  @Input() amountLabel = "";
  @Input() percentageLabel = "";
  @Input() emoji = "";
  @Input() glyph: `${DsGlyph}` | null = null;
  @Input() color = "";
  @Input() ratio = 0;

  get fill(): number {
    return Math.max(MIN_FILL, Math.round(this.ratio * 100));
  }
}
