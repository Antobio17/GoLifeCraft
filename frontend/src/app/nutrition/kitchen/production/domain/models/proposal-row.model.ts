import { ProposalToCook } from "./proposal-to-cook.model";

export interface ProposalRow {
  slot: string;
  item: ProposalToCook;
  imageUrl: string | null;
  meta: string;
  hint: string;
  packAction: string;
  origin: string;
  amount: string;
  ariaLabel: string;
  servings: number;
  selected: boolean;
}
