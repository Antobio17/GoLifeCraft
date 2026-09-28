import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { MarkNotificationInboxSeenPort } from "../../domain/ports/mark-notification-inbox-seen.port";

@Injectable()
export class HttpMarkNotificationInboxSeenAdapter implements MarkNotificationInboxSeenPort {
  private http = inject(HttpClient);

  markSeen(): Observable<void> {
    return this.http.post<void>("/api/v1/notification/notifications/seen", {});
  }
}
