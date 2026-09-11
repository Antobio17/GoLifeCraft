import { Observable } from "rxjs";
import { UnreceiveTicketPort } from "../../domain/ports/unreceive-ticket.port";

export class UnreceiveTicketService {
  constructor(private unreceiveTicketPort: UnreceiveTicketPort) {}

  unreceiveTicket(ticketId: string): Observable<void> {
    return this.unreceiveTicketPort.unreceiveTicket(ticketId);
  }
}
