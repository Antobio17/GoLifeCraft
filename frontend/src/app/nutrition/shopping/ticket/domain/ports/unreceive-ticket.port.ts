import { Observable } from "rxjs";

export abstract class UnreceiveTicketPort {
  abstract unreceiveTicket(ticketId: string): Observable<void>;
}
