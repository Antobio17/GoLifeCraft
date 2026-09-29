import { Component, computed, inject, input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { GlyphCatalogService } from "../../application/services/glyph-catalog.service";
import { DsGlyph } from "../../domain/models/ds-glyph.enum";

@Component({
  selector: "ds-glyph",
  template: `<span class="ds-glyph" [innerHTML]="markup()"></span>`,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        width: var(--glyph-size);
        height: var(--glyph-size);
        color: var(--ds-glyph-line);
        line-height: 0;
      }
      :host([tile]) {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: var(--ds-radius-lg);
        background: var(--ds-glyph-tile);
      }
      .ds-glyph {
        display: inline-flex;
        width: var(--glyph-size);
        height: var(--glyph-size);
      }
      .ds-glyph ::ng-deep svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .ds-glyph ::ng-deep .ds-glyph__fill {
        fill: var(--ds-glyph-fill);
        stroke: none;
      }
    `,
  ],
  host: {
    "[attr.tile]": "tile() ? '' : null",
    "[style.--glyph-size.px]": "size()",
  },
})
export class GlyphComponent {
  private sanitizer = inject(DomSanitizer);
  private glyphCatalogService = inject(GlyphCatalogService);

  readonly name = input.required<`${DsGlyph}`>();
  readonly size = input(24);
  readonly tile = input(false);

  readonly markup = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      this.glyphCatalogService.svg(this.name() as DsGlyph),
    ),
  );
}
