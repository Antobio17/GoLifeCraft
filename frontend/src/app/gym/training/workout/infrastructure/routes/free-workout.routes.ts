import { Routes } from "@angular/router";
import { blockReadOnlyUserGuard } from "@authorization/login/login/domain/guards/role.guard";
import { GetExercisesProviders } from "@gym/library/exercise/infrastructure/providers/get-exercises.providers";
import { CreateSessionProviders } from "@gym/training/session/infrastructure/providers/create-session.providers";

export const FREE_WORKOUT_ROUTES: Routes = [
  {
    path: "",
    canActivate: [blockReadOnlyUserGuard],
    providers: [
      ...GetExercisesProviders.getProviders(),
      ...CreateSessionProviders.getProviders(),
    ],
    loadComponent: () =>
      import("../components/free-workout.component").then(
        (m) => m.FreeWorkoutComponent,
      ),
  },
];
