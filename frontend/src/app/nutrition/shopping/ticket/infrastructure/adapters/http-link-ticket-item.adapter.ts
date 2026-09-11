import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { LinkTicketItemPort } from "../../domain/ports/link-ticket-item.port";

@Injectable()
export class HttpLinkTicketItemAdapter extends LinkTicketItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping/tickets";

  linkTicketItem(
    ticketId: string,
    itemId: string,
    articleId: string,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${ticketId}/items/${itemId}/link`,
      { articleId },
    );
  }
}
