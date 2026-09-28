import { Observable } from "rxjs";
import { SendTestPushNotificationRequest } from "../models/send-test-push-notification-request.model";

export abstract class SendTestPushNotificationPort {
  abstract sendTest(request: SendTestPushNotificationRequest): Observable<void>;
}
