import {
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { Observable, forkJoin, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
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
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { PositionChipComponent } from "@shared/design-system/position-chip/infrastructure/components/position-chip.component";
import { ReorderSheetComponent } from "@shared/design-system/reorder-sheet/infrastructure/components/reorder-sheet.component";
import { ReorderSheetItem } from "@shared/design-system/reorder-sheet/domain/models/reorder-sheet-item.model";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { IconBadgeComponent } from "@shared/design-system/icon-badge/infrastructure/components/icon-badge.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ActiveWorkoutBannerComponent } from "@shared/design-system/active-workout-banner/infrastructure/components/active-workout-banner.component";
import { StickyCollapseService } from "@shared/design-system/active-workout-banner/application/services/sticky-collapse.service";
import { SetHeaderComponent } from "@shared/design-system/set-header/infrastructure/components/set-header.component";
import { SetRowComponent } from "@shared/design-system/set-row/infrastructure/components/set-row.component";
import { AddTileComponent } from "@shared/design-system/add-tile/infrastructure/components/add-tile.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonChipsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-chips.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonExerciseComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-exercise.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { TextareaComponent } from "@shared/design-system/textarea/infrastructure/components/textarea.component";
import {
  MenuComponent,
  MenuItem,
} from "@shared/design-system/menu/infrastructure/components/menu.component";
import {
  SegmentedToggleComponent,
  SegmentedOption,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { SelectComponent } from "@shared/design-system/select/infrastructure/components/select.component";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import {
  ProgressionCardComponent,
  ProgressionTrend,
} from "@shared/design-system/progression-card/infrastructure/components/progression-card.component";
import { SkeletonPanelComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-panel.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { SaveStatusComponent } from "@shared/design-system/save-status/infrastructure/components/save-status.component";
import { AutosaveService } from "@shared/autosave/application/services/autosave.service";
import { UndoService } from "@shared/undo/application/services/undo.service";
import { uuidV4 } from "@shared/uuid/uuid";
import { GetSessionService } from "../../application/services/get-session.service";
import { GetSessionStatsService } from "../../application/services/get-session-stats.service";
import { SaveSessionExerciseService } from "../../application/services/save-session-exercise.service";
import { DeleteSessionService } from "../../application/services/delete-session.service";
import { SessionDraftService } from "../../application/services/session-draft.service";
import { SessionProgressService } from "../../application/services/session-progress.service";
import { SessionProgressMetric } from "../../domain/models/session-progress-metric.model";
import { SessionProgressRange } from "../../domain/models/session-progress-range.model";
import { SessionWorkoutStats } from "../../domain/models/session-stats.model";
import { GetExercisesService } from "@gym/library/exercise/application/services/get-exercises.service";
import { Exercise } from "@gym/library/exercise/domain/models/exercise.model";
import { ExerciseType } from "@gym/library/exercise/domain/models/exercise-type.model";
import { GetSessionResponse } from "../../domain/models/get-session-response.model";
import { SessionExerciseView } from "../../domain/models/session-detail.model";
import {
  ActiveExercise,
  ActiveWorkoutService,
} from "@gym/training/workout/application/services/active-workout.service";
import { TemplateSyncMode } from "@gym/training/workout/domain/models/template-sync-mode.model";
import { TextSearchService } from "@shared/search/application/services/text-search.service";

@Component({
  selector: "app-session-detail",
  templateUrl: "./session-detail.component.html",
  styleUrls: ["./session-detail.component.css"],
  providers: [StickyCollapseService],
  imports: [
    FormsModule,
    NgTemplateOutlet,
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
    ChipComponent,
    PositionChipComponent,
    ReorderSheetComponent,
    IconComponent,
    IconButtonComponent,
    IconBadgeComponent,
    ButtonComponent,
    ActiveWorkoutBannerComponent,
    SetHeaderComponent,
    SetRowComponent,
    AddTileComponent,
    EmptyStateComponent,
    SkeletonChipsComponent,
    SkeletonScreenHeaderComponent,
    SkeletonComponent,
    SkeletonExerciseComponent,
    SkeletonLineComponent,
    TextareaComponent,
    MenuComponent,
    SegmentedToggleComponent,
    SelectComponent,
    ProgressionCardComponent,
    SkeletonPanelComponent,
    SaveStatusComponent,
  ],
})
export class SessionDetailComponent implements OnInit {
  private textSearch = inject(TextSearchService);
  private translationService = inject(TranslationService);
  private getSessionService = inject(GetSessionService);
  private getSessionStatsService = inject(GetSessionStatsService);
  private saveSessionExerciseService = inject(SaveSessionExerciseService);
  protected autosave = inject(AutosaveService);
  protected undo = inject(UndoService);
  private deleteSessionService = inject(DeleteSessionService);
  private sessionDraft = inject(SessionDraftService);
  private sessionProgress = inject(SessionProgressService);
  private getExercisesService = inject(GetExercisesService);
  protected activeWorkout = inject(ActiveWorkoutService);
  protected sticky = inject(StickyCollapseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  private readonly MODULE_PATH = "gym/training/session";

  readonly id = input.required<string>();
  readonly start = input<string | undefined>(undefined);
  readonly skeletonExercises = [3, 4, 3];

  loading = signal(true);
  private readonly ORDER_KEY = "exercises-order";
  private readonly persistedExercises = new Set<string>();

  name = signal("");
  estimatedDurationMinutes = signal(0);
  restSeconds = signal(0);

  restLabel = computed(() => {
    const totalSeconds = this.restSeconds();
    const seconds = totalSeconds % 60;

    return `${Math.floor(totalSeconds / 60)}:${String(seconds).padStart(2, "0")}`;
  });

  loadedExercises = signal<SessionExerciseView[]>([]);

  exercises = computed<SessionExerciseView[]>(() => {
    const removedId = this.undo.removedId();
    const loadedExercises = this.loadedExercises();
    if (!removedId) return loadedExercises;

    return this.sessionDraft.removeExercise(loadedExercises, removedId);
  });

  exerciseRows = computed(() =>
    this.exercises().map((exercise) => ({
      ...exercise,
      muscleLabel: this.muscleText(exercise),
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

  reorderTitle = computed(() => this.t("getSession.reorder.title"));
  reorderBody = computed(() => this.t("getSession.reorder.body"));
  reorderSaveLabel = computed(() => this.t("getSession.reorder.save"));
  reorderCancelLabel = computed(() => this.t("getSession.reorder.cancel"));
  reorderDragLabel = computed(() => this.t("getSession.reorder.drag"));

  statsLoading = signal(true);
  workouts = signal<SessionWorkoutStats[]>([]);
  metric = signal<SessionProgressMetric>(SessionProgressMetric.Volume);
  range = signal<SessionProgressRange>(SessionProgressRange.ThreeMonths);

  metricOptions = computed<SegmentedOption[]>(() => [
    {
      value: SessionProgressMetric.Volume,
      label: this.t("getSession.progress.metric.volume"),
    },
    {
      value: SessionProgressMetric.Reps,
      label: this.t("getSession.progress.metric.reps"),
    },
    {
      value: SessionProgressMetric.Duration,
      label: this.t("getSession.progress.metric.duration"),
    },
  ]);

  rangeOptions = computed<SelectOption[]>(() => [
    {
      value: SessionProgressRange.OneMonth,
      label: this.t("getSession.progress.range.oneMonth"),
    },
    {
      value: SessionProgressRange.ThreeMonths,
      label: this.t("getSession.progress.range.threeMonths"),
    },
    {
      value: SessionProgressRange.SixMonths,
      label: this.t("getSession.progress.range.sixMonths"),
    },
    {
      value: SessionProgressRange.All,
      label: this.t("getSession.progress.range.all"),
    },
  ]);

  hasProgress = computed<boolean>(() => this.workouts().length > 0);

  private visibleWorkouts = computed<SessionWorkoutStats[]>(() =>
    this.sessionProgress.visibleWorkouts(this.workouts(), this.range()),
  );

  private visibleValues = computed<number[]>(() =>
    this.sessionProgress.valuesOf(this.visibleWorkouts(), this.metric()),
  );

  hasProgressPoints = computed<boolean>(
    () => this.visibleWorkouts().length > 0,
  );

  progressPoints = computed<number[]>(() => this.visibleValues());

  progressLabels = computed<string[]>(() =>
    this.visibleValues().map((value) =>
      this.sessionProgress.formatPoint(value, this.metric()),
    ),
  );

  progressMetricName = computed<string>(() =>
    this.t(`getSession.progress.metricName.${this.metric()}`),
  );

  progressValue = computed<string>(() => {
    const values = this.visibleValues();
    return this.sessionProgress.formatValue(
      values.length ? values[values.length - 1] : 0,
      this.metric(),
    );
  });

  private progressDelta = computed<number | null>(() =>
    this.sessionProgress.deltaPercent(this.visibleValues()),
  );

  progressDeltaLabel = computed<string | null>(() => {
    const delta = this.progressDelta();
    if (delta === null) {
      return null;
    }
    return `${delta > 0 ? "+" : ""}${delta}%`;
  });

  progressTrend = computed<ProgressionTrend>(() => {
    const delta = this.progressDelta();
    if (delta === null || delta === 0) {
      return "neutral";
    }
    return delta > 0 ? "up" : "down";
  });

  progressFirstDate = computed<string>(() => {
    const workouts = this.visibleWorkouts();
    return workouts.length
      ? this.sessionProgress.formatDate(workouts[0].date)
      : "";
  });

  progressLastDate = computed<string>(() => {
    const workouts = this.visibleWorkouts();
    return workouts.length
      ? this.sessionProgress.formatDate(workouts[workouts.length - 1].date)
      : "";
  });

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
      muscleLabel: this.libraryMuscleText(exercise),
      exercise,
    }));
  });

  showDeleteModal = signal(false);
  isDeleting = signal(false);

  showStopModal = signal(false);
  showFinishModal = signal(false);
  finishing = signal(false);

  templateExercises = signal<SessionExerciseView[]>([]);

  private exerciseDiff = computed(() =>
    this.sessionDraft.exerciseDiff(this.templateExercises(), this.exercises()),
  );

  hasTemplateChanges = computed(
    () => this.exerciseDiff().added > 0 || this.exerciseDiff().removed > 0,
  );

  finishModalNote = computed(() => {
    if (!this.hasTemplateChanges()) {
      return "";
    }

    return this.t("getSession.finishModal.changes", {
      added: this.exerciseDiff().added,
      removed: this.exerciseDiff().removed,
    });
  });

  finishOptions = computed<ChoiceModalOption[]>(() => {
    if (!this.hasTemplateChanges()) {
      return [
        this.syncOption("update", TemplateSyncMode.Exercises, "save"),
        this.syncOption("none", TemplateSyncMode.None, "lock"),
      ];
    }

    return [
      this.syncOption("exercises", TemplateSyncMode.Exercises, "dumbbell"),
      this.syncOption("sets", TemplateSyncMode.Sets, "weightPlate"),
      this.syncOption("none", TemplateSyncMode.None, "lock"),
    ];
  });

  @ViewChild(ActiveWorkoutBannerComponent)
  set bannerRef(ref: ActiveWorkoutBannerComponent | undefined) {
    this.sticky.track(ref?.sentinelElement);
  }

  constructor() {
    toObservable(this.id)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.resetSessionState();
        this.loadSession();
        this.loadStats();
      });
  }

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => this.loadLibrary());
  }

  private resetSessionState(): void {
    this.loading.set(true);
    this.statsLoading.set(true);
    this.name.set("");
    this.estimatedDurationMinutes.set(0);
    this.restSeconds.set(0);
    this.loadedExercises.set([]);
    this.persistedExercises.clear();
    this.templateExercises.set([]);
    this.workouts.set([]);
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

  private loadSession(): void {
    this.getSessionService
      .getSession(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: GetSessionResponse) => {
          const attributes = response.data.attributes;
          this.name.set(attributes.name);
          this.estimatedDurationMinutes.set(
            attributes.estimatedDurationMinutes,
          );
          this.restSeconds.set(attributes.restSeconds);
          this.activeWorkout.ensureRestored().subscribe({
            next: () => this.finalizeLoad(attributes.exercises),
            error: () => this.finalizeLoad(attributes.exercises),
          });
        },
        error: () => this.loading.set(false),
      });
  }

  private finalizeLoad(templateExercises: SessionExerciseView[]): void {
    this.persistedExercises.clear();
    templateExercises.forEach((exercise) =>
      this.persistedExercises.add(exercise.id),
    );
    this.templateExercises.set(this.sessionDraft.clone(templateExercises));
    this.seedExercises(templateExercises);
    this.syncRestTarget();
    this.loading.set(false);
    this.maybeAutoStart();
  }

  private seedExercises(templateExercises: SessionExerciseView[]): void {
    if (this.isActiveHere) {
      this.loadedExercises.set(
        this.sessionDraft.fromActive(this.activeWorkout.liveExercises()),
      );
      return;
    }
    this.loadedExercises.set(this.sessionDraft.clone(templateExercises));
  }

  private maybeAutoStart(): void {
    if (this.start() !== "1") {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });

    this.onStartWorkout();
  }

  private loadStats(): void {
    this.statsLoading.set(true);

    this.getSessionStatsService
      .getSessionStats(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.workouts.set(stats.workouts);
          this.statsLoading.set(false);
        },
        error: () => this.statsLoading.set(false),
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

  private muscleText(exercise: SessionExerciseView): string {
    return exercise.muscleGroups.join(" · ");
  }

  private libraryMuscleText(exercise: Exercise): string {
    return exercise.attributes.muscleGroups.join(" · ");
  }

  private modeLabel(type: string): string {
    return this.t(
      type === ExerciseType.Unilateral
        ? "getSession.mode.unilateral"
        : "getSession.mode.bilateral",
    );
  }

  menuItems = computed<MenuItem[]>(() => [
    { value: "edit", label: this.t("getSession.edit"), icon: "pencil" },
    {
      value: "delete",
      label: this.t("getSession.delete"),
      icon: "trash",
      danger: true,
    },
  ]);

  onMenuAction(value: string): void {
    if (value === "edit") {
      this.onEdit();
      return;
    }
    this.onDelete();
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  private syncOption(
    key: string,
    value: TemplateSyncMode,
    icon: DsIconName,
  ): ChoiceModalOption {
    return {
      value,
      icon,
      title: this.t(`getSession.finishModal.options.${key}.title`),
      description: this.t(`getSession.finishModal.options.${key}.description`),
    };
  }

  onMetricChange(metric: SessionProgressMetric): void {
    this.metric.set(metric);
  }

  onRangeChange(range: SessionProgressRange): void {
    this.range.set(range);
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
    const sessionExerciseId = uuidV4();

    this.loadedExercises.update((list) =>
      this.sessionDraft.fromLibrary(list, exercise, sessionExerciseId),
    );
    this.pickerOpen.set(false);
    this.afterEdit(sessionExerciseId);
  }

  removeExercise(exerciseId: string): void {
    const removed = this.exercises().find(
      (candidate) => candidate.id === exerciseId,
    );
    if (!removed) return;

    if (this.isActiveHere) {
      this.loadedExercises.update((list) =>
        this.sessionDraft.removeExercise(list, exerciseId),
      );
      this.activeWorkout.syncProgress(this.toActive());

      return;
    }

    this.undo.schedule({
      id: exerciseId,
      keyTranslation: "getSession.removed",
      details: { name: removed.exerciseName },
      commit: () => this.commitRemoveExercise(exerciseId),
    });
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
    return this.t("getSession.reorder.trigger", { name: exerciseName });
  }

  onReorderSaved(orderedIds: string[]): void {
    this.reorderExerciseId.set(null);
    this.undo.commitPending();

    const originalIndexes = this.sessionDraft.originalIndexes(
      this.exercises(),
      orderedIds,
    );

    if (originalIndexes.some((index) => index < 0)) {
      return;
    }

    this.loadedExercises.update((list) =>
      this.sessionDraft.applyOrder(list, orderedIds),
    );

    if (this.isActiveHere) {
      this.activeWorkout.reorderExercises(originalIndexes, this.toActive());
      return;
    }

    this.autosave.push(this.ORDER_KEY, () => this.persistOrder(orderedIds));
  }

  addSet(exerciseId: string): void {
    this.loadedExercises.update((list) =>
      this.sessionDraft.addSet(list, exerciseId),
    );
    this.afterEdit(exerciseId);
  }

  removeSet(exerciseId: string, setId: string): void {
    this.loadedExercises.update((list) =>
      this.sessionDraft.removeSet(list, exerciseId, setId),
    );
    this.afterEdit(exerciseId);
  }

  setReps(exerciseId: string, setId: string, value: number): void {
    this.loadedExercises.update((list) =>
      this.sessionDraft.setReps(list, exerciseId, setId, value),
    );
    this.afterEdit(exerciseId);
  }

  setWeight(exerciseId: string, setId: string, value: number): void {
    this.loadedExercises.update((list) =>
      this.sessionDraft.setWeight(list, exerciseId, setId, value),
    );
    this.afterEdit(exerciseId);
  }

  setNote(exerciseId: string, value: string): void {
    this.loadedExercises.update((list) =>
      this.sessionDraft.setNote(list, exerciseId, value),
    );
    this.afterEdit(exerciseId);
  }

  private commitRemoveExercise(sessionExerciseId: string): void {
    this.loadedExercises.update((list) =>
      this.sessionDraft.removeExercise(list, sessionExerciseId),
    );

    this.autosave.push(this.exerciseKey(sessionExerciseId), () =>
      this.saveSessionExerciseService
        .removeSessionExercise(this.id(), sessionExerciseId)
        .pipe(tap(() => this.persistedExercises.delete(sessionExerciseId))),
    );
  }

  private afterEdit(sessionExerciseId: string): void {
    if (this.isActiveHere) {
      this.activeWorkout.syncProgress(this.toActive());
      return;
    }
    this.queuePersist(sessionExerciseId);
  }

  get isActiveHere(): boolean {
    return this.activeWorkout.isActiveFor(this.id());
  }

  get doneCount(): number {
    return this.activeWorkout.doneCount(this.toActive());
  }

  get totalSets(): number {
    return this.activeWorkout.totalSets(this.toActive());
  }

  isSetDone(exerciseIndex: number, setIndex: number): boolean {
    return (
      this.isActiveHere && this.activeWorkout.isDone(exerciseIndex, setIndex)
    );
  }

  toggleSetDone(exerciseIndex: number, setIndex: number): void {
    this.activeWorkout.toggleDone(exerciseIndex, setIndex, this.toActive());
  }

  onStartWorkout(): void {
    if (this.exercises().length === 0 || this.activeWorkout.isActive()) {
      return;
    }

    this.activeWorkout
      .start(this.id(), this.name(), this.toActive())
      .subscribe({
        next: () => this.syncRestTarget(),
      });
  }

  private syncRestTarget(): void {
    if (!this.isActiveHere) {
      return;
    }

    this.activeWorkout.restTargetSeconds.set(this.restSeconds());
  }

  onFinishWorkout(): void {
    if (this.finishing()) {
      return;
    }

    this.showFinishModal.set(true);
  }

  onFinishModeChosen(templateSyncMode: string): void {
    if (this.finishing()) {
      return;
    }

    this.finishing.set(true);

    this.activeWorkout
      .finish(this.toActive(), templateSyncMode as TemplateSyncMode)
      .subscribe({
        next: () => {
          this.finishing.set(false);
          this.showFinishModal.set(false);
          this.router.navigate(["/gym/history"]);
        },
        error: () => this.finishing.set(false),
      });
  }

  onCancelFinish(): void {
    this.showFinishModal.set(false);
  }

  onPauseWorkout(): void {
    this.activeWorkout.pause(this.toActive());
  }

  onRequestStop(): void {
    this.showStopModal.set(true);
  }

  onConfirmStop(): void {
    this.activeWorkout.discard().subscribe({
      next: () => {
        this.showStopModal.set(false);
        this.loadSession();
      },
      error: () => this.showStopModal.set(false),
    });
  }

  onCancelStop(): void {
    this.showStopModal.set(false);
  }

  private queuePersist(sessionExerciseId: string): void {
    this.autosave.push(this.exerciseKey(sessionExerciseId), () =>
      this.persistExercise(sessionExerciseId),
    );
  }

  /**
   * Decided at run time, not when queued: a set edited right after adding the exercise
   * coalesces onto the same key and must still land as the creating PUT.
   */
  private persistExercise(sessionExerciseId: string): Observable<unknown> {
    const exercise = this.exercises().find(
      (candidate) => candidate.id === sessionExerciseId,
    );

    if (!exercise || !exercise.exerciseId) return of(void 0);

    const request = {
      exerciseId: exercise.exerciseId,
      note: exercise.note,
      sets: exercise.sets.map((set, index) => ({
        position: index + 1,
        reps: set.reps,
        weight: set.weight,
      })),
    };

    if (this.persistedExercises.has(sessionExerciseId)) {
      return this.saveSessionExerciseService.updateSessionExercise(
        this.id(),
        sessionExerciseId,
        request,
      );
    }

    return this.saveSessionExerciseService
      .addSessionExercise(this.id(), sessionExerciseId, request)
      .pipe(tap(() => this.persistedExercises.add(sessionExerciseId)));
  }

  /**
   * El servidor valida que el orden traiga exactamente sus ejercicios, así que los que
   * aún no se hayan creado (recién añadidos, con el guardado en cola) van antes.
   */
  private persistOrder(orderedIds: string[]): Observable<unknown> {
    const missing = orderedIds.filter(
      (sessionExerciseId) => !this.persistedExercises.has(sessionExerciseId),
    );

    const ensured =
      missing.length === 0
        ? of(void 0)
        : forkJoin(
            missing.map((sessionExerciseId) =>
              this.persistExercise(sessionExerciseId),
            ),
          ).pipe(map(() => void 0));

    return ensured.pipe(
      switchMap(() =>
        this.saveSessionExerciseService.reorderSessionExercises(
          this.id(),
          orderedIds,
        ),
      ),
    );
  }

  private exerciseKey(sessionExerciseId: string): string {
    return `exercise:${sessionExerciseId}`;
  }

  onRetrySave(): void {
    this.autosave.retry();
  }

  onEdit(): void {
    this.router.navigate(["/gym/sessions", this.id(), "edit"]);
  }

  onDelete(): void {
    this.showDeleteModal.set(true);
  }

  onConfirmDelete(): void {
    this.isDeleting.set(true);
    this.deleteSessionService.deleteSession(this.id()).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
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
