import { TicketAttributes } from "./ticket-attributes.model";
import { TicketItem } from "./ticket-item.model";

export interface TicketDetailAttributes extends TicketAttributes {
  linkedAmount: number;
  items: TicketItem[];
}
