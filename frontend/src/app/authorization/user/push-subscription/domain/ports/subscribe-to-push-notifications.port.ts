import { Observable } from "rxjs";
import { DevicePushSubscription } from "../models/device-push-subscription.model";

export abstract class SubscribeToPushNotificationsPort {
  abstract subscribe(subscription: DevicePushSubscription): Observable<void>;
}
