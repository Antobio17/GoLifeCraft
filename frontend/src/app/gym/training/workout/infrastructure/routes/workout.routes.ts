import { Routes } from "@angular/router";
import { GetWorkoutsProviders } from "../providers/get-workouts.providers";
import { GetWorkoutProviders } from "../providers/get-workout.providers";
import { EditWorkoutProviders } from "../providers/edit-workout.providers";
import { GetExercisesProviders } from "@gym/library/exercise/infrastructure/providers/get-exercises.providers";

export const WORKOUT_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetWorkoutsProviders.getProviders(),
      ...GetWorkoutProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-workouts.component").then(
            (m) => m.GetWorkoutsComponent,
          ),
      },
      {
        path: ":id/edit",
        data: { breadcrumb: "workout.breadcrumb.edit" },
        providers: [
          ...EditWorkoutProviders.getProviders(),
          ...GetExercisesProviders.getProviders(),
        ],
        loadComponent: () =>
          import("../components/edit-workout.component").then(
            (m) => m.EditWorkoutComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "workout.breadcrumb.detail" },
        loadComponent: () =>
          import("../components/workout-detail.component").then(
            (m) => m.WorkoutDetailComponent,
          ),
      },
    ],
  },
];
