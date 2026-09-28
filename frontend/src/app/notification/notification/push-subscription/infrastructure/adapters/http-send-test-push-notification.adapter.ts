import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SendTestPushNotificationPort } from "../../domain/ports/send-test-push-notification.port";
import { SendTestPushNotificationRequest } from "../../domain/models/send-test-push-notification-request.model";

@Injectable()
export class HttpSendTestPushNotificationAdapter implements SendTestPushNotificationPort {
  private http = inject(HttpClient);

  sendTest(request: SendTestPushNotificationRequest): Observable<void> {
    return this.http.post<void>("/api/v1/notification/push/test", request);
  }
}
