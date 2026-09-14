import { RecipePrepMode } from "@nutrition/recipe/recipe/domain/models/recipe-prep-mode.enum";
import { ProposalPackHint } from "./proposal-pack-hint.model";

export interface ProposalToCook {
  recipeId: string;
  name: string;
  emoji: string;
  image: string | null;
  prepMode: RecipePrepMode;
  dueDate: string | null;
  demand: number;
  inStock: number;
  inProduction: number;
  deficit: number;
  requiredBy: string[];
  packHint: ProposalPackHint | null;
}
