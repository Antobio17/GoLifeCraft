import { Routes } from "@angular/router";
import { blockReadOnlyUserGuard } from "@authorization/login/login/domain/guards/role.guard";
import { GetCategoriesProviders } from "../providers/get-categories.providers";
import { GetCategoryProviders } from "../providers/get-category.providers";
import { CreateCategoryProviders } from "../providers/create-category.providers";
import { UpdateCategoryProviders } from "../providers/update-category.providers";

export const CATEGORY_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetCategoriesProviders.getProviders(),
      ...GetCategoryProviders.getProviders(),
      ...CreateCategoryProviders.getProviders(),
      ...UpdateCategoryProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-categories.component").then(
            (m) => m.GetCategoriesComponent,
          ),
      },
      {
        path: "create",
        canActivate: [blockReadOnlyUserGuard],
        data: { breadcrumb: "category.breadcrumb.create" },
        loadComponent: () =>
          import("../components/create-category.component").then(
            (m) => m.CreateCategoryComponent,
          ),
      },
      {
        path: ":id/edit",
        canActivate: [blockReadOnlyUserGuard],
        data: { breadcrumb: "category.breadcrumb.edit" },
        loadComponent: () =>
          import("../components/update-category.component").then(
            (m) => m.UpdateCategoryComponent,
          ),
      },
    ],
  },
];
