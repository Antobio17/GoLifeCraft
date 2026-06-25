import {
  CenterIncluded,
  DomainEventLog,
  PreventionPlanIncluded,
} from "./domain-event-log.model";

export type DomainEventLogIncluded = PreventionPlanIncluded | CenterIncluded;

export interface GetDomainEventLogResponse {
  data: DomainEventLog;
  included: DomainEventLogIncluded[];
}
