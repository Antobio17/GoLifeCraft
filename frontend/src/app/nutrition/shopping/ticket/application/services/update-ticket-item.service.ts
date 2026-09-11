import { Observable } from "rxjs";
import { UpdateTicketItemPort } from "../../domain/ports/update-ticket-item.port";
import { UpdateTicketItemRequest } from "../../domain/models/update-ticket-item-request.model";

export class UpdateTicketItemService {
  constructor(private updateTicketItemPort: UpdateTicketItemPort) {}

  updateTicketItem(
    ticketId: string,
    itemId: string,
    request: UpdateTicketItemRequest,
  ): Observable<void> {
    return this.updateTicketItemPort.updateTicketItem(
      ticketId,
      itemId,
      request,
    );
  }
}
