import { Provider } from "@angular/core";
import { DevicePushPort } from "../../domain/ports/device-push.port";
import { BrowserDevicePushAdapter } from "../adapters/browser-device-push.adapter";
import { PushNotificationsService } from "../../application/services/push-notifications.service";
import { GetPushNotificationsConfigProvider } from "./get-push-notifications-config.provider";
import { SubscribeToPushNotificationsProvider } from "./subscribe-to-push-notifications.provider";
import { UnsubscribeFromPushNotificationsProvider } from "./unsubscribe-from-push-notifications.provider";
import { SendTestPushNotificationProvider } from "./send-test-push-notification.provider";

export class PushNotificationsProvider {
  static getProviders(): Provider[] {
    return [
      ...GetPushNotificationsConfigProvider.getProviders(),
      ...SubscribeToPushNotificationsProvider.getProviders(),
      ...UnsubscribeFromPushNotificationsProvider.getProviders(),
      ...SendTestPushNotificationProvider.getProviders(),
      { provide: DevicePushPort, useClass: BrowserDevicePushAdapter },
      PushNotificationsService,
    ];
  }
}
