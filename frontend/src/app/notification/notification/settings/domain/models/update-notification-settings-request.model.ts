import { NotificationPreference } from "./notification-preference.model";

export interface UpdateNotificationSettingsRequest {
  timezone: string;
  languageCode: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  preferences: Pick<
    NotificationPreference,
    "type" | "enabled" | "time" | "leadMinutes"
  >[];
}
