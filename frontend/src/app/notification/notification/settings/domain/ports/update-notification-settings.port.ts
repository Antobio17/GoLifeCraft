import { Observable } from "rxjs";
import { UpdateNotificationSettingsRequest } from "../models/update-notification-settings-request.model";

export abstract class UpdateNotificationSettingsPort {
  abstract updateSettings(
    request: UpdateNotificationSettingsRequest,
  ): Observable<void>;
}
