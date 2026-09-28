import { NotificationPreference } from "./notification-preference.model";

export interface NotificationSettings {
  timezone: string;
  languageCode: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  preferences: NotificationPreference[];
  leadMinutesOptions: number[];
  languages: string[];
}
