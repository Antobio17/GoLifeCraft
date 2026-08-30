import { Routes } from "@angular/router";
import { GetArticlesProviders } from "@nutrition/catalog/article/infrastructure/providers/get-articles.providers";
import { GetRecipesProviders } from "@nutrition/recipe/recipe/infrastructure/providers/get-recipes.providers";
import { GetDiaryProviders } from "../providers/get-diary.providers";
import { DiaryWriteProviders } from "../providers/diary-write.providers";
import { AssignDiaryEntryLotProviders } from "../providers/assign-diary-entry-lot.providers";
import { GetRecipeLotsProviders } from "@nutrition/kitchen/production/infrastructure/providers/get-recipe-lots.providers";
import { DiaryGoalProviders } from "@nutrition/diary/goal/infrastructure/providers/diary-goal.providers";
import { AutosaveProvider } from "@shared/autosave/infrastructure/providers/autosave.provider";
import { UndoProvider } from "@shared/undo/infrastructure/providers/undo.provider";

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
      ...AutosaveProvider.getProviders(),
      ...UndoProvider.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-diary.component").then(
            (m) => m.GetDiaryComponent,
          ),
      },
    ],
  },
];
