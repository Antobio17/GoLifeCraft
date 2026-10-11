import { Component, input, output } from "@angular/core";
import { GlyphComponent } from "../../../glyph/infrastructure/components/glyph.component";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsGlyph } from "../../../glyph/domain/models/ds-glyph.enum";

@Component({
  selector: "ds-allocation-row",
  imports: [GlyphComponent, IconComponent],
  template: `
    <button
      type="button"
      class="ds-arow"
      [attr.aria-label]="ariaLabel() || null"
      (click)="pressed.emit()"
    >
      @if (glyph(); as name) {
        <ds-glyph
          [name]="name"
          [tile]="true"
          [size]="18"
          [color]="color()"
          box="2rem"
        />
      }
      <span class="ds-arow__label">{{ label() }}</span>
      <span class="ds-arow__amount">
        {{ amountLabel() }}
        <ds-icon name="pencil" [size]="13" [stroke]="2.2" />
      </span>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-arow {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        width: 100%;
        min-height: 3.25rem;
        padding: var(--ds-space-2) 0;
        margin: 0;
        appearance: none;
        border: none;
        background: none;
        font: inherit;
        color: var(--ds-text);
        text-align: left;
        cursor: pointer;
      }
      .ds-arow:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
        border-radius: var(--ds-radius-mark);
      }
      .ds-arow__label {
        flex: 1 1 auto;
        min-width: 0;
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-semibold);
        overflow-wrap: anywhere;
      }
      .ds-arow__amount {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        min-height: 2rem;
        padding: 0 var(--ds-space-2) 0 var(--ds-space-3);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        color: var(--ds-text);
        transition: var(--ds-motion-tint);
      }
      .ds-arow__amount ds-icon {
        color: var(--ds-text-meta);
      }
      .ds-arow:hover .ds-arow__amount {
        background: var(--ds-surface-hover);
      }
    `,
  ],
})
export class AllocationRowComponent {
  readonly label = input("");
  readonly amountLabel = input("");
  readonly glyph = input<`${DsGlyph}` | null>(null);
  readonly color = input("");
  readonly ariaLabel = input("");

  readonly pressed = output<void>();
}
