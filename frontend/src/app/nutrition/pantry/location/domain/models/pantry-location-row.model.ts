import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";

export interface PantryLocationRow {
  id: string;
  name: string;
  glyph: DsGlyph;
  color: string;
  meta: string;
  figure: string;
  figureLabel: string;
}
