export interface NotificationPreference {
  type: string;
  module: string;
  enabled: boolean;
  time: string | null;
  leadMinutes: number | null;
}
