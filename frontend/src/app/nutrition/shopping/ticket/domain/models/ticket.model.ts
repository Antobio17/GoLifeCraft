import { TicketAttributes } from "./ticket-attributes.model";

export interface Ticket {
  id: string;
  type: string;
  attributes: TicketAttributes;
}
