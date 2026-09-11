export interface TicketRow {
  id: string;
  storeLabel: string;
  dateLabel: string;
  totalLabel: string;
  statusLabel: string;
  received: boolean;
  progressPercent: number;
  linkedLabel: string;
  pendingLabel: string;
}
