import { Provider } from "@angular/core";
import { UpdateNotificationSettingsPort } from "../../domain/ports/update-notification-settings.port";
import { HttpUpdateNotificationSettingsAdapter } from "../adapters/http-update-notification-settings.adapter";
import { UpdateNotificationSettingsService } from "../../application/services/update-notification-settings.service";

export class UpdateNotificationSettingsProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: UpdateNotificationSettingsPort,
        useClass: HttpUpdateNotificationSettingsAdapter,
      },
      UpdateNotificationSettingsService,
    ];
  }
}
