import { ProductionItemView } from "./production-item-view.model";

export interface ProductionRecipeRow {
  item: ProductionItemView;
  imageUrl: string | null;
  meta: string;
  done: boolean;
  origin: string;
}
