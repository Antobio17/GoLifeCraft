import { Observable } from "rxjs";
import { GetDomainEventLogsPort } from "../../domain/ports/get-domain-event-logs.port";
import { GetDomainEventLogsResponse } from "../../domain/models/get-domain-event-logs.model";

export class GetDomainEventLogsService {
  constructor(private port: GetDomainEventLogsPort) {}

  getDomainEventLogs(
    page: number,
    pageSize: number,
    filterEventName?: string,
    filterDateFrom?: string,
    filterDateTo?: string,
  ): Observable<GetDomainEventLogsResponse> {
    return this.port.getDomainEventLogs(
      page,
      pageSize,
      filterEventName,
      filterDateFrom,
      filterDateTo,
    );
  }
}
