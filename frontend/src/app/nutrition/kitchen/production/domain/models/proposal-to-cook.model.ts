import { ProposalPackHint } from "./proposal-pack-hint.model";

export interface ProposalToCook {
  recipeId: string;
  name: string;
  emoji: string;
  image: string | null;
  demand: number;
  inStock: number;
  inProduction: number;
  deficit: number;
  requiredBy: string[];
  packHint: ProposalPackHint | null;
}
