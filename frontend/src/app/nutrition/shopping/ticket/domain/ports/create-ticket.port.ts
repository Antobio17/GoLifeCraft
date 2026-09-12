import { Observable } from "rxjs";
import { CreateTicketRequest } from "../models/create-ticket-request.model";

export abstract class CreateTicketPort {
  abstract createTicket(request: CreateTicketRequest): Observable<void>;
}
