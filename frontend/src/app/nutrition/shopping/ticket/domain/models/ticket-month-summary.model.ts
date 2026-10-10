export interface TicketMonthSummary {
  purchasedOn: string;
  spent: number;
  tickets: number;
  totalItems: number;
  linkedItems: number;
  pendingItems: number;
  pendingTicketId: string | null;
}
