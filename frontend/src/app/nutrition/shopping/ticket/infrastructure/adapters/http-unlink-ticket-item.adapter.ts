import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UnlinkTicketItemPort } from "../../domain/ports/unlink-ticket-item.port";

@Injectable()
export class HttpUnlinkTicketItemAdapter extends UnlinkTicketItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping/tickets";

  unlinkTicketItem(ticketId: string, itemId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${ticketId}/items/${itemId}/link`,
    );
  }
}
