import { Component, computed, inject } from "@angular/core";
import { Observable } from "rxjs";
import { GetWorkoutsService } from "@gym/training/workout/application/services/get-workouts.service";
import { Workout } from "../../domain/models/workout.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
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
    ChipComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
})
export class GetWorkoutsComponent extends AbstractListPageComponent<Workout> {
  private getWorkoutsService = inject(GetWorkoutsService);

  protected readonly modulePath = "gym/training/workout";
  protected readonly storageKey = "pageSize_workouts";

  headerSubtitle = computed(() => {
    const workouts = this.t("getWorkouts.stats.workouts").toLowerCase();
    return `${this.totalItems()} ${workouts}`;
  });

  protected configureList(): void {
    this.pageSize.set(50);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Workout>> {
    return this.getWorkoutsService.getWorkouts(page, pageSize);
  }

  summaryText(workout: Workout): string {
    const sets = this.t("getWorkouts.card.sets");
    return `${this.dateText(workout.attributes.startedAt)} · ${this.durationText(
      workout.attributes.durationSeconds,
    )} · ${workout.attributes.completedSets}/${workout.attributes.totalSets} ${sets}`;
  }

  dateText(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
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

  onOpen(id: string): void {
    this.router.navigate(["/gym/history", id]);
  }
}
