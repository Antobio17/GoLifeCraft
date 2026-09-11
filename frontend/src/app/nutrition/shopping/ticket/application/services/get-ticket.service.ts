import { Observable } from "rxjs";
import { GetTicketPort } from "../../domain/ports/get-ticket.port";
import { GetTicketResponse } from "../../domain/models/get-ticket-response.model";

export class GetTicketService {
  constructor(private getTicketPort: GetTicketPort) {}

  getTicket(ticketId: string): Observable<GetTicketResponse> {
    return this.getTicketPort.getTicket(ticketId);
  }
}
