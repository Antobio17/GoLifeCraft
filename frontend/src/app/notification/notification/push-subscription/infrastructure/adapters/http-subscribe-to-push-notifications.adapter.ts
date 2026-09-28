import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SubscribeToPushNotificationsPort } from "../../domain/ports/subscribe-to-push-notifications.port";
import { DevicePushSubscription } from "../../domain/models/device-push-subscription.model";

@Injectable()
export class HttpSubscribeToPushNotificationsAdapter implements SubscribeToPushNotificationsPort {
  private http = inject(HttpClient);

  subscribe(subscription: DevicePushSubscription): Observable<void> {
    return this.http.put<void>(
      "/api/v1/notification/push-subscriptions",
      subscription,
    );
  }
}
