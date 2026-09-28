import { Observable } from "rxjs";
import { GetNotificationSettingsResponse } from "../models/get-notification-settings-response.model";

export abstract class GetNotificationSettingsPort {
  abstract getSettings(): Observable<GetNotificationSettingsResponse>;
}
