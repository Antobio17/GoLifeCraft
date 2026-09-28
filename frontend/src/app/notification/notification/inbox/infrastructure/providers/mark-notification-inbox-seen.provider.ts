import { Provider } from "@angular/core";
import { MarkNotificationInboxSeenPort } from "../../domain/ports/mark-notification-inbox-seen.port";
import { HttpMarkNotificationInboxSeenAdapter } from "../adapters/http-mark-notification-inbox-seen.adapter";
import { MarkNotificationInboxSeenService } from "../../application/services/mark-notification-inbox-seen.service";

export class MarkNotificationInboxSeenProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: MarkNotificationInboxSeenPort,
        useClass: HttpMarkNotificationInboxSeenAdapter,
      },
      MarkNotificationInboxSeenService,
    ];
  }
}
