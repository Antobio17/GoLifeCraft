import { LocationCardBadge } from "@shared/design-system/location-card/domain/models/location-card-badge.model";
import { PantryLocation } from "./pantry-location.model";

export interface PantryLocationRow {
  location: PantryLocation;
  id: string;
  name: string;
  emoji: string;
  description: string;
  badges: LocationCardBadge[];
}
