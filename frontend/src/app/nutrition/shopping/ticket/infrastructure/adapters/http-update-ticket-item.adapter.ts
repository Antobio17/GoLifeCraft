import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateTicketItemPort } from "../../domain/ports/update-ticket-item.port";
import { UpdateTicketItemRequest } from "../../domain/models/update-ticket-item-request.model";

@Injectable()
export class HttpUpdateTicketItemAdapter extends UpdateTicketItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping/tickets";

  updateTicketItem(
    ticketId: string,
    itemId: string,
    request: UpdateTicketItemRequest,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${ticketId}/items/${itemId}`,
      request,
    );
  }
}
