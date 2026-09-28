import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { GetNotificationSettingsPort } from "../../domain/ports/get-notification-settings.port";
import { GetNotificationSettingsResponse } from "../../domain/models/get-notification-settings-response.model";

export class GetNotificationSettingsService {
  private port = inject(GetNotificationSettingsPort);

  getSettings(): Observable<GetNotificationSettingsResponse> {
    return this.port.getSettings();
  }
}
