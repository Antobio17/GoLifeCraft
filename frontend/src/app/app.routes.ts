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
    path: "register",
    loadChildren: () =>
      import("./authorization/register/register/infrastructure/routes/register.routes").then(
        (m) => m.REGISTER_ROUTES,
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
        path: "supermarkets",
        data: { breadcrumb: "supermarket.breadcrumb.list" },
        loadChildren: () =>
          import(
            "./nutrition/catalog/supermarket/infrastructure/routes/supermarket.routes"
          ).then((m) => m.SUPERMARKET_ROUTES),
      },
      {
        path: "categories",
        data: { breadcrumb: "category.breadcrumb.list" },
        loadChildren: () =>
          import(
            "./nutrition/catalog/category/infrastructure/routes/category.routes"
          ).then((m) => m.CATEGORY_ROUTES),
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
