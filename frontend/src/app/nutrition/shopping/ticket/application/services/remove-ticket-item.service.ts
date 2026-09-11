import { Observable } from "rxjs";
import { RemoveTicketItemPort } from "../../domain/ports/remove-ticket-item.port";

export class RemoveTicketItemService {
  constructor(private removeTicketItemPort: RemoveTicketItemPort) {}

  removeTicketItem(ticketId: string, itemId: string): Observable<void> {
    return this.removeTicketItemPort.removeTicketItem(ticketId, itemId);
  }
}
