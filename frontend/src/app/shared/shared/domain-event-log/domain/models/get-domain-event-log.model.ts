import { DomainEventLog } from "./domain-event-log.model";

export interface DomainEventLogIncluded {
  id: string;
  name: string;
}

export interface GetDomainEventLogResponse {
  data: DomainEventLog;
  included: DomainEventLogIncluded[];
}
