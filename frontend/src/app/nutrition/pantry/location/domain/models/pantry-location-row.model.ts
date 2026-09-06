import { PantryLocation } from "./pantry-location.model";

export interface PantryLocationRow {
  location: PantryLocation;
  id: string;
  name: string;
  emoji: string;
  description: string;
  articlesLabel: string;
  recipesLabel: string;
}
