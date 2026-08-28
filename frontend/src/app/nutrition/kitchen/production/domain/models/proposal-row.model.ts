import { ProposalToCook } from "./proposal-to-cook.model";

export interface ProposalRow {
  item: ProposalToCook;
  meta: string;
  hint: string;
  origin: string;
  servings: number;
  selected: boolean;
}
