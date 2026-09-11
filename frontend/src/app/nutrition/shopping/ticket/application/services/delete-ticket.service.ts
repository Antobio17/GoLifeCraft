import { Observable } from "rxjs";
import { DeleteTicketPort } from "../../domain/ports/delete-ticket.port";

export class DeleteTicketService {
  constructor(private deleteTicketPort: DeleteTicketPort) {}

  deleteTicket(ticketId: string): Observable<void> {
    return this.deleteTicketPort.deleteTicket(ticketId);
  }
}
