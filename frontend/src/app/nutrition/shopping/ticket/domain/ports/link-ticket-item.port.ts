import { Observable } from "rxjs";

export abstract class LinkTicketItemPort {
  abstract linkTicketItem(
    ticketId: string,
    itemId: string,
    articleId: string,
  ): Observable<void>;
}
