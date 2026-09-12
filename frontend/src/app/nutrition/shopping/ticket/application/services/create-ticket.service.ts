import { Observable } from "rxjs";
import { CreateTicketPort } from "../../domain/ports/create-ticket.port";
import { CreateTicketRequest } from "../../domain/models/create-ticket-request.model";

export class CreateTicketService {
  constructor(private createTicketPort: CreateTicketPort) {}

  createTicket(request: CreateTicketRequest): Observable<void> {
    return this.createTicketPort.createTicket(request);
  }
}
