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
    [DsGlyph.Cart]: {
      fill: '<path d="M5.6 6.5h14.9l-1.6 7.3a2 2 0 0 1-2 1.6H7.9z"/>',
      line: '<path d="M2.5 3.5h2.2l2.6 12.3a1.8 1.8 0 0 0 1.8 1.4h8.6"/><path d="M5.6 6.5h14.9l-1.6 7.3a2 2 0 0 1-2 1.6H7.9"/><circle cx="9.5" cy="20.2" r="1.3"/><circle cx="17" cy="20.2" r="1.3"/>',
    },
    [DsGlyph.Plate]: {
      fill: '<circle cx="12" cy="12.5" r="4.4"/>',
      line: '<circle cx="12" cy="12.5" r="4.4"/><path d="M3 4v4.5A1.5 1.5 0 0 0 4.5 10v10M4.5 4v4M6 4v4.5A1.5 1.5 0 0 1 4.5 10"/><path d="M20.5 20V4c-1.6.8-2.5 2.8-2.5 5.5V13h2.5"/>',
    },
    [DsGlyph.Dumbbell]: {
      fill: '<rect x="5" y="6.5" width="3.4" height="11" rx="1.3"/><rect x="15.6" y="6.5" width="3.4" height="11" rx="1.3"/>',
      line: '<rect x="5" y="6.5" width="3.4" height="11" rx="1.3"/><rect x="15.6" y="6.5" width="3.4" height="11" rx="1.3"/><path d="M2.5 10v4M21.5 10v4M8.4 12h7.2"/>',
    },
    [DsGlyph.Train]: {
      fill: '<path d="M5.5 6.5A3.5 3.5 0 0 1 9 3h6a3.5 3.5 0 0 1 3.5 3.5v4h-13z"/>',
      line: '<rect x="5.5" y="3" width="13" height="14" rx="3.5"/><path d="M5.5 10.5h13"/><path d="M9 13.8h.01M15 13.8h.01"/><path d="M8.5 21l1.5-4M15.5 21l-1.5-4"/>',
    },
    [DsGlyph.Ticket]: {
      fill: '<path d="M14.5 6h5A1.5 1.5 0 0 1 21 7.5v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5h-5z"/>',
      line: '<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-2a2.5 2.5 0 0 0 0-5z"/><path d="M14.5 6.5V8M14.5 11.25v1.5M14.5 16v1.5"/>',
    },
    [DsGlyph.House]: {
      fill: '<path d="M5 9 12 3.5 19 9v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/>',
      line: '<path d="M3 10.5 12 3.5l9 7"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M10 20v-5a2 2 0 0 1 4 0v5"/>',
    },
    [DsGlyph.Bulb]: {
      fill: '<path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
      line: '<path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/><path d="M9.5 19h5M10.5 21.5h3"/><path d="M12 16v-3.5M10.5 11l1.5 1.5 1.5-1.5"/>',
    },
    [DsGlyph.HeartCross]: {
      fill: '<path d="M12 20.5s-8-4.6-8-10.4a4.4 4.4 0 0 1 8-2.5 4.4 4.4 0 0 1 8 2.5c0 5.8-8 10.4-8 10.4z"/>',
      line: '<path d="M12 20.5s-8-4.6-8-10.4a4.4 4.4 0 0 1 8-2.5 4.4 4.4 0 0 1 8 2.5c0 5.8-8 10.4-8 10.4z"/><path d="M12 10.3v5M9.5 12.8h5"/>',
    },
    [DsGlyph.Scissors]: {
      fill: '<circle cx="6.5" cy="17.5" r="2.8"/><circle cx="17.5" cy="17.5" r="2.8"/>',
      line: '<circle cx="6.5" cy="17.5" r="2.8"/><circle cx="17.5" cy="17.5" r="2.8"/><path d="M8.6 15.6 18 3.5M15.4 15.6 6 3.5"/>',
    },
    [DsGlyph.Shirt]: {
      fill: '<path d="M8.5 3.5 3 6.5l1.8 4.2 2.4-1v10.8h9.6V9.7l2.4 1L21 6.5l-5.5-3a3.5 3.5 0 0 1-7 0z"/>',
      line: '<path d="M8.5 3.5 3 6.5l1.8 4.2 2.4-1v10.8h9.6V9.7l2.4 1L21 6.5l-5.5-3a3.5 3.5 0 0 1-7 0z"/>',
    },
    [DsGlyph.Cupcake]: {
      fill: '<path d="M5.5 12.5h13l-1.8 8H7.3z"/>',
      line: '<path d="M5.5 12.5h13l-1.8 8H7.3z"/><path d="M5.5 12.5a3 3 0 0 1 1.2-5.3A5.4 5.4 0 0 1 12 3.5a5.4 5.4 0 0 1 5.3 3.7 3 3 0 0 1 1.2 5.3"/><path d="M10.2 12.5l.4 8M13.8 12.5l-.4 8"/>',
    },
    [DsGlyph.Gift]: {
      fill: '<rect x="4.5" y="11" width="15" height="9.5" rx="1"/>',
      line: '<rect x="3" y="7.5" width="18" height="3.5" rx="1"/><path d="M4.5 11v8.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V11"/><path d="M12 7.5v13"/><path d="M12 7.5C10.8 4.3 7.5 3.4 7 5.4c-.4 1.7 2.4 2.1 5 2.1zM12 7.5c1.2-3.2 4.5-4.1 5-2.1.4 1.7-2.4 2.1-5 2.1z"/>',
    },
    [DsGlyph.Plane]: {
      fill: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
      line: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    },
    [DsGlyph.Paw]: {
      fill: '<path d="M12 12.5c-2.6 0-5 2.8-5 5.2 0 1.6 1.2 2.6 2.6 2.6 1 0 1.6-.5 2.4-.5s1.4.5 2.4.5c1.4 0 2.6-1 2.6-2.6 0-2.4-2.4-5.2-5-5.2z"/>',
      line: '<path d="M12 12.5c-2.6 0-5 2.8-5 5.2 0 1.6 1.2 2.6 2.6 2.6 1 0 1.6-.5 2.4-.5s1.4.5 2.4.5c1.4 0 2.6-1 2.6-2.6 0-2.4-2.4-5.2-5-5.2z"/><ellipse cx="9" cy="6.2" rx="1.7" ry="2.3"/><ellipse cx="15" cy="6.2" rx="1.7" ry="2.3"/><ellipse cx="4.9" cy="10.8" rx="1.6" ry="2"/><ellipse cx="19.1" cy="10.8" rx="1.6" ry="2"/>',
    },
    [DsGlyph.Cycle]: {
      fill: '<circle cx="12" cy="12" r="2.6"/>',
      line: '<path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5"/><path d="M4 3.5v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.3L20 15.5"/><path d="M20 20.5v-5h-5"/>',
    },
    [DsGlyph.TrendUp]: {
      fill: '<path d="M3.5 20.5V16l5-5 4 3.5 7.5-7.5v13.5z"/>',
      line: '<path d="M3.5 16l5-5 4 3.5 7.5-7.5"/><path d="M15 7h5v5"/><path d="M3.5 20.5h17"/>',
    },
    [DsGlyph.Box]: {
      fill: '<path d="M3.5 7.5 12 3.5l8.5 4-8.5 4z"/>',
      line: '<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/>',
    },
    [DsGlyph.Coins]: {
      fill: '<ellipse cx="9.5" cy="6.5" rx="6" ry="2.5"/>',
      line: '<ellipse cx="9.5" cy="6.5" rx="6" ry="2.5"/><path d="M3.5 6.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/><path d="M3.5 10.5v4c0 1.4 2.7 2.5 6 2.5 1 0 1.9-.1 2.7-.3"/><path d="M18 21v-7M15.5 16.5 18 14l2.5 2.5"/>',
    },
    [DsGlyph.Receipt]: {
      fill: '<path d="M5.5 3h13v18l-2.2-1.5L14 21l-2-1.5L10 21l-2.3-1.5L5.5 21z"/>',
      line: '<path d="M5.5 3h13v18l-2.2-1.5L14 21l-2-1.5L10 21l-2.3-1.5L5.5 21z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
    },
    [DsGlyph.Bank]: {
      fill: '<path d="M3 9 12 3.5 21 9z"/>',
      line: '<path d="M3 9 12 3.5 21 9z"/><path d="M5.5 9v8.5M10 9v8.5M14 9v8.5M18.5 9v8.5"/><path d="M3 20.5h18M4 17.5h16"/>',
    },
    [DsGlyph.Banknote]: {
      fill: '<rect x="2.5" y="6" width="19" height="12" rx="2"/>',
      line: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v.01M18 14.5v.01"/>',
    },
    [DsGlyph.Piggy]: {
      fill: '<path d="M19.5 11.2c-.3-3-3.5-5.2-7.5-5.2-4.4 0-8 2.7-8 6 0 2 1.2 3.7 3 4.8V20h3v-2h4v2h3v-3.2c1-.6 1.8-1.4 2.2-2.3H21v-3.3z"/>',
      line: '<path d="M19.5 11.2c-.3-3-3.5-5.2-7.5-5.2-4.4 0-8 2.7-8 6 0 2 1.2 3.7 3 4.8V20h3v-2h4v2h3v-3.2c1-.6 1.8-1.4 2.2-2.3H21v-3.3z"/><path d="M10 9h4"/><path d="M16.3 10.5h.01"/><path d="M4.2 11.3C3 11.3 2 10.6 2 9.4"/><path d="M7.6 7.4 7.3 4.4l2.9 1.9"/>',
    },
    [DsGlyph.Card]: {
      fill: '<rect x="2.5" y="8" width="19" height="3.5"/>',
      line: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 8h19M2.5 11.5h19"/><path d="M6 15.5h4"/>',
    },
    [DsGlyph.Pan]: {
      fill: '<circle cx="10" cy="14" r="4"/>',
      line: '<circle cx="10" cy="14" r="6.5"/><path d="M15.3 10.3l5.7-3.8"/><path d="M8 3.5c-.6.8-.6 1.6 0 2.4M12 3.5c-.6.8-.6 1.6 0 2.4"/>',
    },
    [DsGlyph.Sneaker]: {
      fill: '<path d="M3 17V12.5l3-6 3.5 1.2-.7 2.3c1.6.8 3.4 1.2 5.2 1.3 3.5.2 7 1.5 7 5.2v.5z"/>',
      line: '<path d="M3 17V12.5l3-6 3.5 1.2-.7 2.3c1.6.8 3.4 1.2 5.2 1.3 3.5.2 7 1.5 7 5.2v.5z"/><path d="M3 17v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2"/><path d="M10.4 11.3 9.2 13.2M13.3 11.9l-1 1.8"/>',
    },
    [DsGlyph.Clipboard]: {
      fill: '<rect x="8.5" y="2.5" width="7" height="4" rx="1.2"/>',
      line: '<path d="M8.5 4.5h-2a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-13a2 2 0 0 0-2-2h-2"/><rect x="8.5" y="2.5" width="7" height="4" rx="1.2"/><path d="M8.5 14l2.3 2.3 4.7-4.8"/>',
    },
    [DsGlyph.Pin]: {
      fill: '<path d="M10 9.3 7 13h10l-3-3.7z"/>',
      line: '<path d="M8.5 3.5h7"/><path d="M10 3.5v5.8L7 13h10l-3-3.7V3.5"/><path d="M12 13v7.5"/>',
    },
    [DsGlyph.Calendar]: {
      fill: '<path d="M3.5 7a2.5 2.5 0 0 1 2.5-2.5h12A2.5 2.5 0 0 1 20.5 7v2.5h-17z"/>',
      line: '<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 2.8v3.4M16 2.8v3.4"/><path d="M7.5 13.5h.01M12 13.5h.01M16.5 13.5h.01M7.5 17h.01M12 17h.01"/>',
    },
    [DsGlyph.CalendarWeek]: {
      fill: '<rect x="6" y="12.2" width="12" height="3.6" rx="1"/>',
      line: '<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 2.8v3.4M16 2.8v3.4"/><rect x="6" y="12.2" width="12" height="3.6" rx="1"/>',
    },
    [DsGlyph.Apple]: {
      fill: '<path d="M12 7.5c-1.4-1-3.8-1.3-5.4.2C4.5 9.6 4.7 13.6 6.5 16.8c1.2 2.2 2.8 3.7 4 3.7.7 0 1-.4 1.5-.4s.8.4 1.5.4c1.2 0 2.8-1.5 4-3.7 1.8-3.2 2-7.2-.1-9.1-1.6-1.5-4-1.2-5.4-.2z"/>',
      line: '<path d="M12 7.5c-1.4-1-3.8-1.3-5.4.2C4.5 9.6 4.7 13.6 6.5 16.8c1.2 2.2 2.8 3.7 4 3.7.7 0 1-.4 1.5-.4s.8.4 1.5.4c1.2 0 2.8-1.5 4-3.7 1.8-3.2 2-7.2-.1-9.1-1.6-1.5-4-1.2-5.4-.2z"/><path d="M12 7.5c0-2 .8-3.3 2-4"/><path d="M13.2 5.1c1.2-1.4 3.4-1.9 4.9-1.3-.5 1.7-2.8 2.7-4.9 1.3z"/>',
    },
    [DsGlyph.Bandage]: {
      fill: '<rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(-45 12 12)"/>',
      line: '<rect x="2.3" y="8.2" width="19.4" height="7.6" rx="3.8" transform="rotate(-45 12 12)"/><path d="M6.8 12h.01M12 6.8h.01M17.2 12h.01M12 17.2h.01"/>',
    },
    [DsGlyph.Tooth]: {
      fill: '<path d="M7.5 3.5c-2.5 0-4 2-4 4.5 0 2.2.9 3.3 1.5 5 .7 2 .8 7.5 2.8 7.5 1.9 0 1.7-5 4.2-5s2.3 5 4.2 5c2 0 2.1-5.5 2.8-7.5.6-1.7 1.5-2.8 1.5-5 0-2.5-1.5-4.5-4-4.5-2 0-2.6 1-4.5 1s-2.5-1-4.5-1z"/>',
      line: '<path d="M7.5 3.5c-2.5 0-4 2-4 4.5 0 2.2.9 3.3 1.5 5 .7 2 .8 7.5 2.8 7.5 1.9 0 1.7-5 4.2-5s2.3 5 4.2 5c2 0 2.1-5.5 2.8-7.5.6-1.7 1.5-2.8 1.5-5 0-2.5-1.5-4.5-4-4.5-2 0-2.6 1-4.5 1s-2.5-1-4.5-1z"/><path d="M6.8 8c.2-1.1.9-1.8 2-1.9"/>',
    },
    [DsGlyph.Stethoscope]: {
      fill: '<circle cx="19" cy="11" r="2.3"/>',
      line: '<path d="M5.5 3.5H4v5a5 5 0 0 0 10 0v-5h-1.5"/><path d="M9 13.5v1a5 5 0 0 0 10 0v-1.2"/><circle cx="19" cy="11" r="2.3"/>',
    },
    [DsGlyph.Drop]: {
      fill: '<path d="M12 3s-6 6.7-6 11a6 6 0 0 0 12 0c0-4.3-6-11-6-11z"/>',
      line: '<path d="M12 3s-6 6.7-6 11a6 6 0 0 0 12 0c0-4.3-6-11-6-11z"/><path d="M9.2 14.5a2.8 2.8 0 0 0 2.3 2.8"/>',
    },
    [DsGlyph.Flame]: {
      fill: '<path d="M12 21a3 3 0 0 0 3-3c0-1.8-1.6-2.8-3-4.6-1.4 1.8-3 2.8-3 4.6a3 3 0 0 0 3 3z"/>',
      line: '<path d="M12 21a6.5 6.5 0 0 0 6.5-6.5c0-3.5-2.3-5.6-3.6-8.5-.9 1.9-2.2 2.9-3.4 3.2.2-2.6-.9-5-2.6-6.2C9 6.3 5.5 9 5.5 14.5A6.5 6.5 0 0 0 12 21z"/>',
    },
    [DsGlyph.Cloche]: {
      fill: '<path d="M4.5 17a7.5 7.5 0 0 1 15 0z"/>',
      line: '<path d="M4.5 17a7.5 7.5 0 0 1 15 0"/><path d="M3 17h18M4.5 20.5h15"/><path d="M12 9.5V7.5M10.5 7.5h3"/>',
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
