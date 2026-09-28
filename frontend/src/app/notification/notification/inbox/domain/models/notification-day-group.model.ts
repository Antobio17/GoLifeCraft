import { NotificationRow } from "./notification-row.model";

export interface NotificationDayGroup {
  key: string;
  label: string;
  rows: NotificationRow[];
}
