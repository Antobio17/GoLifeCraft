import { NotificationSettings } from "./notification-settings.model";

export interface GetNotificationSettingsResponse {
  data: {
    id: string;
    type: string;
    attributes: NotificationSettings;
  };
}
