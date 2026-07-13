import { Component, computed, inject } from "@angular/core";
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
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";

@Component({
  selector: "app-get-workouts",
  templateUrl: "./get-workouts.component.html",
  imports: [
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
    SkeletonComponent,
  ],
})
export class GetWorkoutsComponent extends AbstractListPageComponent<Workout> {
  private getWorkoutsService = inject(GetWorkoutsService);

  protected readonly modulePath = "gym/training/workout";
  protected readonly storageKey = "pageSize_workouts";

  headerSubtitle = computed(
    () => `${this.totalItems()} ${this.t("getWorkouts.subtitle")}`,
  );

  protected configureList(): void {
    this.pageSize.set(50);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Workout>> {
    return this.getWorkoutsService.getWorkouts(page, pageSize);
  }

  ratioLabel(attributes: WorkoutListAttributes): string {
    return `${attributes.completedSets}/${attributes.totalSets}`;
  }

  progressPercent(attributes: WorkoutListAttributes): number {
    if (attributes.totalSets <= 0) {
      return 0;
    }
    return Math.round((attributes.completedSets / attributes.totalSets) * 100);
  }

  exercisesLabel(attributes: WorkoutListAttributes): string {
    return `${attributes.exerciseCount} ${this.t("getWorkouts.card.exercises")}`;
  }

  dateText(value: string): string {
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

  durationText(totalSeconds: number): string {
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
