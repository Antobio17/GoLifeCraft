import { DomainEventLog } from "./domain-event-log.model";

export interface GetDomainEventLogsResponse {
  meta: {
    pageNumber: number;
    pageSize: number;
    total: number;
  };
  data: DomainEventLog[];
}
