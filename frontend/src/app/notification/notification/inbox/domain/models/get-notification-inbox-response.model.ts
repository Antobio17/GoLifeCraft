import { NotificationItem } from "./notification-item.model";

export interface GetNotificationInboxResponse {
  meta: {
    pageNumber: number;
    pageSize: number;
    total: number;
    unreadCount: number;
  };
  data: {
    id: string;
    type: string;
    attributes: NotificationItem;
  }[];
}
