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
  {
    path: "settings/:module",
    data: { breadcrumb: "notifications.settings.breadcrumb" },
    loadComponent: () =>
      import("@notification/notification/settings/infrastructure/components/notification-module-settings.component").then(
        (m) => m.NotificationModuleSettingsComponent,
      ),
  },
];
