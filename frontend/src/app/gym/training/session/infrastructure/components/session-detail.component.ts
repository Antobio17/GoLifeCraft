import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { GetSessionService } from "../../application/services/get-session.service";
import { UpdateSessionService } from "../../application/services/update-session.service";
import { DeleteSessionService } from "../../application/services/delete-session.service";
import { GetExercisesService } from "@gym/library/exercise/application/services/get-exercises.service";
import { Exercise } from "@gym/library/exercise/domain/models/exercise.model";
import { GetSessionResponse } from "../../domain/models/get-session-response.model";
import {
  SessionExerciseView,
  ExerciseSetView,
} from "../../domain/models/session-detail.model";
import { CreateSessionRequest } from "../../domain/models/session-request.model";
import { EXERCISE_TYPES } from "@gym/library/exercise/domain/constants/muscle-groups.constants";

@Component({
  selector: "app-session-detail",
  templateUrl: "./session-detail.component.html",
  styleUrls: ["./gym-list.css", "./session-detail.component.css"],
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    ModalSheetComponent,
    SearchInputComponent,
    ConfirmActionModalComponent,
  ],
})
export class SessionDetailComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private getSessionService = inject(GetSessionService);
  private updateSessionService = inject(UpdateSessionService);
  private deleteSessionService = inject(DeleteSessionService);
  private getExercisesService = inject(GetExercisesService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly MODULE_PATH = "gym/training/session";

  id = "";
  loading = signal(true);
  saving = signal(false);

  name = signal("");
  estimatedDurationMinutes = signal(0);
  exercises = signal<SessionExerciseView[]>([]);

  pickerOpen = signal(false);
  library = signal<Exercise[]>([]);
  librarySearch = signal("");

  showDeleteModal = signal(false);
  isDeleting = signal(false);

  menuOpen = signal(false);

  private persist$ = new Subject<void>();
  private sub?: Subscription;

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get("id") ?? "";

    this.sub = this.persist$
      .pipe(debounceTime(500))
      .subscribe(() => this.persist());

    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.loadSession();
        this.loadLibrary();
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadSession(): void {
    this.getSessionService.getSession(this.id).subscribe({
      next: (response: GetSessionResponse) => {
        const attributes = response.data.attributes;
        this.name.set(attributes.name);
        this.estimatedDurationMinutes.set(attributes.estimatedDurationMinutes);
        this.exercises.set(
          attributes.exercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets.map((set) => ({ ...set })),
          })),
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadLibrary(): void {
    this.getExercisesService.getExercises(1, 200).subscribe({
      next: (response) => this.library.set(response.data),
    });
  }

  get filteredLibrary(): Exercise[] {
    const query = this.librarySearch().trim().toLowerCase();
    if (!query) return this.library();
    return this.library().filter(
      (exercise) =>
        exercise.attributes.name.toLowerCase().includes(query) ||
        exercise.attributes.muscleGroups.some((muscle) =>
          muscle.toLowerCase().includes(query),
        ),
    );
  }

  muscleText(exercise: SessionExerciseView): string {
    return exercise.muscleGroups.join(" · ");
  }

  libraryMuscleText(exercise: Exercise): string {
    return exercise.attributes.muscleGroups.join(" · ");
  }

  modeLabel(type: string): string {
    return this.t(
      type === EXERCISE_TYPES.UNILATERAL
        ? "getSession.mode.unilateral"
        : "getSession.mode.bilateral",
    );
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  private uid(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
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
    const newExercise: SessionExerciseView = {
      id: this.uid("x"),
      exerciseId: exercise.id,
      exerciseName: exercise.attributes.name,
      muscleGroups: [...exercise.attributes.muscleGroups],
      type: exercise.attributes.type,
      position: this.exercises().length + 1,
      sets: [{ id: this.uid("s"), position: 1, reps: 10, weight: null }],
    };
    this.exercises.update((list) => [...list, newExercise]);
    this.pickerOpen.set(false);
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation: "session.exercise.added",
      details: [],
    });
    this.queuePersist();
  }

  removeExercise(exerciseId: string): void {
    this.exercises.update((list) => list.filter((e) => e.id !== exerciseId));
    this.queuePersist();
  }

  toggleMode(exerciseId: string): void {
    this.exercises.update((list) =>
      list.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              type:
                exercise.type === EXERCISE_TYPES.UNILATERAL
                  ? EXERCISE_TYPES.BILATERAL
                  : EXERCISE_TYPES.UNILATERAL,
            },
      ),
    );
    this.queuePersist();
  }

  addSet(exerciseId: string): void {
    this.exercises.update((list) =>
      list.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const last = exercise.sets[exercise.sets.length - 1];
        const newSet: ExerciseSetView = {
          id: this.uid("s"),
          position: exercise.sets.length + 1,
          reps: last ? last.reps : 10,
          weight: last ? last.weight : null,
        };
        return { ...exercise, sets: [...exercise.sets, newSet] };
      }),
    );
    this.queuePersist();
  }

  removeSet(exerciseId: string, setId: string): void {
    this.exercises.update((list) =>
      list.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : { ...exercise, sets: exercise.sets.filter((s) => s.id !== setId) },
      ),
    );
    this.queuePersist();
  }

  onReps(exerciseId: string, setId: string, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = raw === "" ? 0 : Math.max(0, Math.trunc(Number(raw)));
    this.mutateSet(exerciseId, setId, (set) => ({ ...set, reps: value }));
    this.queuePersist();
  }

  onWeight(exerciseId: string, setId: string, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = raw === "" ? null : Math.max(0, Number(raw));
    this.mutateSet(exerciseId, setId, (set) => ({ ...set, weight: value }));
    this.queuePersist();
  }

  stepReps(exerciseId: string, setId: string, delta: number): void {
    this.mutateSet(exerciseId, setId, (set) => ({
      ...set,
      reps: Math.max(0, set.reps + delta),
    }));
    this.queuePersist();
  }

  stepWeight(exerciseId: string, setId: string, delta: number): void {
    this.mutateSet(exerciseId, setId, (set) => ({
      ...set,
      weight: Math.max(0, (set.weight ?? 0) + delta),
    }));
    this.queuePersist();
  }

  private mutateSet(
    exerciseId: string,
    setId: string,
    change: (set: ExerciseSetView) => ExerciseSetView,
  ): void {
    this.exercises.update((list) =>
      list.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id !== setId ? set : change(set),
              ),
            },
      ),
    );
  }

  private queuePersist(): void {
    this.persist$.next();
  }

  private persist(): void {
    this.saving.set(true);
    const payload: CreateSessionRequest = {
      name: this.name(),
      estimatedDurationMinutes: this.estimatedDurationMinutes(),
      exercises: this.exercises().map((exercise, exerciseIndex) => ({
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        muscleGroups: exercise.muscleGroups,
        type: exercise.type,
        position: exerciseIndex + 1,
        sets: exercise.sets.map((set, setIndex) => ({
          position: setIndex + 1,
          reps: set.reps,
          weight: set.weight,
        })),
      })),
    };

    this.updateSessionService.updateSession(this.id, payload).subscribe({
      next: () => this.saving.set(false),
      error: () => this.saving.set(false),
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  onMenuEdit(): void {
    this.closeMenu();
    this.onEdit();
  }

  onMenuDelete(): void {
    this.closeMenu();
    this.onDelete();
  }

  onEdit(): void {
    this.router.navigate(["/gym/sessions", this.id, "edit"]);
  }

  onStart(): void {
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation: "session.start.toast",
      details: [],
    });
  }

  onDelete(): void {
    this.showDeleteModal.set(true);
  }

  onConfirmDelete(): void {
    this.isDeleting.set(true);
    this.deleteSessionService.deleteSession(this.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.floatingToastService.showToast({
          status: 200,
          keyTranslation: "session.delete.success",
          details: [],
        });
        this.router.navigate(["/gym/sessions"]);
      },
      error: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
      },
    });
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  goBack(): void {
    this.router.navigate(["/gym/sessions"]);
  }
}
