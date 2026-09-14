import { RecipePrepMode } from "@nutrition/recipe/recipe/domain/models/recipe-prep-mode.enum";
import { ProductionItemStatus } from "./production-item-status.model";

export interface ProductionItemView {
  itemId: string;
  recipeId: string;
  name: string;
  emoji: string;
  image: string | null;
  status: ProductionItemStatus;
  prepMode: RecipePrepMode;
  dueDate: string | null;
  servingsPlanned: number;
  servingsCooked: number;
  code: string | null;
  label: string;
  customized: boolean;
  requiredBy: string[];
}
