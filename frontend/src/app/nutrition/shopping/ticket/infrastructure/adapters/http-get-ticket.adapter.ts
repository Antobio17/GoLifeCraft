import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetTicketPort } from "../../domain/ports/get-ticket.port";
import { GetTicketResponse } from "../../domain/models/get-ticket-response.model";

@Injectable()
export class HttpGetTicketAdapter extends GetTicketPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping/tickets";

  getTicket(ticketId: string): Observable<GetTicketResponse> {
    return this.http.get<GetTicketResponse>(`${this.apiUrl}/${ticketId}`);
  }
}
