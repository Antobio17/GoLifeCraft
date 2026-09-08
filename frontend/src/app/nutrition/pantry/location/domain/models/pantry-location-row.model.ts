import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";

export interface PantryLocationRow {
  id: string;
  name: string;
  emoji: string;
  description: string;
  badges: MacroBadge[];
}
