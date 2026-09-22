import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { IconBadgeComponent } from "@shared/design-system/icon-badge/infrastructure/components/icon-badge.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SetHeaderComponent } from "@shared/design-system/set-header/infrastructure/components/set-header.component";
import { SetRowComponent } from "@shared/design-system/set-row/infrastructure/components/set-row.component";
import { AddTileComponent } from "@shared/design-system/add-tile/infrastructure/components/add-tile.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { TextareaComponent } from "@shared/design-system/textarea/infrastructure/components/textarea.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonFieldsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-fields.component";
import { SkeletonExerciseComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-exercise.component";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { TextSearchService } from "@shared/search/application/services/text-search.service";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
import { GetExercisesService } from "@gym/library/exercise/application/services/get-exercises.service";
import { Exercise } from "@gym/library/exercise/domain/models/exercise.model";
import { ExerciseType } from "@gym/library/exercise/domain/models/exercise-type.model";
import { ExerciseWeightMode } from "@gym/library/exercise/domain/models/exercise-weight-mode.model";
import { SetNumberingService } from "@gym/training/session/application/services/set-numbering.service";
import { GetWorkoutService } from "../../application/services/get-workout.service";
import { EditWorkoutService } from "../../application/services/edit-workout.service";
import { WorkoutEditDraftService } from "../../application/services/workout-edit-draft.service";
import { WorkoutTimeFieldsService } from "../../application/services/workout-time-fields.service";
import { WorkoutExerciseView } from "../../domain/models/workout-detail.model";
import { WorkoutTimeFields } from "../../domain/models/workout-time-fields.model";

@Component({
  selector: "app-edit-workout",
  templateUrl: "./edit-workout.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    ModalSheetComponent,
    SearchInputComponent,
    StackComponent,
    CardComponent,
    HeadingComponent,
    TextComponent,
    TextInputComponent,
    DateInputComponent,
    NumberInputComponent,
    FieldComponent,
    GridComponent,
    ChipComponent,
    IconButtonComponent,
    IconBadgeComponent,
    ButtonComponent,
    SetHeaderComponent,
    SetRowComponent,
    AddTileComponent,
    EmptyStateComponent,
    TextareaComponent,
    SkeletonScreenHeaderComponent,
    SkeletonFieldsComponent,
    SkeletonExerciseComponent,
  ],
})
export class EditWorkoutComponent {
  private translationService = inject(TranslationService);
  private backNavigation = inject(BackNavigationService);
  private getWorkoutService = inject(GetWorkoutService);
  private editWorkoutService = inject(EditWorkoutService);
  private getExercisesService = inject(GetExercisesService);
  private draft = inject(WorkoutEditDraftService);
  private timeFields = inject(WorkoutTimeFieldsService);
  private setNumbering = inject(SetNumberingService);
  private textSearch = inject(TextSearchService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private readonly MODULE_PATH = "gym/training/workout";

  readonly id = input.required<string>();

  readonly skeletonExercises = [3, 3];

  loading = signal(true);
  notFound = signal(false);
  saving = signal(false);

  name = signal("");
  time = signal<WorkoutTimeFields>({
    date: "",
    time: "",
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  exercises = signal<WorkoutExerciseView[]>([]);

  readonly today = this.timeFields.today();

  private startedAt = computed(() => this.timeFields.startedAt(this.time()));
  private durationSeconds = computed(() =>
    this.timeFields.durationSeconds(this.time()),
  );

  startsInTheFuture = computed(() => {
    const start = this.startedAt();
    return start !== null && start.getTime() > Date.now();
  });

  invalidDuration = computed(
    () => !this.timeFields.isValidDuration(this.durationSeconds()),
  );

  timeError = computed(() => {
    if (this.startedAt() === null) {
      return this.t("editWorkout.error.missingStart");
    }
    if (this.startsInTheFuture()) {
      return this.t("editWorkout.error.futureStart");
    }
    if (this.invalidDuration()) {
      return this.t("editWorkout.error.duration");
    }
    return "";
  });

  canSave = computed(
    () =>
      !this.saving() && this.name().trim() !== "" && this.timeError() === "",
  );

  hasExercises = computed(() => this.exercises().length > 0);

  exerciseRows = computed(() =>
    this.exercises().map((exercise) => ({
      ...exercise,
      sets: this.setNumbering.rows(exercise.sets),
      muscleLabel: exercise.muscleGroups.join(" · "),
      modeLabel: this.t(
        exercise.type === ExerciseType.Unilateral
          ? "workout.free.mode.unilateral"
          : "workout.free.mode.bilateral",
      ),
      weightModeLabel: this.t(
        exercise.weightMode === ExerciseWeightMode.PerSide
          ? "workout.free.weightMode.perSide"
          : "workout.free.weightMode.total",
      ),
    })),
  );

  pickerOpen = signal(false);
  library = signal<Exercise[]>([]);
  librarySearch = signal("");

  libraryRows = computed(() => {
    const query = this.librarySearch();

    return this.library()
      .filter((exercise) =>
        this.textSearch.matches(
          query,
          exercise.attributes.name,
          ...exercise.attributes.muscleGroups,
        ),
      )
      .map((exercise) => ({
        id: exercise.id,
        name: exercise.attributes.name,
        muscleLabel: exercise.attributes.muscleGroups.join(" · "),
        exercise,
      }));
  });

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);
    this.loadLibrary();

    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.loading.set(true);
          return this.getWorkoutService
            .getWorkout(id)
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        const detail = response?.data.attributes ?? null;
        this.notFound.set(detail === null);
        this.loading.set(false);

        if (!detail) {
          return;
        }

        this.name.set(detail.sessionName);
        this.time.set(
          this.timeFields.fromWorkout(detail.startedAt, detail.durationSeconds),
        );
        this.exercises.set(detail.exercises);
      });
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  onRename(value: string): void {
    this.name.set(value);
  }

  onDateChange(value: string): void {
    this.time.update((fields) => ({ ...fields, date: value }));
  }

  onTimeChange(value: string): void {
    this.time.update((fields) => ({ ...fields, time: value }));
  }

  onHoursChange(value: number): void {
    this.time.update((fields) => ({ ...fields, hours: value, seconds: 0 }));
  }

  onMinutesChange(value: number): void {
    this.time.update((fields) => ({ ...fields, minutes: value, seconds: 0 }));
  }

  openPicker(): void {
    this.librarySearch.set("");
    this.pickerOpen.set(true);
  }

  closePicker(): void {
    this.pickerOpen.set(false);
  }

  onLibrarySearch(value: string): void {
    this.librarySearch.set(value);
  }

  addFromLibrary(exercise: Exercise): void {
    this.exercises.update((list) => this.draft.fromLibrary(list, exercise));
    this.pickerOpen.set(false);
  }

  removeExercise(exerciseId: string): void {
    this.exercises.update((list) =>
      this.draft.removeExercise(list, exerciseId),
    );
  }

  addSet(exerciseId: string): void {
    this.exercises.update((list) => this.draft.addSet(list, exerciseId));
  }

  removeSet(exerciseId: string, setId: string): void {
    this.exercises.update((list) =>
      this.draft.removeSet(list, exerciseId, setId),
    );
  }

  setReps(exerciseId: string, setId: string, value: number): void {
    this.exercises.update((list) =>
      this.draft.setReps(list, exerciseId, setId, value),
    );
  }

  setWeight(exerciseId: string, setId: string, value: number): void {
    this.exercises.update((list) =>
      this.draft.setWeight(list, exerciseId, setId, value),
    );
  }

  toggleSetDone(exerciseId: string, setId: string): void {
    this.exercises.update((list) =>
      this.draft.toggleDone(list, exerciseId, setId),
    );
  }

  toggleSetKind(exerciseId: string, setId: string): void {
    this.exercises.update((list) =>
      this.draft.toggleKind(list, exerciseId, setId),
    );
  }

  setNote(exerciseId: string, value: string): void {
    this.exercises.update((list) =>
      this.draft.setNote(list, exerciseId, value),
    );
  }

  onSave(): void {
    const startedAt = this.startedAt();
    if (!this.canSave() || startedAt === null) {
      return;
    }

    this.saving.set(true);

    this.editWorkoutService
      .editWorkout(this.id(), {
        sessionName: this.name().trim(),
        startedAt: startedAt.toISOString(),
        durationSeconds: this.durationSeconds(),
        exercises: this.draft.toRequest(this.exercises()),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "workout.edit.saved",
            details: [],
          });
          this.router.navigate(["/gym/history", this.id()], {
            replaceUrl: true,
          });
        },
        error: () => this.saving.set(false),
      });
  }

  goBack(): void {
    this.backNavigation.back(["/gym/history", this.id()]);
  }

  private loadLibrary(): void {
    this.getExercisesService
      .getExercises(1, 200)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.library.set(response.data),
        error: () => {},
      });
  }
}
