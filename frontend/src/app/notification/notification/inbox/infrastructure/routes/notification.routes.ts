import { Routes } from "@angular/router";
import { NotificationInboxProvider } from "../providers/notification-inbox.provider";

export const NOTIFICATION_ROUTES: Routes = [
  {
    path: "",
    providers: [...NotificationInboxProvider.getProviders()],
    loadComponent: () =>
      import("../components/notifications.component").then(
        (m) => m.NotificationsComponent,
      ),
  },
];
