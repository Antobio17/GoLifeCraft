import { Provider } from "@angular/core";
import { GetNotificationSettingsProvider } from "./get-notification-settings.provider";
import { UpdateNotificationSettingsProvider } from "./update-notification-settings.provider";
import { NotificationPreferenceViewService } from "../../application/services/notification-preference-view.service";
import { PushNotificationsProvider } from "@notification/notification/push-subscription/infrastructure/providers/push-notifications.provider";
import { AutosaveProvider } from "@shared/autosave/infrastructure/providers/autosave.provider";

export class NotificationSettingsProvider {
  static getProviders(): Provider[] {
    return [
      ...GetNotificationSettingsProvider.getProviders(),
      ...UpdateNotificationSettingsProvider.getProviders(),
      ...PushNotificationsProvider.getProviders(),
      ...AutosaveProvider.getProviders(),
      NotificationPreferenceViewService,
    ];
  }
}
