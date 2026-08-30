import { ProductionItemStatus } from "./production-item-status.model";

export interface ProductionItemView {
  itemId: string;
  recipeId: string;
  name: string;
  emoji: string;
  status: ProductionItemStatus;
  servingsPlanned: number;
  servingsCooked: number;
  code: string | null;
  label: string;
  customized: boolean;
  requiredBy: string[];
}
