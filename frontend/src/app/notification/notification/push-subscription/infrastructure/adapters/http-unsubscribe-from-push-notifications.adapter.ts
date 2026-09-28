import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UnsubscribeFromPushNotificationsPort } from "../../domain/ports/unsubscribe-from-push-notifications.port";
import { UnsubscribeFromPushNotificationsRequest } from "../../domain/models/unsubscribe-from-push-notifications-request.model";

@Injectable()
export class HttpUnsubscribeFromPushNotificationsAdapter implements UnsubscribeFromPushNotificationsPort {
  private http = inject(HttpClient);

  unsubscribe(
    request: UnsubscribeFromPushNotificationsRequest,
  ): Observable<void> {
    return this.http.delete<void>("/api/v1/notification/push-subscriptions", {
      body: request,
    });
  }
}
