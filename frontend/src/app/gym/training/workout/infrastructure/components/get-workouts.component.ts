import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable } from "rxjs";
import { GetWorkoutsService } from "@gym/training/workout/application/services/get-workouts.service";
import {
  Workout,
  WorkoutListAttributes,
} from "../../domain/models/workout.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ProgressBarComponent } from "@shared/design-system/progress-bar/infrastructure/components/progress-bar.component";
import { MetaItemComponent } from "@shared/design-system/meta-item/infrastructure/components/meta-item.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";

interface WorkoutRow {
  id: string;
  sessionName: string;
  dateLabel: string;
  ratioLabel: string;
  progressPercent: number;
  durationLabel: string;
  exercisesLabel: string;
}

@Component({
  selector: "app-get-workouts",
  templateUrl: "./get-workouts.component.html",
  imports: [
    RevealDirective,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    GridComponent,
    CardComponent,
    HeadingComponent,
    TextComponent,
    IconComponent,
    ChipComponent,
    ProgressBarComponent,
    MetaItemComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    InfiniteScrollComponent,
  ],
})
export class GetWorkoutsComponent extends AbstractListPageComponent<Workout> {
  private static readonly PAGE_SIZE = 20;

  private getWorkoutsService = inject(GetWorkoutsService);

  protected readonly modulePath = "gym/training/workout";
  protected readonly storageKey = "pageSize_workouts";
  protected override readonly appendsPages = true;

  loadingMore = signal(false);

  hasMore = computed(() => this.items().length < this.totalItems());

  headerSubtitle = computed(
    () => `${this.totalItems()} ${this.t("getWorkouts.subtitle")}`,
  );

  rows = computed<WorkoutRow[]>(() =>
    this.items().map((workout) => ({
      id: workout.id,
      sessionName: workout.attributes.sessionName,
      dateLabel: this.dateText(workout.attributes.startedAt),
      ratioLabel: this.ratioLabel(workout.attributes),
      progressPercent: this.progressPercent(workout.attributes),
      durationLabel: this.durationText(workout.attributes.durationSeconds),
      exercisesLabel: this.exercisesLabel(workout.attributes),
    })),
  );

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(GetWorkoutsComponent.PAGE_SIZE);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Workout>> {
    return this.getWorkoutsService.getWorkouts(page, pageSize);
  }

  loadMore(): void {
    if (this.loading() || this.loadingMore() || !this.hasMore()) return;

    const nextPage = this.currentPage() + 1;
    this.loadingMore.set(true);

    this.fetch(nextPage, this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.currentPage.set(nextPage);
          this.items.update((current) => [...current, ...response.data]);
          this.totalItems.set(response.meta.total);
          this.loadingMore.set(false);
        },
        error: () => this.loadingMore.set(false),
      });
  }

  private ratioLabel(attributes: WorkoutListAttributes): string {
    return `${attributes.completedSets}/${attributes.totalSets}`;
  }

  private progressPercent(attributes: WorkoutListAttributes): number {
    if (attributes.totalSets <= 0) {
      return 0;
    }
    return Math.round((attributes.completedSets / attributes.totalSets) * 100);
  }

  private exercisesLabel(attributes: WorkoutListAttributes): string {
    return `${attributes.exerciseCount} ${this.t("getWorkouts.card.exercises")}`;
  }

  private dateText(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  private durationText(totalSeconds: number): string {
    const seconds = Math.max(0, totalSeconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  goBack(): void {
    this.router.navigate(["/gym"]);
  }

  onOpen(id: string): void {
    this.router.navigate(["/gym/history", id]);
  }
}
