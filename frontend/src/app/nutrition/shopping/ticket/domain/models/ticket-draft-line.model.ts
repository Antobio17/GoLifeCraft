export interface TicketDraftLine {
  rawName: string;
  quantity: number;
  rawUnit: string | null;
  unitPrice: number | null;
  totalPrice: number | null;
}
