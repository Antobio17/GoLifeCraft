import { TicketStatus } from "./ticket-status.model";

export interface TicketAttributes {
  storeName: string;
  supermarketId: string | null;
  supermarketName: string | null;
  purchasedOn: string;
  total: number | null;
  note: string;
  status: TicketStatus;
  totalItems: number;
  linkedItems: number;
  pendingItems: number;
  receivedItems: number;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  updatedByUserId: string;
}
