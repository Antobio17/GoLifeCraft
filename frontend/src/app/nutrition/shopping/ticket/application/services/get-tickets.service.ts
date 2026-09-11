import { Observable } from "rxjs";
import { GetTicketsPort } from "../../domain/ports/get-tickets.port";
import { GetTicketsResponse } from "../../domain/models/get-tickets-response.model";

export class GetTicketsService {
  constructor(private getTicketsPort: GetTicketsPort) {}

  getTickets(
    page: number = 1,
    pageSize: number = 20,
    filterStatus?: string,
    filterSearch?: string,
  ): Observable<GetTicketsResponse> {
    return this.getTicketsPort.getTickets(
      page,
      pageSize,
      filterStatus,
      filterSearch,
    );
  }
}
