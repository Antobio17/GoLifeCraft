import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GetDomainEventLogsPort } from "../../domain/ports/get-domain-event-logs.port";
import { GetDomainEventLogsResponse } from "../../domain/models/get-domain-event-logs.model";

@Injectable()
export class HttpGetDomainEventLogsAdapter implements GetDomainEventLogsPort {
  private http = inject(HttpClient);

  getDomainEventLogs(
    page: number,
    pageSize: number,
    filterEventName?: string,
    filterDateFrom?: string,
    filterDateTo?: string,
  ): Observable<GetDomainEventLogsResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterEventName) {
      params = params.set("filter[eventName]", filterEventName);
    }
    if (filterDateFrom) {
      params = params.set("filter[dateFrom]", filterDateFrom);
    }
    if (filterDateTo) {
      params = params.set("filter[dateTo]", filterDateTo);
    }

    return this.http
      .get<any>("/api/v1/shared/domain-event-logs", { params })
      .pipe(
        map((response) => ({
          meta: response.meta,
          data: response.data.map((item: any) => ({
            id: item.id,
            eventName: item.attributes.eventName,
            aggregateId: item.attributes.aggregateId,
            payload: item.attributes.payload,
            occurredOn: item.attributes.occurredOn,
            recordedAt: item.attributes.recordedAt,
            user: item.attributes.user,
          })),
        })),
      );
  }
}
