import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { Observable } from "rxjs";
import { GetExercisesService } from "@gym/library/exercise/application/services/get-exercises.service";
import { MuscleCatalogService } from "@gym/library/exercise/application/services/muscle-catalog.service";
import { Exercise } from "../../domain/models/exercise.model";
import { ExerciseWeightMode } from "../../domain/models/exercise-weight-mode.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import { ViewSwitchComponent } from "@shared/design-system/view-switch/infrastructure/components/view-switch.component";
import { ViewSwitchOption } from "@shared/design-system/view-switch/domain/models/view-switch-option.model";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { ExerciseRowComponent } from "@shared/design-system/exercise-row/infrastructure/components/exercise-row.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";

interface ExerciseRow {
  id: string;
  name: string;
  muscles: string;
  tags: string[];
  icon: DsIconName;
}

interface ExerciseGroup {
  muscle: string;
  countLabel: string;
  items: ExerciseRow[];
}

type LibraryView = "list" | "grouped";

@Component({
  selector: "app-get-exercises",
  templateUrl: "./get-exercises.component.html",
  imports: [
    RevealDirective,
    FormsModule,
    NgTemplateOutlet,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    SearchInputComponent,
    ViewSwitchComponent,
    StackComponent,
    GridComponent,
    SectionHeaderComponent,
    ExerciseRowComponent,
    ButtonComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    SkeletonSectionHeaderComponent,
    SkeletonComponent,
    InfiniteScrollComponent,
  ],
})
export class GetExercisesComponent extends AbstractListPageComponent<Exercise> {
  private static readonly LIST_PAGE_SIZE = 20;
  private static readonly GROUPED_PAGE_SIZE = 1000;

  private getExercisesService = inject(GetExercisesService);
  private backNavigation = inject(BackNavigationService);
  private muscleCatalog = inject(MuscleCatalogService);

  protected readonly modulePath = "gym/library/exercise";
  protected readonly storageKey = "pageSize_exercises";
  protected override readonly appendsPages = true;

  searchQuery = signal("");
  readonly skeletonGroups = [4, 2, 3];

  view = signal<LibraryView>("grouped");

  reloading = signal(false);
  loadingMore = signal(false);

  viewOptions = computed<ViewSwitchOption[]>(() => [
    {
      value: "grouped",
      label: this.t("getExercises.view.grouped"),
      icon: "viewGrouped",
    },
    {
      value: "list",
      label: this.t("getExercises.view.list"),
      icon: "viewList",
    },
  ]);

  headerSubtitle = computed(() => {
    const exercises = this.t("getExercises.stats.exercises").toLowerCase();
    return `${this.totalItems()} ${exercises}`;
  });

  noResultsText = computed(
    () => `${this.t("getExercises.noResults")} “${this.searchQuery()}”`,
  );

  rows = computed<ExerciseRow[]>(() =>
    this.items().map((exercise) => this.toRow(exercise)),
  );

  groupedItems = computed<ExerciseGroup[]>(() => {
    const items = this.items();

    return this.muscleCatalog
      .all()
      .map((muscle) => {
        const groupItems = items.filter((exercise) =>
          exercise.attributes.muscleGroups.includes(muscle),
        );
        return {
          muscle,
          countLabel: `${groupItems.length}`,
          items: groupItems.map((exercise) => this.toRow(exercise)),
        };
      })
      .filter((group) => group.items.length > 0);
  });

  hasMore = computed(
    () => "list" === this.view() && this.items().length < this.totalItems(),
  );

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(GetExercisesComponent.GROUPED_PAGE_SIZE);
  }

  protected override captureFilters(): Record<string, string> {
    return { search: this.searchQuery(), view: this.view() };
  }

  protected override restoreFilters(filters: Record<string, string>): void {
    this.searchQuery.set(filters["search"] ?? "");
    this.view.set((filters["view"] as LibraryView) ?? "grouped");
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Exercise>> {
    return this.getExercisesService.getExercises(
      page,
      pageSize,
      this.searchQuery().trim() || undefined,
    );
  }

  loadMore(): void {
    if (
      "list" !== this.view() ||
      this.loading() ||
      this.loadingMore() ||
      this.reloading() ||
      !this.hasMore()
    )
      return;

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

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.reload();
  }

  onViewChange(view: LibraryView): void {
    this.view.set(view);
    this.pageSize.set(
      "grouped" === view
        ? GetExercisesComponent.GROUPED_PAGE_SIZE
        : GetExercisesComponent.LIST_PAGE_SIZE,
    );
    this.reload();
  }

  private reload(): void {
    this.currentPage.set(1);
    this.reloading.set(true);

    this.fetch(1, this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
          this.totalItems.set(response.meta.total);
          this.reloading.set(false);
        },
        error: () => this.reloading.set(false),
      });
  }

  private toRow(exercise: Exercise): ExerciseRow {
    return {
      id: exercise.id,
      name: exercise.attributes.name,
      muscles: exercise.attributes.muscleGroups.join(" · "),
      tags: [
        this.t(`getExercises.type.${exercise.attributes.type.toLowerCase()}`),
        this.t(
          `getExercises.weightMode.${exercise.attributes.weightMode ?? ExerciseWeightMode.Total}`,
        ),
      ],
      icon: (exercise.attributes.icon as DsIconName) ?? "dumbbell",
    };
  }

  goBack(): void {
    this.backNavigation.back(["/gym/sessions"]);
  }

  onCreate(): void {
    this.router.navigate(["/gym/exercises", "create"]);
  }

  onOpen(id: string): void {
    this.router.navigate(["/gym/exercises", id]);
  }
}
