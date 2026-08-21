import { Routes } from "@angular/router";
import { GetSessionsProviders } from "../providers/get-sessions.providers";
import { GetSessionProviders } from "../providers/get-session.providers";
import { GetSessionStatsProviders } from "../providers/get-session-stats.providers";
import { CreateSessionProviders } from "../providers/create-session.providers";
import { UpdateSessionDetailsProviders } from "../providers/update-session-details.providers";
import { SaveSessionExerciseProviders } from "../providers/save-session-exercise.providers";
import { AutosaveProvider } from "@shared/autosave/infrastructure/providers/autosave.provider";
import { UndoProvider } from "@shared/undo/infrastructure/providers/undo.provider";
import { DeleteSessionProviders } from "../providers/delete-session.providers";
import { GetExercisesProviders } from "@gym/library/exercise/infrastructure/providers/get-exercises.providers";

export const SESSION_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetSessionsProviders.getProviders(),
      ...GetSessionProviders.getProviders(),
      ...GetSessionStatsProviders.getProviders(),
      ...CreateSessionProviders.getProviders(),
      ...UpdateSessionDetailsProviders.getProviders(),
      ...SaveSessionExerciseProviders.getProviders(),
      ...DeleteSessionProviders.getProviders(),
      ...GetExercisesProviders.getProviders(),
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
        data: { breadcrumb: "session.breadcrumb.create" },
        loadComponent: () =>
          import("../components/session-form.component").then(
            (m) => m.SessionFormComponent,
          ),
      },
      {
        path: ":id/edit",
        data: { breadcrumb: "session.breadcrumb.edit" },
        loadComponent: () =>
          import("../components/session-form.component").then(
            (m) => m.SessionFormComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "session.breadcrumb.detail" },
        providers: [
          ...AutosaveProvider.getProviders(),
          ...UndoProvider.getProviders(),
        ],
        loadComponent: () =>
          import("../components/session-detail.component").then(
            (m) => m.SessionDetailComponent,
          ),
      },
    ],
  },
];
