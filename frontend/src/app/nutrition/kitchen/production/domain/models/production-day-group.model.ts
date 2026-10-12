import { ProductionRecipeRow } from "./production-recipe-row.model";

export interface ProductionDayGroup {
  key: string;
  title: string;
  caption: string;
  total: string;
  rows: ProductionRecipeRow[];
}
