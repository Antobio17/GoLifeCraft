import { Provider } from "@angular/core";
import { GetUnreadNotificationsCountPort } from "../../domain/ports/get-unread-notifications-count.port";
import { HttpGetUnreadNotificationsCountAdapter } from "../adapters/http-get-unread-notifications-count.adapter";
import { UnreadNotificationsService } from "../../application/services/unread-notifications.service";

export class UnreadNotificationsProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetUnreadNotificationsCountPort,
        useClass: HttpGetUnreadNotificationsCountAdapter,
      },
      UnreadNotificationsService,
    ];
  }
}
