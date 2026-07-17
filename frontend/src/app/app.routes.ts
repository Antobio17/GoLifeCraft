import { Routes } from "@angular/router";
import { authGuard } from "./authorization/login/login/domain/guards/auth.guard";

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
    path: "auth/verify-email",
    loadChildren: () =>
      import("./authorization/verify-email/verify-email/infrastructure/routes/verify-email.routes").then(
        (m) => m.VERIFY_EMAIL_ROUTES,
      ),
  },
  {
    path: "auth/forgot-password",
    loadChildren: () =>
      import("./authorization/forgot-password/forgot-password/infrastructure/routes/forgot-password.routes").then(
        (m) => m.FORGOT_PASSWORD_ROUTES,
      ),
  },
  {
    path: "auth/reset-password",
    loadChildren: () =>
      import("./authorization/reset-password/reset-password/infrastructure/routes/reset-password.routes").then(
        (m) => m.RESET_PASSWORD_ROUTES,
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
        path: "diary",
        data: { breadcrumb: "diary.breadcrumb.list" },
        loadChildren: () =>
          import("./nutrition/diary/diary/infrastructure/routes/diary.routes").then(
            (m) => m.DIARY_ROUTES,
          ),
      },
      {
        path: "supermarkets",
        data: { breadcrumb: "supermarket.breadcrumb.list" },
        loadChildren: () =>
          import("./nutrition/catalog/supermarket/infrastructure/routes/supermarket.routes").then(
            (m) => m.SUPERMARKET_ROUTES,
          ),
      },
      {
        path: "categories",
        data: { breadcrumb: "category.breadcrumb.list" },
        loadChildren: () =>
          import("./nutrition/catalog/category/infrastructure/routes/category.routes").then(
            (m) => m.CATEGORY_ROUTES,
          ),
      },
      {
        path: "catalog",
        data: { breadcrumb: "article.breadcrumb.list" },
        loadChildren: () =>
          import("./nutrition/catalog/article/infrastructure/routes/article.routes").then(
            (m) => m.ARTICLE_ROUTES,
          ),
      },
      {
        path: "recipes",
        data: { breadcrumb: "recipe.breadcrumb.list" },
        loadChildren: () =>
          import("./nutrition/recipe/recipe/infrastructure/routes/recipe.routes").then(
            (m) => m.RECIPE_ROUTES,
          ),
      },
      {
        path: "gym",
        data: { breadcrumb: "session.breadcrumb.list" },
        loadChildren: () =>
          import("./gym/infrastructure/routes/gym.routes").then(
            (m) => m.GYM_ROUTES,
          ),
      },
      {
        path: "me",
        data: { breadcrumb: "profile.breadcrumb" },
        loadComponent: () =>
          import("./authorization/user/user/infrastructure/components/my-profile.component").then(
            (m) => m.MyProfileComponent,
          ),
      },
      {
        path: "users",
        data: { breadcrumb: "users.breadcrumb" },
        loadChildren: () =>
          import("./authorization/user/user/infrastructure/routes/users.routes").then(
            (m) => m.USERS_ROUTES,
          ),
      },
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },
];
