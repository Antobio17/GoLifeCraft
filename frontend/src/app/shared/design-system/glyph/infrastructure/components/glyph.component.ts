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
      :host([tinted]) {
        --ds-glyph-line: var(--glyph-color);
        --ds-glyph-fill: color-mix(
          in srgb,
          var(--glyph-color) 30%,
          transparent
        );
        --ds-glyph-tile: color-mix(
          in srgb,
          var(--glyph-color) 14%,
          transparent
        );
      }
      :host([tile]) {
        width: var(--ds-glyph-box, 2.75rem);
        height: var(--ds-glyph-box, 2.75rem);
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
    "[attr.tinted]": "color() ? '' : null",
    "[style.--glyph-color]": "color() || null",
    "[style.--glyph-size.px]": "size()",
    "[style.--ds-glyph-box]": "box()",
  },
})
export class GlyphComponent {
  private sanitizer = inject(DomSanitizer);
  private glyphCatalogService = inject(GlyphCatalogService);

  readonly name = input.required<`${DsGlyph}`>();
  readonly size = input(24);
  readonly tile = input(false);
  readonly color = input("");
  readonly box = input<string | null>(null);

  readonly markup = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      this.glyphCatalogService.svg(this.name() as DsGlyph),
    ),
  );
}
