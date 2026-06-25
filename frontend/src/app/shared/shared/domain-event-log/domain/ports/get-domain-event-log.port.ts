import { Observable } from "rxjs";
import { GetDomainEventLogResponse } from "../models/get-domain-event-log.model";

export abstract class GetDomainEventLogPort {
  abstract getDomainEventLog(
    domainEventLogId: string,
  ): Observable<GetDomainEventLogResponse>;
}
