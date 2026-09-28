import { Provider } from "@angular/core";
import { GetNotificationInboxProvider } from "./get-notification-inbox.provider";
import { MarkNotificationInboxSeenProvider } from "./mark-notification-inbox-seen.provider";
import { NotificationInboxViewService } from "../../application/services/notification-inbox-view.service";

export class NotificationInboxProvider {
  static getProviders(): Provider[] {
    return [
      ...GetNotificationInboxProvider.getProviders(),
      ...MarkNotificationInboxSeenProvider.getProviders(),
      NotificationInboxViewService,
    ];
  }
}
