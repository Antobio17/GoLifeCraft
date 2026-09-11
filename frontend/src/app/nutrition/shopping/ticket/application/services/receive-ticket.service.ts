import { Observable } from "rxjs";
import { ReceiveTicketPort } from "../../domain/ports/receive-ticket.port";

export class ReceiveTicketService {
  constructor(private receiveTicketPort: ReceiveTicketPort) {}

  receiveTicket(ticketId: string): Observable<void> {
    return this.receiveTicketPort.receiveTicket(ticketId);
  }
}
