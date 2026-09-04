import { ProposalToCook } from "./proposal-to-cook.model";

export interface ProposalRow {
  item: ProposalToCook;
  imageUrl: string | null;
  meta: string;
  hint: string;
  origin: string;
  servings: number;
  selected: boolean;
}
