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
];
