import { Provider } from "@angular/core";
import { SubscribeToPushNotificationsPort } from "../../domain/ports/subscribe-to-push-notifications.port";
import { HttpSubscribeToPushNotificationsAdapter } from "../adapters/http-subscribe-to-push-notifications.adapter";
import { SubscribeToPushNotificationsService } from "../../application/services/subscribe-to-push-notifications.service";

export class SubscribeToPushNotificationsProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: SubscribeToPushNotificationsPort,
        useClass: HttpSubscribeToPushNotificationsAdapter,
      },
      {
        provide: SubscribeToPushNotificationsService,
        useFactory: (port: SubscribeToPushNotificationsPort) =>
          new SubscribeToPushNotificationsService(port),
        deps: [SubscribeToPushNotificationsPort],
      },
    ];
  }
}
