import { Component, input } from "@angular/core";
import { GlyphComponent } from "../../../glyph/infrastructure/components/glyph.component";
import { DsGlyph } from "../../../glyph/domain/models/ds-glyph.enum";

@Component({
  selector: "ds-category-pill",
  imports: [GlyphComponent],
  template: `
    <span class="ds-cpill">
      <ds-glyph
        class="ds-cpill__glyph"
        [name]="glyph()"
        [tile]="true"
        [size]="13"
        [color]="color()"
        box="1.375rem"
      />
      <span class="ds-cpill__label">{{ label() }}</span>
      @if (meta()) {
        <span class="ds-cpill__meta">{{ meta() }}</span>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        min-width: 0;
      }
      .ds-cpill {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        min-width: 0;
        padding: var(--ds-space-1) var(--ds-space-3) var(--ds-space-1)
          var(--ds-space-1);
        border-radius: var(--ds-radius-tag);
        border: 1px solid var(--ds-border);
        background: var(--ds-surface);
      }
      .ds-cpill__glyph {
        --ds-radius-inner: var(--ds-radius-pill);
      }
      .ds-cpill__label {
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-cpill__meta {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-medium);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text-meta);
        white-space: nowrap;
      }
    `,
  ],
})
export class CategoryPillComponent {
  readonly glyph = input.required<`${DsGlyph}`>();
  readonly color = input("");
  readonly label = input("");
  readonly meta = input("");
}
