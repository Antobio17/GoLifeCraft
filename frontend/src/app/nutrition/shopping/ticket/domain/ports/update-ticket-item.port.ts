import { Observable } from "rxjs";
import { UpdateTicketItemRequest } from "../models/update-ticket-item-request.model";

export abstract class UpdateTicketItemPort {
  abstract updateTicketItem(
    ticketId: string,
    itemId: string,
    request: UpdateTicketItemRequest,
  ): Observable<void>;
}
