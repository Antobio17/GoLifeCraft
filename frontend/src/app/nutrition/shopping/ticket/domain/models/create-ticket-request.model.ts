import { TicketDraftLine } from "./ticket-draft-line.model";

export interface CreateTicketRequest {
  id: string;
  storeName: string;
  supermarketId: string | null;
  purchasedOn: string;
  total: number | null;
  note: string;
  lines: TicketDraftLine[];
}
