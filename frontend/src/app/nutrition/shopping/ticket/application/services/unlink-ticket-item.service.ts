import { Observable } from "rxjs";
import { UnlinkTicketItemPort } from "../../domain/ports/unlink-ticket-item.port";

export class UnlinkTicketItemService {
  constructor(private unlinkTicketItemPort: UnlinkTicketItemPort) {}

  unlinkTicketItem(ticketId: string, itemId: string): Observable<void> {
    return this.unlinkTicketItemPort.unlinkTicketItem(ticketId, itemId);
  }
}
