import { Routes } from "@angular/router";
import { GetArticlesProviders } from "@nutrition/catalog/article/infrastructure/providers/get-articles.providers";
import { GetRecipesProviders } from "@nutrition/recipe/recipe/infrastructure/providers/get-recipes.providers";
import { GetDiaryProviders } from "../providers/get-diary.providers";
import { DiaryWriteProviders } from "../providers/diary-write.providers";
import { DiaryGoalProviders } from "@nutrition/diary/goal/infrastructure/providers/diary-goal.providers";

export const DIARY_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetDiaryProviders.getProviders(),
      ...DiaryWriteProviders.getProviders(),
      ...DiaryGoalProviders.getProviders(),
      ...GetArticlesProviders.getProviders(),
      ...GetRecipesProviders.getProviders(),
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
