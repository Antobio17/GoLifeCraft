import { Observable } from "rxjs";

export abstract class DeleteTicketPort {
  abstract deleteTicket(ticketId: string): Observable<void>;
}
