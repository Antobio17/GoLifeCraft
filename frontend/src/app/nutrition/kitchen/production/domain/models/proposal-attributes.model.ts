import { ProposalCovered } from "./proposal-covered.model";
import { ProposalToCook } from "./proposal-to-cook.model";

export interface ProposalAttributes {
  fromDate: string;
  toDate: string;
  days: number;
  toCook: ProposalToCook[];
  covered: ProposalCovered[];
}
