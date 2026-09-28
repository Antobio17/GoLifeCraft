import { Provider } from "@angular/core";
import { GetNotificationSettingsPort } from "../../domain/ports/get-notification-settings.port";
import { HttpGetNotificationSettingsAdapter } from "../adapters/http-get-notification-settings.adapter";
import { GetNotificationSettingsService } from "../../application/services/get-notification-settings.service";

export class GetNotificationSettingsProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetNotificationSettingsPort,
        useClass: HttpGetNotificationSettingsAdapter,
      },
      GetNotificationSettingsService,
    ];
  }
}
