import { Routes } from "@angular/router";
import { GetUsersProviders } from "../providers/get-users.providers";
import { CreateUserProviders } from "../providers/create-user.providers";
import { UpdateUserProviders } from "../providers/update-user.providers";
import { DeleteUserProviders } from "../providers/delete-user.providers";

export const USER_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetUsersProviders.getProviders(),
      ...CreateUserProviders.getProviders(),
      ...UpdateUserProviders.getProviders(),
      ...DeleteUserProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-users.component").then(
            (m) => m.GetUsersComponent,
          ),
      },
      {
        path: "create",
        loadComponent: () =>
          import("../components/create-user.component").then(
            (m) => m.CreateUserComponent,
          ),
        data: { breadcrumb: "user.breadcrumb.create" },
      },
      {
        path: ":id/edit",
        loadComponent: () =>
          import("../components/update-user.component").then(
            (m) => m.UpdateUserComponent,
          ),
        data: { breadcrumb: "user.breadcrumb.edit" },
      },
    ],
  },
];
