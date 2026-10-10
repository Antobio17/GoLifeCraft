import { ProposalDayStatus } from "./proposal-day-status.enum";

export interface ProposalDay {
  date: string;
  status: ProposalDayStatus;
  demand: number;
  deficit: number;
}
