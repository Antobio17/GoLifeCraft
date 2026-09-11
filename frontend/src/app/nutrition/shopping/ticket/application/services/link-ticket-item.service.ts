import { Observable } from "rxjs";
import { LinkTicketItemPort } from "../../domain/ports/link-ticket-item.port";

export class LinkTicketItemService {
  constructor(private linkTicketItemPort: LinkTicketItemPort) {}

  linkTicketItem(
    ticketId: string,
    itemId: string,
    articleId: string,
  ): Observable<void> {
    return this.linkTicketItemPort.linkTicketItem(ticketId, itemId, articleId);
  }
}
