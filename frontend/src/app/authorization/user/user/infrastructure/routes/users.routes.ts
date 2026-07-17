import { Routes } from "@angular/router";
import { godOnlyGuard } from "@authorization/login/login/domain/guards/role.guard";

export const USERS_ROUTES: Routes = [
  {
    path: "",
    canActivate: [godOnlyGuard],
    loadComponent: () =>
      import("../components/users.component").then((m) => m.UsersComponent),
  },
];
