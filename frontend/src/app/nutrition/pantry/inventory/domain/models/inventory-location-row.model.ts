import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { InventoryLocation } from "./inventory-location.model";

export interface InventoryLocationRow {
  location: InventoryLocation;
  glyph: DsGlyph;
  color: string;
  name: string;
  description: string;
  badges: MacroBadge[];
}
