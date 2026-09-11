import { TicketItem } from "./ticket-item.model";

export interface TicketLineRow {
  key: string;
  item: TicketItem;
  quantityLabel: string;
  unitLabel: string;
  priceLabel: string;
  totalPriceLabel: string;
  articleLabel: string | null;
  articleEmoji: string;
  articleImageUrl: string | null;
  stockLabel: string | null;
  linked: boolean;
  received: boolean;
}
