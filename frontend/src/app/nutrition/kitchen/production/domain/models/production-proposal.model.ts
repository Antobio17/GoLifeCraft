import { ProposalAttributes } from "./proposal-attributes.model";

export interface ProductionProposal {
  id: string;
  type: string;
  attributes: ProposalAttributes;
}
