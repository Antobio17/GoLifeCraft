import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GetDomainEventLogPort } from "../../domain/ports/get-domain-event-log.port";
import { GetDomainEventLogResponse } from "../../domain/models/get-domain-event-log.model";
import {
  DomainEventLogUser,
  DomainEventLog,
} from "../../domain/models/domain-event-log.model";

interface RawDomainEventLogResource {
  id: string;
  attributes: {
    eventName: string;
    aggregateId: string;
    payload: DomainEventLog["payload"];
    occurredOn: string;
    recordedAt: string;
    user: DomainEventLogUser;
  };
}

interface RawIncludedResource {
  id: string;
  attributes: { name: string };
}

interface RawGetDomainEventLogResponse {
  data: RawDomainEventLogResource;
  included?: RawIncludedResource[];
}

@Injectable()
export class HttpGetDomainEventLogAdapter implements GetDomainEventLogPort {
  private http = inject(HttpClient);

  getDomainEventLog(
    domainEventLogId: string,
  ): Observable<GetDomainEventLogResponse> {
    return this.http
      .get<RawGetDomainEventLogResponse>(
        `/api/v1/shared/domain-event-logs/${domainEventLogId}`,
      )
      .pipe(
        map((response) => ({
          data: {
            id: response.data.id,
            eventName: response.data.attributes.eventName,
            aggregateId: response.data.attributes.aggregateId,
            payload: response.data.attributes.payload,
            occurredOn: response.data.attributes.occurredOn,
            recordedAt: response.data.attributes.recordedAt,
            user: response.data.attributes.user,
          },
          included: (response.included ?? []).map((item) => ({
            id: item.id,
            name: item.attributes.name,
          })),
        })),
      );
  }
}
