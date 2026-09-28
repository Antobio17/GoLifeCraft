import { Provider } from "@angular/core";
import { GetPushNotificationsConfigPort } from "../../domain/ports/get-push-notifications-config.port";
import { HttpGetPushNotificationsConfigAdapter } from "../adapters/http-get-push-notifications-config.adapter";
import { GetPushNotificationsConfigService } from "../../application/services/get-push-notifications-config.service";

export class GetPushNotificationsConfigProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetPushNotificationsConfigPort,
        useClass: HttpGetPushNotificationsConfigAdapter,
      },
      {
        provide: GetPushNotificationsConfigService,
        useFactory: (port: GetPushNotificationsConfigPort) =>
          new GetPushNotificationsConfigService(port),
        deps: [GetPushNotificationsConfigPort],
      },
    ];
  }
}
