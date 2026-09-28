import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { GetNotificationInboxPort } from "../../domain/ports/get-notification-inbox.port";
import { GetNotificationInboxResponse } from "../../domain/models/get-notification-inbox-response.model";

@Injectable()
export class HttpGetNotificationInboxAdapter implements GetNotificationInboxPort {
  private http = inject(HttpClient);

  getInbox(
    page: number,
    pageSize: number,
  ): Observable<GetNotificationInboxResponse> {
    const params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    return this.http.get<GetNotificationInboxResponse>(
      "/api/v1/notification/notifications",
      { params },
    );
  }
}
