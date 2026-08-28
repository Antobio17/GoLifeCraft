import { ProposalPackHint } from "./proposal-pack-hint.model";

export interface ProposalToCook {
  recipeId: string;
  name: string;
  emoji: string;
  demand: number;
  inStock: number;
  inProduction: number;
  deficit: number;
  requiredBy: string[];
  packHint: ProposalPackHint | null;
}
