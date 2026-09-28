import { Observable } from "rxjs";
import { DevicePushSubscription } from "../models/device-push-subscription.model";

export abstract class DevicePushPort {
  abstract isStandalone(): boolean;

  abstract isSupported(): boolean;

  abstract permission(): NotificationPermission;

  abstract current(): Observable<DevicePushSubscription | null>;

  abstract subscribe(
    vapidPublicKey: string,
  ): Observable<DevicePushSubscription>;

  abstract unsubscribe(): Observable<string | null>;
}
