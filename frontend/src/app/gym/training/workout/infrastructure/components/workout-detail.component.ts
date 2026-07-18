import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { WorkoutSummaryComponent } from "@shared/design-system/workout-summary/infrastructure/components/workout-summary.component";
import { WorkoutExerciseComponent } from "@shared/design-system/workout-exercise/infrastructure/components/workout-exercise.component";
import { GetWorkoutService } from "../../application/services/get-workout.service";
import {
  WorkoutDetailAttributes,
  WorkoutExerciseView,
} from "../../domain/models/workout-detail.model";

@Component({
  selector: "app-workout-detail",
  templateUrl: "./workout-detail.component.html",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    SkeletonComponent,
    WorkoutSummaryComponent,
    WorkoutExerciseComponent,
  ],
})
export class WorkoutDetailComponent implements OnInit {
  private translationService = inject(TranslationService);
  private getWorkoutService = inject(GetWorkoutService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  private readonly MODULE_PATH = "gym/training/workout";

  loading = signal(true);
  workout = signal<WorkoutDetailAttributes | null>(null);

  vm = computed(() => {
    const detail = this.workout();
    if (!detail) {
      return null;
    }

    return {
      sessionName: detail.sessionName,
      dateLabel: this.dateText(detail.startedAt),
      durationLabel: this.durationText(detail.durationSeconds),
      ratioLabel: this.ratioLabel(detail),
      exercises: detail.exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.exerciseName,
        muscleLabel: this.muscleText(exercise),
        ratio: this.exerciseRatio(exercise),
        note: exercise.note,
        sets: exercise.sets,
      })),
    };
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id") ?? "";

    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.getWorkoutService
          .getWorkout(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response) => {
              this.workout.set(response.data.attributes);
              this.loading.set(false);
            },
            error: () => this.loading.set(false),
          });
      });
  }

  t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  private muscleText(exercise: WorkoutExerciseView): string {
    return exercise.muscleGroups.join(" · ");
  }

  private exerciseRatio(exercise: WorkoutExerciseView): string {
    const done = exercise.sets.filter((set) => set.done).length;
    return `${done}/${exercise.sets.length}`;
  }

  private dateText(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private ratioLabel(attributes: WorkoutDetailAttributes): string {
    return `${this.completedSets(attributes)}/${this.totalSets(attributes)}`;
  }

  private durationText(totalSeconds: number): string {
    const seconds = Math.max(0, totalSeconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (value: number): string => String(value).padStart(2, "0");
    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
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

  goBack(): void {
    this.router.navigate(["/gym/history"]);
  }
}
