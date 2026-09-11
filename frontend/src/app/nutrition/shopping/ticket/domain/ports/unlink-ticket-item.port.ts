import { Observable } from "rxjs";

export abstract class UnlinkTicketItemPort {
  abstract unlinkTicketItem(ticketId: string, itemId: string): Observable<void>;
}
