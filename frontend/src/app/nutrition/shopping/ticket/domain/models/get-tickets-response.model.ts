import { GetTicketsMeta } from "./get-tickets-meta.model";
import { Ticket } from "./ticket.model";

export interface GetTicketsResponse {
  meta: GetTicketsMeta;
  data: Ticket[];
}
