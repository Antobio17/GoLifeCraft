import { NotificationPreferenceRow } from "./notification-preference-row.model";

export interface NotificationModuleGroup {
  module: string;
  label: string;
  rows: NotificationPreferenceRow[];
}
