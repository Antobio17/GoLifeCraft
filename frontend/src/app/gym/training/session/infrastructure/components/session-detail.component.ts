import {
  Component,
  DestroyRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
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
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { IconBadgeComponent } from "@shared/design-system/icon-badge/infrastructure/components/icon-badge.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ActiveWorkoutBannerComponent } from "@shared/design-system/active-workout-banner/infrastructure/components/active-workout-banner.component";
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
import { GetSessionService } from "../../application/services/get-session.service";
import { GetSessionStatsService } from "../../application/services/get-session-stats.service";
import { UpdateSessionService } from "../../application/services/update-session.service";
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

@Component({
  selector: "app-session-detail",
  templateUrl: "./session-detail.component.html",
  styleUrls: ["./session-detail.component.css"],
  imports: [
    FormsModule,
    NgTemplateOutlet,
    ContextualTranslatePipe,
    PageWrapperComponent,
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
  ],
})
export class SessionDetailComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private getSessionService = inject(GetSessionService);
  private getSessionStatsService = inject(GetSessionStatsService);
  private updateSessionService = inject(UpdateSessionService);
  private deleteSessionService = inject(DeleteSessionService);
  private sessionDraft = inject(SessionDraftService);
  private sessionProgress = inject(SessionProgressService);
  private getExercisesService = inject(GetExercisesService);
  protected activeWorkout = inject(ActiveWorkoutService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  private readonly MODULE_PATH = "gym/training/session";

  id = "";
  readonly skeletonExercises = [3, 4, 3];

  loading = signal(true);
  saving = signal(false);

  name = signal("");
  estimatedDurationMinutes = signal(0);
  exercises = signal<SessionExerciseView[]>([]);

  exerciseRows = computed(() =>
    this.exercises().map((exercise) => ({
      ...exercise,
      muscleLabel: this.muscleText(exercise),
      modeLabel: this.modeLabel(exercise.type),
    })),
  );

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
    const query = this.librarySearch().trim().toLowerCase();
    const items = query
      ? this.library().filter(
          (exercise) =>
            exercise.attributes.name.toLowerCase().includes(query) ||
            exercise.attributes.muscleGroups.some((muscle) =>
              muscle.toLowerCase().includes(query),
            ),
        )
      : this.library();

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

  readonly sessScrolled = signal(false);
  private readonly STICKY_TOP = 8;
  private readonly STICKY_BAND = 72;
  private stickySentinel?: HTMLElement;
  private stickyObservers: IntersectionObserver[] = [];

  @ViewChild(ActiveWorkoutBannerComponent)
  set bannerRef(ref: ActiveWorkoutBannerComponent | undefined) {
    const element = ref?.sentinelElement;
    if (element === this.stickySentinel) {
      return;
    }

    this.teardownStickyTracking();
    this.stickySentinel = element;
    if (!element) {
      this.sessScrolled.set(false);
      return;
    }

    const collapseLine = this.STICKY_TOP + 1;
    const expandLine = collapseLine + this.STICKY_BAND;

    const collapseObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          return;
        }
        this.ngZone.run(() => this.sessScrolled.set(true));
      },
      { rootMargin: `-${collapseLine}px 0px 0px 0px`, threshold: 0 },
    );
    const expandObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        this.ngZone.run(() => this.sessScrolled.set(false));
      },
      { rootMargin: `-${expandLine}px 0px 0px 0px`, threshold: 0 },
    );

    collapseObserver.observe(element);
    expandObserver.observe(element);
    this.stickyObservers = [collapseObserver, expandObserver];
  }

  private teardownStickyTracking(): void {
    this.stickyObservers.forEach((observer) => observer.disconnect());
    this.stickyObservers = [];
    this.stickySentinel = undefined;
  }

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
        this.loadStats();
        this.loadLibrary();
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

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.teardownStickyTracking();
  }

  private loadSession(): void {
    this.getSessionService
      .getSession(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: GetSessionResponse) => {
          const attributes = response.data.attributes;
          this.name.set(attributes.name);
          this.estimatedDurationMinutes.set(
            attributes.estimatedDurationMinutes,
          );
          this.activeWorkout.ensureRestored().subscribe({
            next: () => this.finalizeLoad(attributes.exercises),
            error: () => this.finalizeLoad(attributes.exercises),
          });
        },
        error: () => this.loading.set(false),
      });
  }

  private finalizeLoad(templateExercises: SessionExerciseView[]): void {
    this.templateExercises.set(this.sessionDraft.clone(templateExercises));
    this.seedExercises(templateExercises);
    this.loading.set(false);
    this.maybeAutoStart();
  }

  private seedExercises(templateExercises: SessionExerciseView[]): void {
    if (this.isActiveHere) {
      this.exercises.set(
        this.sessionDraft.fromActive(this.activeWorkout.liveExercises()),
      );
      return;
    }
    this.exercises.set(this.sessionDraft.clone(templateExercises));
  }

  private maybeAutoStart(): void {
    if (this.route.snapshot.queryParamMap.get("start") !== "1") {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });

    if (this.isActiveHere) {
      return;
    }

    this.onStartWorkout();
  }

  private loadStats(): void {
    this.statsLoading.set(true);

    this.getSessionStatsService
      .getSessionStats(this.id)
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

  get menuItems(): MenuItem[] {
    return [
      { value: "edit", label: this.t("getSession.edit"), icon: "pencil" },
      {
        value: "delete",
        label: this.t("getSession.delete"),
        icon: "trash",
        danger: true,
      },
    ];
  }

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
    this.exercises.update((list) =>
      this.sessionDraft.fromLibrary(list, exercise),
    );
    this.pickerOpen.set(false);
    this.afterEdit();
  }

  removeExercise(exerciseId: string): void {
    this.exercises.update((list) =>
      this.sessionDraft.removeExercise(list, exerciseId),
    );
    this.afterEdit();
  }

  addSet(exerciseId: string): void {
    this.exercises.update((list) => this.sessionDraft.addSet(list, exerciseId));
    this.afterEdit();
  }

  removeSet(exerciseId: string, setId: string): void {
    this.exercises.update((list) =>
      this.sessionDraft.removeSet(list, exerciseId, setId),
    );
    this.afterEdit();
  }

  setReps(exerciseId: string, setId: string, value: number): void {
    this.exercises.update((list) =>
      this.sessionDraft.setReps(list, exerciseId, setId, value),
    );
    this.afterEdit();
  }

  setWeight(exerciseId: string, setId: string, value: number): void {
    this.exercises.update((list) =>
      this.sessionDraft.setWeight(list, exerciseId, setId, value),
    );
    this.afterEdit();
  }

  setNote(exerciseId: string, value: string): void {
    this.exercises.update((list) =>
      this.sessionDraft.setNote(list, exerciseId, value),
    );
    this.afterEdit();
  }

  private afterEdit(): void {
    if (this.isActiveHere) {
      this.activeWorkout.syncProgress(this.toActive());
      return;
    }
    this.queuePersist();
  }

  get isActiveHere(): boolean {
    return this.activeWorkout.isActiveFor(this.id);
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
    if (this.exercises().length === 0) {
      return;
    }

    this.activeWorkout.start(this.id, this.name(), this.toActive()).subscribe({
      next: () => {},
    });
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

  private queuePersist(): void {
    this.persist$.next();
  }

  private persist(): void {
    this.saving.set(true);
    const payload = this.sessionDraft.toRequest(
      this.name(),
      this.estimatedDurationMinutes(),
      this.exercises(),
    );

    this.updateSessionService.updateSession(this.id, payload).subscribe({
      next: () => this.saving.set(false),
      error: () => this.saving.set(false),
    });
  }

  onEdit(): void {
    this.router.navigate(["/gym/sessions", this.id, "edit"]);
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
