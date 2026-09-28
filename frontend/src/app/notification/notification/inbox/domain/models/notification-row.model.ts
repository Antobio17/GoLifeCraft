import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

export interface NotificationRow {
  id: string;
  icon: DsIconName;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  url: string | null;
}
