import { Observable } from "rxjs";
import { SendTestPushNotificationPort } from "../../domain/ports/send-test-push-notification.port";
import { SendTestPushNotificationRequest } from "../../domain/models/send-test-push-notification-request.model";

export class SendTestPushNotificationService {
  constructor(private port: SendTestPushNotificationPort) {}

  sendTest(request: SendTestPushNotificationRequest): Observable<void> {
    return this.port.sendTest(request);
  }
}
