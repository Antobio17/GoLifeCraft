import { PackHint } from "./pack-hint.model";

export interface KitchenToCook {
  recipeId: string;
  name: string;
  emoji: string;
  demand: number;
  inStock: number;
  deficit: number;
  productionId?: string;
  packHint?: PackHint;
}
