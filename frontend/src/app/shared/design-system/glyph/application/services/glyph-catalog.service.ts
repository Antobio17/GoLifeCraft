import { Injectable } from "@angular/core";
import { DsGlyph } from "../../domain/models/ds-glyph.enum";
import { GlyphArtwork } from "../../domain/models/glyph-artwork.model";

@Injectable({ providedIn: "root" })
export class GlyphCatalogService {
  private readonly artworks: Record<DsGlyph, GlyphArtwork> = {
    [DsGlyph.PushAlert]: {
      fill: '<path d="M6.2 16.2V11a5.8 5.8 0 0 1 11.6 0v5.2l1.7 2.3H4.5z"/>',
      line:
        '<path d="M6.2 16.2V11a5.8 5.8 0 0 1 11.6 0v5.2l1.7 2.3H4.5z"/>' +
        '<path d="M10 21.2a2.3 2.3 0 0 0 4 0"/><path d="M12 3.2v2"/>' +
        '<path d="M2.8 9.2a9.4 9.4 0 0 1 2.4-5"/><path d="M21.2 9.2a9.4 9.4 0 0 0-2.4-5"/>',
    },
    [DsGlyph.QuietNight]: {
      fill: '<path d="M19.8 14.6A8 8 0 1 1 9.4 4.2a6.4 6.4 0 0 0 10.4 10.4z"/>',
      line:
        '<path d="M19.8 14.6A8 8 0 1 1 9.4 4.2a6.4 6.4 0 0 0 10.4 10.4z"/>' +
        '<path d="M16.5 3v3.4M14.8 4.7h3.4"/><path d="M20.6 8.4h.01"/>',
    },
    [DsGlyph.EveReminder]: {
      fill:
        '<path d="M3.5 7a2.5 2.5 0 0 1 2.5-2.5h12A2.5 2.5 0 0 1 20.5 7v2.5h-17z"/>' +
        '<rect x="13" y="13" width="4.5" height="4.5" rx="1.2"/>',
      line:
        '<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/>' +
        '<path d="M3.5 9.5h17M8 2.8v3.4M16 2.8v3.4"/>' +
        '<path d="M7.2 13.5h.01M10.2 13.5h.01M7.2 17h.01M10.2 17h.01"/>' +
        '<rect x="13" y="13" width="4.5" height="4.5" rx="1.2"/>',
    },
    [DsGlyph.SoonAlarm]: {
      fill: '<circle cx="12" cy="13" r="7.2"/>',
      line:
        '<circle cx="12" cy="13" r="7.2"/><path d="M12 9.4V13l2.4 1.6"/>' +
        '<path d="M3.4 6.4 6.4 3.6M20.6 6.4l-3-2.8"/>' +
        '<path d="M7.2 19l-1.6 2M16.8 19l1.6 2"/>',
    },
  };

  svg(name: DsGlyph): string {
    const artwork = this.artworks[name];

    return (
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"` +
      ` stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"` +
      ` aria-hidden="true"><g class="ds-glyph__fill">${artwork.fill}</g>` +
      `${artwork.line}</svg>`
    );
  }
}
