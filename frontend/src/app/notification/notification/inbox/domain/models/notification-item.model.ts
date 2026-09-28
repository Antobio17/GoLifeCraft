import { NotificationParams } from "./notification-params.model";

export interface NotificationItem {
  type: string;
  module: string;
  params: NotificationParams;
  title: string;
  body: string;
  url: string | null;
  pushed: boolean;
  unread: boolean;
  deliveredAt: string;
}
