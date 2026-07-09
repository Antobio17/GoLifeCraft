import { Routes } from "@angular/router";
import { blockReadOnlyUserGuard } from "@authorization/login/login/domain/guards/role.guard";
import { GetSessionsProviders } from "../providers/get-sessions.providers";
import { GetSessionProviders } from "../providers/get-session.providers";
import { CreateSessionProviders } from "../providers/create-session.providers";
import { UpdateSessionProviders } from "../providers/update-session.providers";
import { DeleteSessionProviders } from "../providers/delete-session.providers";
import { GetExercisesProviders } from "@gym/library/exercise/infrastructure/providers/get-exercises.providers";
import { WorkoutSessionProviders } from "@gym/training/workout/infrastructure/providers/workout-session.providers";

export const SESSION_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetSessionsProviders.getProviders(),
      ...GetSessionProviders.getProviders(),
      ...CreateSessionProviders.getProviders(),
      ...UpdateSessionProviders.getProviders(),
      ...DeleteSessionProviders.getProviders(),
      ...GetExercisesProviders.getProviders(),
      ...WorkoutSessionProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-sessions.component").then(
            (m) => m.GetSessionsComponent,
          ),
      },
      {
        path: "create",
        canActivate: [blockReadOnlyUserGuard],
        data: { breadcrumb: "session.breadcrumb.create" },
        loadComponent: () =>
          import("../components/session-form.component").then(
            (m) => m.SessionFormComponent,
          ),
      },
      {
        path: ":id/edit",
        canActivate: [blockReadOnlyUserGuard],
        data: { breadcrumb: "session.breadcrumb.edit" },
        loadComponent: () =>
          import("../components/session-form.component").then(
            (m) => m.SessionFormComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "session.breadcrumb.detail" },
        loadComponent: () =>
          import("../components/session-detail.component").then(
            (m) => m.SessionDetailComponent,
          ),
      },
    ],
  },
];
