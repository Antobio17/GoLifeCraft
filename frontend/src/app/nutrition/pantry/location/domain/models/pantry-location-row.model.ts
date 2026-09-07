import { LocationCardBadge } from "@shared/design-system/location-card/domain/models/location-card-badge.model";

export interface PantryLocationRow {
  id: string;
  name: string;
  emoji: string;
  description: string;
  badges: LocationCardBadge[];
}
