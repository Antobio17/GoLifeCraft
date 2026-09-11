import { Observable } from "rxjs";
import { GetTicketResponse } from "../models/get-ticket-response.model";

export abstract class GetTicketPort {
  abstract getTicket(ticketId: string): Observable<GetTicketResponse>;
}
