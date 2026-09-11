import { Observable } from "rxjs";

export abstract class RemoveTicketItemPort {
  abstract removeTicketItem(ticketId: string, itemId: string): Observable<void>;
}
