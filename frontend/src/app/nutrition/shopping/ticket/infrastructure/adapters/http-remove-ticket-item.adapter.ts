import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RemoveTicketItemPort } from "../../domain/ports/remove-ticket-item.port";

@Injectable()
export class HttpRemoveTicketItemAdapter extends RemoveTicketItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping/tickets";

  removeTicketItem(ticketId: string, itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${ticketId}/items/${itemId}`);
  }
}
