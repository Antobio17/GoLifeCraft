import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UnreceiveTicketPort } from "../../domain/ports/unreceive-ticket.port";

@Injectable()
export class HttpUnreceiveTicketAdapter extends UnreceiveTicketPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping/tickets";

  unreceiveTicket(ticketId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${ticketId}/receive`);
  }
}
