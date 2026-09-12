import { Injectable, inject } from "@angular/core";
import { TicketDraftLine } from "../../domain/models/ticket-draft-line.model";
import { TicketDraftRow } from "../../domain/models/ticket-draft-row.model";
import { TicketViewService } from "./ticket-view.service";

@Injectable({ providedIn: "root" })
export class TicketDraftViewService {
  private ticketView = inject(TicketViewService);

  private readonly tolerance = 0.01;

  money(value: number): string {
    return this.ticketView.money(value);
  }

  rowsOf(lines: TicketDraftLine[]): TicketDraftRow[] {
    return lines.map((line, index) => ({
      index,
      rawName: line.rawName,
      quantityLabel: this.quantityLabel(line),
      priceLabel: this.ticketView.money(this.lineTotal(line)),
    }));
  }

  linesTotal(lines: TicketDraftLine[]): number {
    return this.round(
      lines.reduce((total, line) => total + this.lineTotal(line), 0),
    );
  }

  difference(total: number | null, lines: TicketDraftLine[]): number | null {
    if (null === total) return null;

    const difference = this.round(total - this.linesTotal(lines));

    return Math.abs(difference) < this.tolerance ? null : difference;
  }

  without(lines: TicketDraftLine[], index: number): TicketDraftLine[] {
    return lines.filter((line, position) => position !== index);
  }

  todayIso(): string {
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, "0");
    const day = `${today.getDate()}`.padStart(2, "0");

    return `${today.getFullYear()}-${month}-${day}`;
  }

  private lineTotal(line: TicketDraftLine): number {
    if (null !== line.totalPrice) return line.totalPrice;

    if (null === line.unitPrice) return 0;

    return line.unitPrice * line.quantity;
  }

  private quantityLabel(line: TicketDraftLine): string {
    const quantity = new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: 3,
    }).format(line.quantity);

    if (null === line.rawUnit) return `× ${quantity}`;

    return `${quantity} ${line.rawUnit}`;
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
