import { ProductionItemView } from "./production-item-view.model";

export interface ProductionRecipeRow {
  item: ProductionItemView;
  meta: string;
  done: boolean;
  origin: string;
}
