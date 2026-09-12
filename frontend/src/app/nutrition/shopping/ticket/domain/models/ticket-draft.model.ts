import { TicketDraftLine } from "./ticket-draft-line.model";

export interface TicketDraft {
  storeName: string | null;
  supermarketId: string | null;
  purchasedOn: string | null;
  total: number | null;
  lines: TicketDraftLine[];
}
