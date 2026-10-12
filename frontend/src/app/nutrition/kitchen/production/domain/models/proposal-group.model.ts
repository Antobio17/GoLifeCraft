import { ProposalRow } from "./proposal-row.model";

export interface ProposalGroup {
  key: string;
  title: string;
  caption: string;
  total: string;
  rows: ProposalRow[];
}
