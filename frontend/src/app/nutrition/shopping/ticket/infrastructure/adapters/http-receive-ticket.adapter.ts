import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ReceiveTicketPort } from "../../domain/ports/receive-ticket.port";

@Injectable()
export class HttpReceiveTicketAdapter extends ReceiveTicketPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping/tickets";

  receiveTicket(ticketId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${ticketId}/receive`, {});
  }
}
