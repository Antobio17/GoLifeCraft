import { Provider } from "@angular/core";
import { SendTestPushNotificationPort } from "../../domain/ports/send-test-push-notification.port";
import { HttpSendTestPushNotificationAdapter } from "../adapters/http-send-test-push-notification.adapter";
import { SendTestPushNotificationService } from "../../application/services/send-test-push-notification.service";

export class SendTestPushNotificationProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: SendTestPushNotificationPort,
        useClass: HttpSendTestPushNotificationAdapter,
      },
      {
        provide: SendTestPushNotificationService,
        useFactory: (port: SendTestPushNotificationPort) =>
          new SendTestPushNotificationService(port),
        deps: [SendTestPushNotificationPort],
      },
    ];
  }
}
