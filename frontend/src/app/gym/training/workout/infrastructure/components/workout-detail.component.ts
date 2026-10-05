import { Component, computed, inject, input, signal } from "@angular/core";
import { Router } from "@angular/router";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";
import { StatStripComponent } from "@shared/design-system/stat-strip/infrastructure/components/stat-strip.component";
import { ExercisePanelComponent } from "@shared/design-system/exercise-panel/infrastructure/components/exercise-panel.component";
import { SetHeaderComponent } from "@shared/design-system/set-header/infrastructure/components/set-header.component";
import { SetLineComponent } from "@shared/design-system/set-line/infrastructure/components/set-line.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { GetWorkoutService } from "../../application/services/get-workout.service";
import { WorkoutVolumeService } from "../../application/services/workout-volume.service";
import { WorkoutShareTextService } from "../../application/services/workout-share-text.service";
import {
  WorkoutDetailAttributes,
  WorkoutExerciseView,
} from "../../domain/models/workout-detail.model";
import { WorkoutDetailView } from "../../domain/models/workout-detail-view.model";
import { WorkoutExercisePanelView } from "../../domain/models/workout-exercise-panel-view.model";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
import { SetNumberingService } from "@gym/training/session/application/services/set-numbering.service";
import { ExerciseSetSummaryService } from "@gym/training/session/application/services/exercise-set-summary.service";
import { ClipboardService } from "@shared/clipboard/application/services/clipboard.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";

const KG_PER_TONNE = 1000;

@Component({
  selector: "app-workout-detail",
  templateUrl: "./workout-detail.component.html",
  imports: [
    ContextualTranslatePipe,
    RevealDirective,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    StackComponent,
    CardComponent,
    TextComponent,
    HeadingComponent,
    ButtonComponent,
    NoteComponent,
    EmptyStateComponent,
    SectionHeaderComponent,
    StatStripComponent,
    ExercisePanelComponent,
    SetHeaderComponent,
    SetLineComponent,
    SkeletonComponent,
    SkeletonListComponent,
    SkeletonScreenHeaderComponent,
    SkeletonSectionHeaderComponent,
  ],
})
export class WorkoutDetailComponent {
  private translationService = inject(TranslationService);
  private backNavigation = inject(BackNavigationService);
  private getWorkoutService = inject(GetWorkoutService);
  private setNumbering = inject(SetNumberingService);
  private setSummary = inject(ExerciseSetSummaryService);
  private workoutVolume = inject(WorkoutVolumeService);
  private workoutShareText = inject(WorkoutShareTextService);
  private clipboardService = inject(ClipboardService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);

  private readonly MODULE_PATH = "gym/training/workout";

  readonly id = input.required<string>();

  loading = signal(true);
  workout = signal<WorkoutDetailAttributes | null>(null);
  private collapsedIds = signal<ReadonlySet<string>>(new Set());

  vm = computed<WorkoutDetailView | null>(() => {
    const detail = this.workout();
    if (!detail) {
      return null;
    }

    const startedAt = new Date(detail.startedAt);
    const completed = this.completedSets(detail);
    const total = this.totalSets(detail);

    return {
      sessionName: detail.sessionName,
      statusLabel: this.t(
        completed === total
          ? "getWorkout.status.complete"
          : "getWorkout.status.partial",
      ),
      dateLabel: this.dateText(startedAt, detail.startedAt),
      timeLabel: this.timeText(startedAt, detail.finishedAt),
      stats: [
        this.durationStat(detail.durationSeconds),
        {
          value: `${completed}/${total}`,
          label: this.t("getWorkout.sets"),
        },
        this.volumeStat(this.workoutVolume.workoutVolumeKg(detail.exercises)),
      ],
    };
  });

  exerciseRows = computed<WorkoutExercisePanelView[]>(() => {
    const detail = this.workout();
    if (!detail) {
      return [];
    }

    const collapsed = this.collapsedIds();

    return detail.exercises.map((exercise) =>
      this.exerciseRow(exercise, !collapsed.has(exercise.id)),
    );
  });

  private allCollapsed = computed(() => {
    const rows = this.exerciseRows();
    return rows.length > 0 && rows.every((row) => !row.expanded);
  });

  toggleAllLabel = computed(() =>
    this.t(
      this.allCollapsed()
        ? "getWorkout.section.expandAll"
        : "getWorkout.section.collapseAll",
    ),
  );

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

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
        this.workout.set(response?.data.attributes ?? null);
        this.collapsedIds.set(new Set());
        this.loading.set(false);
      });
  }

  t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  toggleExercise(exerciseId: string): void {
    this.collapsedIds.update((current) => {
      const next = new Set(current);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
        return next;
      }
      next.add(exerciseId);
      return next;
    });
  }

  toggleAll(): void {
    if (this.allCollapsed()) {
      this.collapsedIds.set(new Set());
      return;
    }

    this.collapsedIds.set(new Set(this.exerciseRows().map((row) => row.id)));
  }

  private exerciseRow(
    exercise: WorkoutExerciseView,
    expanded: boolean,
  ): WorkoutExercisePanelView {
    const doneSets = exercise.sets.filter((set) => set.done);
    const summary = this.setSummary.summarize(
      doneSets.length > 0 ? doneSets : exercise.sets,
    );
    const complete =
      exercise.sets.length > 0 && doneSets.length === exercise.sets.length;

    return {
      id: exercise.id,
      name: exercise.exerciseName,
      muscleLabel: exercise.muscleGroups.join(" · "),
      summaryLabel: this.setSummary.schemeLabel(summary),
      loadLabel: summary.topWeightKg > 0 ? `${summary.topWeightKg} kg` : "",
      progressLabel: complete
        ? ""
        : `${doneSets.length}/${exercise.sets.length}`,
      expanded,
      note: exercise.note,
      sets: this.setNumbering.rows(exercise.sets),
    };
  }

  private volumeStat(volumeKg: number): StatStripItem {
    if (volumeKg >= KG_PER_TONNE) {
      return {
        value: this.number(volumeKg / KG_PER_TONNE, 1),
        unit: "t",
        label: this.t("getWorkout.volume"),
      };
    }

    return {
      value: this.number(volumeKg),
      unit: "kg",
      label: this.t("getWorkout.volume"),
    };
  }

  private dateText(date: Date, fallback: string): string {
    if (Number.isNaN(date.getTime())) {
      return fallback;
    }

    const text = new Intl.DateTimeFormat(this.locale(), {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);

    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private timeText(startedAt: Date, finishedAt: string | null): string {
    if (Number.isNaN(startedAt.getTime())) {
      return "";
    }

    const formatter = new Intl.DateTimeFormat(this.locale(), {
      hour: "2-digit",
      minute: "2-digit",
    });
    const start = formatter.format(startedAt);
    const end = finishedAt ? new Date(finishedAt) : null;

    if (!end || Number.isNaN(end.getTime())) {
      return start;
    }

    return `${start} – ${formatter.format(end)}`;
  }

  private durationStat(totalSeconds: number): StatStripItem {
    const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
    const label = this.t("getWorkout.duration");

    if (minutes < 60) {
      return { value: `${minutes}`, unit: "min", label };
    }

    const rest = String(minutes % 60).padStart(2, "0");
    return { value: `${Math.floor(minutes / 60)}:${rest}`, unit: "h", label };
  }

  private completedSets(attributes: WorkoutDetailAttributes): number {
    return attributes.exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.filter((set) => set.done).length,
      0,
    );
  }

  private totalSets(attributes: WorkoutDetailAttributes): number {
    return attributes.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    );
  }

  private number(value: number, fractionDigits = 0): string {
    return new Intl.NumberFormat(this.locale(), {
      maximumFractionDigits: fractionDigits,
    }).format(value);
  }

  private locale(): string {
    return this.translationService.getLocale();
  }

  goBack(): void {
    this.backNavigation.back(["/gym/history"]);
  }

  onEdit(): void {
    this.router.navigate(["/gym/history", this.id(), "edit"]);
  }

  async onCopy(): Promise<void> {
    const detail = this.workout();
    if (!detail) return;

    const copied = await this.clipboardService.copy(
      this.workoutShareText.build(detail, {
        sets: this.t("getWorkout.copy.sets"),
        reps: this.t("getWorkout.copy.reps"),
        bilateral: this.t("getWorkout.copy.bilateral"),
        unilateral: this.t("getWorkout.copy.unilateral"),
        perSide: this.t("getWorkout.copy.perSide"),
        totalWeight: this.t("getWorkout.copy.totalWeight"),
      }),
    );

    this.floatingToastService.showToast({
      status: copied ? 200 : 500,
      keyTranslation: copied ? "workout.copy.done" : "workout.copy.failed",
      details: [],
    });
  }
}
