import { Routes } from "@angular/router";
import { GetExercisesProviders } from "@gym/library/exercise/infrastructure/providers/get-exercises.providers";
import { CreateSessionProviders } from "@gym/training/session/infrastructure/providers/create-session.providers";

export const FREE_WORKOUT_ROUTES: Routes = [
  {
    path: "",
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
