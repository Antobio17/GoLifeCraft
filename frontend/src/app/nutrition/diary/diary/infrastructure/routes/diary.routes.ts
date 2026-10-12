import { Routes } from "@angular/router";
import { GetArticlesProviders } from "@nutrition/catalog/article/infrastructure/providers/get-articles.providers";
import { GetRecipesProviders } from "@nutrition/recipe/recipe/infrastructure/providers/get-recipes.providers";
import { GetDiaryProviders } from "../providers/get-diary.providers";
import { DiaryWriteProviders } from "../providers/diary-write.providers";
import { AssignDiaryEntryLotProviders } from "../providers/assign-diary-entry-lot.providers";
import { GetRecipeLotsProviders } from "@nutrition/kitchen/production/infrastructure/providers/get-recipe-lots.providers";
import { DiaryGoalProviders } from "@nutrition/diary/goal/infrastructure/providers/diary-goal.providers";
import { GetMenusProviders } from "@nutrition/menu/menu/infrastructure/providers/get-menus.providers";
import { GetProductionsProviders } from "@nutrition/kitchen/production/infrastructure/providers/get-productions.providers";
import { GetShoppingListProviders } from "@nutrition/shopping/shopping/infrastructure/providers/get-shopping-list.providers";
import { AutosaveProvider } from "@shared/autosave/infrastructure/providers/autosave.provider";
import { UndoProvider } from "@shared/undo/infrastructure/providers/undo.provider";
import { PreloadMode } from "@shared/routing/domain/models/preload-mode.enum";

export const DIARY_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetDiaryProviders.getProviders(),
      ...DiaryWriteProviders.getProviders(),
      ...AssignDiaryEntryLotProviders.getProviders(),
      ...GetRecipeLotsProviders.getProviders(),
      ...DiaryGoalProviders.getProviders(),
      ...GetArticlesProviders.getProviders(),
      ...GetRecipesProviders.getProviders(),
      ...GetMenusProviders.getProviders(),
      ...GetProductionsProviders.getProviders(),
      ...GetShoppingListProviders.getProviders(),
      ...AutosaveProvider.getProviders(),
      ...UndoProvider.getProviders(),
    ],
    children: [
      {
        path: "",
        data: { preload: PreloadMode.Eager },
        loadComponent: () =>
          import("../components/get-diary.component").then(
            (m) => m.GetDiaryComponent,
          ),
      },
    ],
  },
];
