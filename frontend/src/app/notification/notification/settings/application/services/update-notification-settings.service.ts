import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { UpdateNotificationSettingsPort } from "../../domain/ports/update-notification-settings.port";
import { UpdateNotificationSettingsRequest } from "../../domain/models/update-notification-settings-request.model";

export class UpdateNotificationSettingsService {
  private port = inject(UpdateNotificationSettingsPort);

  updateSettings(request: UpdateNotificationSettingsRequest): Observable<void> {
    return this.port.updateSettings(request);
  }
}
