import { Routes } from "@angular/router";
import { GetAchievementsProviders } from "../providers/get-achievements.providers";

export const ACHIEVEMENT_ROUTES: Routes = [
  {
    path: "",
    providers: [...GetAchievementsProviders.getProviders()],
    loadComponent: () =>
      import("../components/achievements.component").then(
        (m) => m.AchievementsComponent,
      ),
  },
];
