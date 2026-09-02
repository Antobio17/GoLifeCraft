import {
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { ChoiceModalComponent } from "@shared/design-system/choice-modal/infrastructure/components/choice-modal.component";
import { ChoiceModalOption } from "@shared/design-system/choice-modal/domain/models/choice-modal-option.model";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { PositionChipComponent } from "@shared/design-system/position-chip/infrastructure/components/position-chip.component";
import { ReorderSheetComponent } from "@shared/design-system/reorder-sheet/infrastructure/components/reorder-sheet.component";
import { ReorderSheetItem } from "@shared/design-system/reorder-sheet/domain/models/reorder-sheet-item.model";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { IconBadgeComponent } from "@shared/design-system/icon-badge/infrastructure/components/icon-badge.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ActiveWorkoutBannerComponent } from "@shared/design-system/active-workout-banner/infrastructure/components/active-workout-banner.component";
import { StickyCollapseService } from "@shared/design-system/active-workout-banner/application/services/sticky-collapse.service";
import { SetHeaderComponent } from "@shared/design-system/set-header/infrastructure/components/set-header.component";
import { SetRowComponent } from "@shared/design-system/set-row/infrastructure/components/set-row.component";
import { AddTileComponent } from "@shared/design-system/add-tile/infrastructure/components/add-tile.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonExerciseComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-exercise.component";
import { TextareaComponent } from "@shared/design-system/textarea/infrastructure/components/textarea.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { uuidV4 } from "@shared/uuid/uuid";
import { GetExercisesService } from "@gym/library/exercise/application/services/get-exercises.service";
import { Exercise } from "@gym/library/exercise/domain/models/exercise.model";
import { ExerciseType } from "@gym/library/exercise/domain/models/exercise-type.model";
import { SessionDraftService } from "@gym/training/session/application/services/session-draft.service";
import { SessionExerciseView } from "@gym/training/session/domain/models/session-detail.model";
import { CreateSessionService } from "@gym/training/session/application/services/create-session.service";
import {
  ActiveExercise,
  ActiveWorkoutService,
} from "@gym/training/workout/application/services/active-workout.service";
import { TemplateSyncMode } from "@gym/training/workout/domain/models/template-sync-mode.model";
import { FreeWorkoutFinishMode } from "@gym/training/workout/domain/models/free-workout-finish-mode.model";
import { TextSearchService } from "@shared/search/application/services/text-search.service";

@Component({
  selector: "app-free-workout",
  templateUrl: "./free-workout.component.html",
  providers: [StickyCollapseService],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    ModalSheetComponent,
    SearchInputComponent,
    ConfirmActionModalComponent,
    ChoiceModalComponent,
    StackComponent,
    CardComponent,
    HeadingComponent,
    TextComponent,
    TextInputComponent,
    ChipComponent,
    PositionChipComponent,
    ReorderSheetComponent,
    IconButtonComponent,
    IconBadgeComponent,
    ButtonComponent,
    ActiveWorkoutBannerComponent,
    SetHeaderComponent,
    SetRowComponent,
    AddTileComponent,
    EmptyStateComponent,
    SkeletonScreenHeaderComponent,
    SkeletonExerciseComponent,
    TextareaComponent,
  ],
})
export class FreeWorkoutComponent implements OnInit {
  private textSearch = inject(TextSearchService);
  private translationService = inject(TranslationService);
  private getExercisesService = inject(GetExercisesService);
  private createSessionService = inject(CreateSessionService);
  private sessionDraft = inject(SessionDraftService);
  private floatingToastService = inject(FloatingToastService);
  protected activeWorkout = inject(ActiveWorkoutService);
  protected sticky = inject(StickyCollapseService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private readonly MODULE_PATH = "gym/training/workout";

  readonly skeletonExercises = [3, 4];

  loading = signal(true);
  name = signal("");
  exercises = signal<SessionExerciseView[]>([]);

  exerciseRows = computed(() =>
    this.exercises().map((exercise) => ({
      ...exercise,
      muscleLabel: exercise.muscleGroups.join(" · "),
      modeLabel: this.modeLabel(exercise.type),
    })),
  );

  reorderExerciseId = signal<string | null>(null);

  reorderOpen = computed(() => this.reorderExerciseId() !== null);

  reorderItems = computed<ReorderSheetItem[]>(() =>
    this.exerciseRows().map((exercise) => ({
      id: exercise.id,
      label: exercise.exerciseName,
      meta: exercise.muscleLabel,
    })),
  );

  reorderTitle = computed(() => this.t("workout.free.reorder.title"));
  reorderBody = computed(() => this.t("workout.free.reorder.body"));
  reorderSaveLabel = computed(() => this.t("workout.free.reorder.save"));
  reorderCancelLabel = computed(() => this.t("workout.free.reorder.cancel"));
  reorderDragLabel = computed(() => this.t("workout.free.reorder.drag"));

  pickerOpen = signal(false);
  library = signal<Exercise[]>([]);
  librarySearch = signal("");

  libraryRows = computed(() => {
    const query = this.librarySearch();
    const items = this.library().filter((exercise) =>
      this.textSearch.matches(
        query,
        exercise.attributes.name,
        ...exercise.attributes.muscleGroups,
      ),
    );

    return items.map((exercise) => ({
      id: exercise.id,
      name: exercise.attributes.name,
      muscleLabel: exercise.attributes.muscleGroups.join(" · "),
      exercise,
    }));
  });

  showStopModal = signal(false);
  showFinishModal = signal(false);
  finishing = signal(false);

  hasExercises = computed(() => this.exercises().length > 0);

  finishModalNote = computed(() => {
    if (this.hasExercises()) {
      return "";
    }

    return this.t("workout.free.finishModal.emptyNote");
  });

  finishOptions = computed<ChoiceModalOption[]>(() => {
    if (!this.hasExercises()) {
      return [this.finishOption(FreeWorkoutFinishMode.HistoryOnly, "history")];
    }

    return [
      this.finishOption(FreeWorkoutFinishMode.HistoryOnly, "history"),
      this.finishOption(FreeWorkoutFinishMode.Template, "bookmark"),
    ];
  });

  @ViewChild(ActiveWorkoutBannerComponent)
  set bannerRef(ref: ActiveWorkoutBannerComponent | undefined) {
    this.sticky.track(ref?.sentinelElement);
  }

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.loadLibrary();
        this.bootstrap();
      });
  }

  private bootstrap(): void {
    this.activeWorkout
      .ensureRestored()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.resume(),
        error: () => this.abortBootstrap(),
      });
  }

  private abortBootstrap(): void {
    this.floatingToastService.showToast({
      status: 500,
      keyTranslation: "workout.free.restoreError",
      details: [],
    });
    this.router.navigate(["/gym"]);
  }

  private resume(): void {
    if (this.activeWorkout.isActive() && !this.activeWorkout.isFree()) {
      this.router.navigate([
        "/gym/sessions",
        this.activeWorkout.activeSessionId(),
      ]);
      return;
    }

    if (this.activeWorkout.isFree()) {
      this.name.set(this.activeWorkout.activeName());
      this.exercises.set(
        this.sessionDraft.fromActive(this.activeWorkout.liveExercises()),
      );
      this.loading.set(false);
      return;
    }

    this.startFreeWorkout();
  }

  private startFreeWorkout(): void {
    const name = this.t("workout.free.defaultName");

    this.activeWorkout
      .start(null, name, [])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.name.set(name);
          this.exercises.set([]);
          this.loading.set(false);
        },
        error: () => this.goBack(),
      });
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

  private toActive(): ActiveExercise[] {
    return this.exercises().map((exercise) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      muscleGroups: exercise.muscleGroups,
      type: exercise.type,
      note: exercise.note,
      sets: exercise.sets.map((set) => ({
        reps: set.reps,
        weight: set.weight,
      })),
    }));
  }

  private modeLabel(type: string): string {
    return this.t(
      type === ExerciseType.Unilateral
        ? "workout.free.mode.unilateral"
        : "workout.free.mode.bilateral",
    );
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  private finishOption(
    mode: FreeWorkoutFinishMode,
    icon: DsIconName,
  ): ChoiceModalOption {
    return {
      value: mode,
      icon,
      title: this.t(`workout.free.finishModal.options.${mode}.title`),
      description: this.t(
        `workout.free.finishModal.options.${mode}.description`,
      ),
    };
  }

  get doneCount(): number {
    return this.activeWorkout.doneCount(this.toActive());
  }

  get totalSets(): number {
    return this.activeWorkout.totalSets(this.toActive());
  }

  isSetDone(exerciseIndex: number, setIndex: number): boolean {
    return this.activeWorkout.isDone(exerciseIndex, setIndex);
  }

  toggleSetDone(exerciseIndex: number, setIndex: number): void {
    this.activeWorkout.toggleDone(exerciseIndex, setIndex, this.toActive());
  }

  onRename(value: string): void {
    this.name.set(value);
    this.activeWorkout.rename(value, this.toActive());
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
    this.exercises.update((list) =>
      this.sessionDraft.fromLibrary(list, exercise, uuidV4()),
    );
    this.pickerOpen.set(false);
    this.syncProgress();
  }

  removeExercise(exerciseId: string): void {
    this.exercises.update((list) =>
      this.sessionDraft.removeExercise(list, exerciseId),
    );
    this.syncProgress();
  }

  openReorder(exerciseId: string): void {
    if (this.exercises().length < 2) {
      return;
    }

    this.reorderExerciseId.set(exerciseId);
  }

  closeReorder(): void {
    this.reorderExerciseId.set(null);
  }

  reorderAriaLabel(exerciseName: string): string {
    return this.t("workout.free.reorder.trigger", { name: exerciseName });
  }

  onReorderSaved(orderedIds: string[]): void {
    this.reorderExerciseId.set(null);

    const originalIndexes = this.sessionDraft.originalIndexes(
      this.exercises(),
      orderedIds,
    );

    if (originalIndexes.some((index) => index < 0)) {
      return;
    }

    this.exercises.update((list) =>
      this.sessionDraft.applyOrder(list, orderedIds),
    );
    this.activeWorkout.reorderExercises(originalIndexes, this.toActive());
  }

  addSet(exerciseId: string): void {
    this.exercises.update((list) => this.sessionDraft.addSet(list, exerciseId));
    this.syncProgress();
  }

  removeSet(exerciseId: string, setId: string): void {
    this.exercises.update((list) =>
      this.sessionDraft.removeSet(list, exerciseId, setId),
    );
    this.syncProgress();
  }

  setReps(exerciseId: string, setId: string, value: number): void {
    this.exercises.update((list) =>
      this.sessionDraft.setReps(list, exerciseId, setId, value),
    );
    this.syncProgress();
  }

  setWeight(exerciseId: string, setId: string, value: number): void {
    this.exercises.update((list) =>
      this.sessionDraft.setWeight(list, exerciseId, setId, value),
    );
    this.syncProgress();
  }

  setNote(exerciseId: string, value: string): void {
    this.exercises.update((list) =>
      this.sessionDraft.setNote(list, exerciseId, value),
    );
    this.syncProgress();
  }

  private syncProgress(): void {
    this.activeWorkout.syncProgress(this.toActive());
  }

  onPauseWorkout(): void {
    this.activeWorkout.pause(this.toActive());
  }

  onFinishWorkout(): void {
    if (this.finishing()) {
      return;
    }

    this.showFinishModal.set(true);
  }

  onCancelFinish(): void {
    this.showFinishModal.set(false);
  }

  onFinishModeChosen(mode: string): void {
    if (this.finishing()) {
      return;
    }

    this.finishing.set(true);

    if (mode !== FreeWorkoutFinishMode.Template) {
      this.finishWorkout(null);
      return;
    }

    this.saveAsTemplate();
  }

  private saveAsTemplate(): void {
    const sessionId = uuidV4();

    this.createSessionService
      .createSession({
        ...this.sessionDraft.toRequest(
          this.name().trim(),
          this.estimatedDurationMinutes(),
          this.activeWorkout.restTargetSeconds(),
          this.exercises(),
        ),
        sessionId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.finishWorkout(sessionId),
        error: () => this.finishing.set(false),
      });
  }

  private finishWorkout(sessionId: string | null): void {
    this.activeWorkout
      .finish(this.toActive(), TemplateSyncMode.None, sessionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.finishing.set(false);
          this.showFinishModal.set(false);
          this.router.navigate(["/gym/history"]);
        },
        error: () => this.finishing.set(false),
      });
  }

  private estimatedDurationMinutes(): number {
    return Math.max(1, Math.round(this.activeWorkout.elapsedSeconds() / 60));
  }

  onRequestStop(): void {
    this.showStopModal.set(true);
  }

  onCancelStop(): void {
    this.showStopModal.set(false);
  }

  onConfirmStop(): void {
    this.activeWorkout
      .discard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showStopModal.set(false);
          this.goBack();
        },
        error: () => this.showStopModal.set(false),
      });
  }

  goBack(): void {
    this.router.navigate(["/gym/sessions"]);
  }
}
