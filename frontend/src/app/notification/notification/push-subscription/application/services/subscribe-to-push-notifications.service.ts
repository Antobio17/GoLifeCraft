import { Observable } from "rxjs";
import { SubscribeToPushNotificationsPort } from "../../domain/ports/subscribe-to-push-notifications.port";
import { DevicePushSubscription } from "../../domain/models/device-push-subscription.model";

export class SubscribeToPushNotificationsService {
  constructor(private port: SubscribeToPushNotificationsPort) {}

  subscribe(subscription: DevicePushSubscription): Observable<void> {
    return this.port.subscribe(subscription);
  }
}
