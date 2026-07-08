import { Routes } from "@angular/router";
import { blockReadOnlyUserGuard } from "@authorization/login/login/domain/guards/role.guard";
import { GetExercisesProviders } from "../providers/get-exercises.providers";
import { GetExerciseProviders } from "../providers/get-exercise.providers";
import { CreateExerciseProviders } from "../providers/create-exercise.providers";
import { UpdateExerciseProviders } from "../providers/update-exercise.providers";
import { DeleteExerciseProviders } from "../providers/delete-exercise.providers";

export const EXERCISE_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetExercisesProviders.getProviders(),
      ...GetExerciseProviders.getProviders(),
      ...CreateExerciseProviders.getProviders(),
      ...UpdateExerciseProviders.getProviders(),
      ...DeleteExerciseProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-exercises.component").then(
            (m) => m.GetExercisesComponent,
          ),
      },
      {
        path: "create",
        canActivate: [blockReadOnlyUserGuard],
        data: { breadcrumb: "exercise.breadcrumb.create" },
        loadComponent: () =>
          import("../components/exercise-editor.component").then(
            (m) => m.ExerciseEditorComponent,
          ),
      },
      {
        path: ":id/edit",
        canActivate: [blockReadOnlyUserGuard],
        data: { breadcrumb: "exercise.breadcrumb.edit" },
        loadComponent: () =>
          import("../components/exercise-editor.component").then(
            (m) => m.ExerciseEditorComponent,
          ),
      },
    ],
  },
];
