import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { GetUnreadNotificationsCountPort } from "../../domain/ports/get-unread-notifications-count.port";
import { GetUnreadNotificationsCountResponse } from "../../domain/models/get-unread-notifications-count-response.model";

@Injectable()
export class HttpGetUnreadNotificationsCountAdapter implements GetUnreadNotificationsCountPort {
  private http = inject(HttpClient);

  getUnreadCount(): Observable<GetUnreadNotificationsCountResponse> {
    return this.http.get<GetUnreadNotificationsCountResponse>(
      "/api/v1/notification/notifications/unread-count",
    );
  }
}
