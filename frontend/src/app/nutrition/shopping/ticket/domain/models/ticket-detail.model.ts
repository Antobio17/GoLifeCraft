import { TicketDetailAttributes } from "./ticket-detail-attributes.model";

export interface TicketDetail {
  id: string;
  type: string;
  attributes: TicketDetailAttributes;
}
