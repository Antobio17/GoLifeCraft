import { TicketLinkSource } from "./ticket-link-source.model";

export interface TicketItem {
  id: string;
  position: number;
  rawName: string;
  quantity: number;
  rawUnit: string | null;
  unitPrice: number | null;
  totalPrice: number | null;
  articleId: string | null;
  articleName: string | null;
  articleEmoji: string | null;
  articleImage: string | null;
  articlePrice: number | null;
  linkSource: TicketLinkSource | null;
  packUnit: string | null;
  packSize: number | null;
  baseUnit: string | null;
  baseQuantity: number | null;
  received: boolean;
}
