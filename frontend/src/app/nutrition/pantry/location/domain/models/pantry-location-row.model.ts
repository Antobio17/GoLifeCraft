import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";

export interface PantryLocationRow {
  id: string;
  name: string;
  glyph: DsGlyph;
  color: string;
  description: string;
  badges: MacroBadge[];
}
