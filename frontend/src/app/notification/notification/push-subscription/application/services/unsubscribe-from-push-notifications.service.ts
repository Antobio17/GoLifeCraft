import { Observable } from "rxjs";
import { UnsubscribeFromPushNotificationsPort } from "../../domain/ports/unsubscribe-from-push-notifications.port";
import { UnsubscribeFromPushNotificationsRequest } from "../../domain/models/unsubscribe-from-push-notifications-request.model";

export class UnsubscribeFromPushNotificationsService {
  constructor(private port: UnsubscribeFromPushNotificationsPort) {}

  unsubscribe(
    request: UnsubscribeFromPushNotificationsRequest,
  ): Observable<void> {
    return this.port.unsubscribe(request);
  }
}
