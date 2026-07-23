import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { Observable } from "rxjs";
import { GetExercisesService } from "@gym/library/exercise/application/services/get-exercises.service";
import { DeleteExerciseService } from "@gym/library/exercise/application/services/delete-exercise.service";
import { MuscleCatalogService } from "@gym/library/exercise/application/services/muscle-catalog.service";
import { Exercise } from "../../domain/models/exercise.model";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { DividerComponent } from "@shared/design-system/divider/infrastructure/components/divider.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { PressableComponent } from "@shared/design-system/pressable/infrastructure/components/pressable.component";
import { IconBadgeComponent } from "@shared/design-system/icon-badge/infrastructure/components/icon-badge.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import {
  SegmentedToggleComponent,
  SegmentedOption,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";

interface ExerciseRow {
  id: string;
  name: string;
  muscleText: string;
  exercise: Exercise;
}

interface ExerciseGroup {
  muscle: string;
  count: number;
  items: ExerciseRow[];
}

type LibraryView = "list" | "grouped";

@Component({
  selector: "app-get-exercises",
  templateUrl: "./get-exercises.component.html",
  imports: [
    FormsModule,
    NgTemplateOutlet,
    ContextualTranslatePipe,
    ConfirmActionModalComponent,
    PageWrapperComponent,
    ScreenHeaderComponent,
    SearchInputComponent,
    SegmentedToggleComponent,
    StackComponent,
    GridComponent,
    CardComponent,
    HeadingComponent,
    TextComponent,
    ChipComponent,
    DividerComponent,
    ButtonComponent,
    IconButtonComponent,
    IconBadgeComponent,
    PressableComponent,
    EmptyStateComponent,
    SkeletonComponent,
    InfiniteScrollComponent,
  ],
})
export class GetExercisesComponent extends AbstractListPageComponent<Exercise> {
  private static readonly LIST_PAGE_SIZE = 20;
  private static readonly GROUPED_PAGE_SIZE = 1000;

  private getExercisesService = inject(GetExercisesService);
  private deleteExerciseService = inject(DeleteExerciseService);
  private muscleCatalog = inject(MuscleCatalogService);
  private floatingToastService = inject(FloatingToastService);

  protected readonly modulePath = "gym/library/exercise";
  protected readonly storageKey = "pageSize_exercises";

  searchQuery = signal("");
  view = signal<LibraryView>("list");

  reloading = signal(false);
  loadingMore = signal(false);

  showDeleteModal = signal(false);
  exerciseToDelete = signal<Exercise | null>(null);
  isDeleting = signal(false);

  viewOptions = computed<SegmentedOption[]>(() => [
    { value: "list", label: this.t("getExercises.view.list") },
    { value: "grouped", label: this.t("getExercises.view.grouped") },
  ]);

  headerSubtitle = computed(() => {
    const exercises = this.t("getExercises.stats.exercises").toLowerCase();
    return `${this.totalItems()} ${exercises}`;
  });

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
          count: groupItems.length,
          items: groupItems.map((exercise) => this.toRow(exercise)),
        };
      })
      .filter((group) => group.count > 0);
  });

  hasMore = computed(
    () => "list" === this.view() && this.items().length < this.totalItems(),
  );

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(GetExercisesComponent.LIST_PAGE_SIZE);
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
      muscleText: this.muscleText(exercise),
      exercise,
    };
  }

  private muscleText(exercise: Exercise): string {
    const mode = this.t(
      `getExercises.type.${exercise.attributes.type.toLowerCase()}`,
    );
    return `${exercise.attributes.muscleGroups.join(" · ")} · ${mode}`;
  }

  goBack(): void {
    this.router.navigate(["/gym/sessions"]);
  }

  onCreate(): void {
    this.router.navigate(["/gym/exercises", "create"]);
  }

  onOpen(id: string): void {
    this.router.navigate(["/gym/exercises", id]);
  }

  onEdit(id: string): void {
    this.router.navigate(["/gym/exercises", id, "edit"]);
  }

  onDelete(exercise: Exercise): void {
    this.exerciseToDelete.set(exercise);
    this.showDeleteModal.set(true);
  }

  onConfirmDelete(): void {
    if (!this.exerciseToDelete()) return;

    this.isDeleting.set(true);
    this.deleteExerciseService
      .deleteExercise(this.exerciseToDelete()!.id)
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.showDeleteModal.set(false);
          this.exerciseToDelete.set(null);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "exercise.delete.success",
            details: [],
          });
          this.load();
        },
        error: () => {
          this.isDeleting.set(false);
          this.showDeleteModal.set(false);
          this.exerciseToDelete.set(null);
        },
      });
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
    this.exerciseToDelete.set(null);
  }
}
