import { Observable } from "rxjs";

export abstract class ReceiveTicketPort {
  abstract receiveTicket(ticketId: string): Observable<void>;
}
