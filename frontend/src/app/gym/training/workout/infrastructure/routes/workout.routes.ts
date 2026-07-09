import { Routes } from "@angular/router";
import { GetWorkoutsProviders } from "../providers/get-workouts.providers";
import { GetWorkoutProviders } from "../providers/get-workout.providers";

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
