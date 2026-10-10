import { TicketRow } from "./ticket-row.model";

export interface TicketMonthGroup {
  key: string;
  title: string;
  countLabel: string;
  rows: TicketRow[];
}
