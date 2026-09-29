import { Provider } from "@angular/core";
import { ChangeNotificationReadStateProvider } from "./change-notification-read-state.provider";
import { DismissNotificationProvider } from "./dismiss-notification.provider";
import { GetNotificationInboxProvider } from "./get-notification-inbox.provider";
import { MarkNotificationInboxSeenProvider } from "./mark-notification-inbox-seen.provider";
import { NotificationInboxViewService } from "../../application/services/notification-inbox-view.service";

export class NotificationInboxProvider {
  static getProviders(): Provider[] {
    return [
      ...GetNotificationInboxProvider.getProviders(),
      ...MarkNotificationInboxSeenProvider.getProviders(),
      ...ChangeNotificationReadStateProvider.getProviders(),
      ...DismissNotificationProvider.getProviders(),
      NotificationInboxViewService,
    ];
  }
}
