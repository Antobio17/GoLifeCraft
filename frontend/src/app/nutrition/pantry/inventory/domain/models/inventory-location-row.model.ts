import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";
import { InventoryLocation } from "./inventory-location.model";

export interface InventoryLocationRow {
  location: InventoryLocation;
  emoji: string;
  name: string;
  description: string;
  badges: MacroBadge[];
}
