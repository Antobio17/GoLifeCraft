import { Observable } from "rxjs";
import { UnsubscribeFromPushNotificationsRequest } from "../models/unsubscribe-from-push-notifications-request.model";

export abstract class UnsubscribeFromPushNotificationsPort {
  abstract unsubscribe(
    request: UnsubscribeFromPushNotificationsRequest,
  ): Observable<void>;
}
