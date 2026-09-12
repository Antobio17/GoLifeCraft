import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateTicketPort } from "../../domain/ports/create-ticket.port";
import { CreateTicketRequest } from "../../domain/models/create-ticket-request.model";

@Injectable()
export class HttpCreateTicketAdapter extends CreateTicketPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/shopping/tickets";

  createTicket(request: CreateTicketRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
