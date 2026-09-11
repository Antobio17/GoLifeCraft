import { Observable } from "rxjs";
import { GetTicketsResponse } from "../models/get-tickets-response.model";

export abstract class GetTicketsPort {
  abstract getTickets(
    page: number,
    pageSize: number,
    filterStatus?: string,
    filterSearch?: string,
  ): Observable<GetTicketsResponse>;
}
