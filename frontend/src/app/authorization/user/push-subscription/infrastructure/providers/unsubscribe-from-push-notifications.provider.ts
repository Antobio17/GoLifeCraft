import { Provider } from "@angular/core";
import { UnsubscribeFromPushNotificationsPort } from "../../domain/ports/unsubscribe-from-push-notifications.port";
import { HttpUnsubscribeFromPushNotificationsAdapter } from "../adapters/http-unsubscribe-from-push-notifications.adapter";
import { UnsubscribeFromPushNotificationsService } from "../../application/services/unsubscribe-from-push-notifications.service";

export class UnsubscribeFromPushNotificationsProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: UnsubscribeFromPushNotificationsPort,
        useClass: HttpUnsubscribeFromPushNotificationsAdapter,
      },
      {
        provide: UnsubscribeFromPushNotificationsService,
        useFactory: (port: UnsubscribeFromPushNotificationsPort) =>
          new UnsubscribeFromPushNotificationsService(port),
        deps: [UnsubscribeFromPushNotificationsPort],
      },
    ];
  }
}
