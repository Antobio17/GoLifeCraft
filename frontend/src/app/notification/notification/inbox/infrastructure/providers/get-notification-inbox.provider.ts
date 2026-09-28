import { Provider } from "@angular/core";
import { GetNotificationInboxPort } from "../../domain/ports/get-notification-inbox.port";
import { HttpGetNotificationInboxAdapter } from "../adapters/http-get-notification-inbox.adapter";
import { GetNotificationInboxService } from "../../application/services/get-notification-inbox.service";

export class GetNotificationInboxProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetNotificationInboxPort,
        useClass: HttpGetNotificationInboxAdapter,
      },
      GetNotificationInboxService,
    ];
  }
}
