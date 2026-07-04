import { Routes } from "@angular/router";
import { authGuard } from "./authorization/login/login/domain/guards/auth.guard";
import { blockReadOnlyUserGuard } from "./authorization/login/login/domain/guards/role.guard";

export const APP_ROUTES: Routes = [
  {
    path: "login",
    loadChildren: () =>
      import("./authorization/login/login/infrastructure/routes/login.routes").then(
        (m) => m.LOGIN_ROUTES,
      ),
  },
  {
    path: "",
    canActivate: [authGuard],
    children: [
      {
        path: "dashboard",
        data: { breadcrumb: null },
        loadChildren: () =>
          import("./dashboard/dashboard/infrastructure/routes/dashboard.routes").then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: "users",
        canActivate: [blockReadOnlyUserGuard],
        data: { breadcrumb: "user.breadcrumb.list" },
        loadChildren: () =>
          import("./authorization/user/user/infrastructure/routes/user.routes").then(
            (m) => m.USER_ROUTES,
          ),
      },
      {
        path: "reports",
        canActivate: [blockReadOnlyUserGuard],
        data: { breadcrumb: null },
        children: [
          {
            path: "logs",
            data: { breadcrumb: "navbar.logs" },
            loadChildren: () =>
              import("./shared/shared/domain-event-log/infrastructure/routes/domain-event-log.routes").then(
                (m) => m.DOMAIN_EVENT_LOG_ROUTES,
              ),
          },
        ],
      },
      {
        path: "me",
        data: { breadcrumb: "profile.breadcrumb" },
        loadComponent: () =>
          import("./authorization/user/user/infrastructure/components/my-profile.component").then(
            (m) => m.MyProfileComponent,
          ),
      },
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },
];
