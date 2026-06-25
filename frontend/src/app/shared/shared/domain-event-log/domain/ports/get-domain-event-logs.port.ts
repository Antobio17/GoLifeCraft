import { Observable } from "rxjs";
import { GetDomainEventLogsResponse } from "../models/get-domain-event-logs.model";

export abstract class GetDomainEventLogsPort {
  abstract getDomainEventLogs(
    page: number,
    pageSize: number,
    filterEventName?: string,
    filterDateFrom?: string,
    filterDateTo?: string,
  ): Observable<GetDomainEventLogsResponse>;
}
