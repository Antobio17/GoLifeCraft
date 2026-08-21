import { Routes } from "@angular/router";
import { blockReadOnlyUserGuard } from "@authorization/login/login/domain/guards/role.guard";
import { GetArticlesProviders } from "@nutrition/catalog/article/infrastructure/providers/get-articles.providers";
import { GetRecipesProviders } from "@nutrition/recipe/recipe/infrastructure/providers/get-recipes.providers";
import { ShoppingWriteProviders } from "@nutrition/shopping/shopping/infrastructure/providers/shopping-write.providers";
import { GetDiaryGoalProviders } from "@nutrition/diary/goal/infrastructure/providers/get-diary-goal.providers";
import { MenuPickerService } from "../../application/services/menu-picker.service";
import { GetMenusProviders } from "../providers/get-menus.providers";
import { GetMenuProviders } from "../providers/get-menu.providers";
import { MenuWriteProviders } from "../providers/menu-write.providers";
import { AutosaveProvider } from "@shared/autosave/infrastructure/providers/autosave.provider";
import { UndoProvider } from "@shared/undo/infrastructure/providers/undo.provider";

export const MENU_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetMenusProviders.getProviders(),
      ...GetMenuProviders.getProviders(),
      ...MenuWriteProviders.getProviders(),
      ...GetArticlesProviders.getProviders(),
      ...GetRecipesProviders.getProviders(),
      ...ShoppingWriteProviders.getProviders(),
      ...GetDiaryGoalProviders.getProviders(),
      MenuPickerService,
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-menus.component").then(
            (m) => m.GetMenusComponent,
          ),
      },
      {
        path: "new",
        canActivate: [blockReadOnlyUserGuard],
        data: { breadcrumb: "menu.breadcrumb.create", draftRoute: true },
        providers: [
          ...AutosaveProvider.getProviders(),
          ...UndoProvider.getProviders(),
        ],
        loadComponent: () =>
          import("../components/get-menu.component").then(
            (m) => m.GetMenuComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "menu.breadcrumb.detail" },
        providers: [
          ...AutosaveProvider.getProviders(),
          ...UndoProvider.getProviders(),
        ],
        loadComponent: () =>
          import("../components/get-menu.component").then(
            (m) => m.GetMenuComponent,
          ),
      },
    ],
  },
];
