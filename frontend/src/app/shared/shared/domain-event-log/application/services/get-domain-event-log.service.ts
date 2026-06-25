import { Observable } from "rxjs";
import { GetDomainEventLogPort } from "../../domain/ports/get-domain-event-log.port";
import { GetDomainEventLogResponse } from "../../domain/models/get-domain-event-log.model";

export class GetDomainEventLogService {
  constructor(private port: GetDomainEventLogPort) {}

  getDomainEventLog(
    domainEventLogId: string,
  ): Observable<GetDomainEventLogResponse> {
    return this.port.getDomainEventLog(domainEventLogId);
  }
}
