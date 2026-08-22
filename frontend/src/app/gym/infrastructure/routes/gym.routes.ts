import { Routes } from "@angular/router";

export const GYM_ROUTES: Routes = [
  { path: "", redirectTo: "sessions", pathMatch: "full" },
  {
    path: "sessions",
    data: { breadcrumb: "session.breadcrumb.list" },
    loadChildren: () =>
      import("@gym/training/session/infrastructure/routes/session.routes").then(
        (m) => m.SESSION_ROUTES,
      ),
  },
  {
    path: "exercises",
    data: { breadcrumb: "exercise.breadcrumb.list" },
    loadChildren: () =>
      import("@gym/library/exercise/infrastructure/routes/exercise.routes").then(
        (m) => m.EXERCISE_ROUTES,
      ),
  },
  {
    path: "free",
    data: { breadcrumb: "workout.breadcrumb.free" },
    loadChildren: () =>
      import("@gym/training/workout/infrastructure/routes/free-workout.routes").then(
        (m) => m.FREE_WORKOUT_ROUTES,
      ),
  },
  {
    path: "history",
    data: { breadcrumb: "workout.breadcrumb.list" },
    loadChildren: () =>
      import("@gym/training/workout/infrastructure/routes/workout.routes").then(
        (m) => m.WORKOUT_ROUTES,
      ),
  },
];
