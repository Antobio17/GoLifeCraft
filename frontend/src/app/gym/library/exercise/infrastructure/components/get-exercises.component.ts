import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { Observable } from "rxjs";
import { GetExercisesService } from "@gym/library/exercise/application/services/get-exercises.service";
import { DeleteExerciseService } from "@gym/library/exercise/application/services/delete-exercise.service";
import { Exercise } from "../../domain/models/exercise.model";
import { MUSCLE_GROUPS } from "../../domain/constants/muscle-groups.constants";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import {
  SegmentedToggleComponent,
  SegmentedOption,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";

interface ExerciseGroup {
  muscle: string;
  count: number;
  items: Exercise[];
}

type LibraryView = "list" | "grouped";

@Component({
  selector: "app-get-exercises",
  templateUrl: "./get-exercises.component.html",
  styleUrls: ["./gym-list.css"],
  imports: [
    FormsModule,
    NgTemplateOutlet,
    ContextualTranslatePipe,
    ConfirmActionModalComponent,
    PageWrapperComponent,
    ScreenHeaderComponent,
    SearchInputComponent,
    SegmentedToggleComponent,
  ],
})
export class GetExercisesComponent extends AbstractListPageComponent<Exercise> {
  private getExercisesService = inject(GetExercisesService);
  private deleteExerciseService = inject(DeleteExerciseService);
  private floatingToastService = inject(FloatingToastService);

  protected readonly modulePath = "gym/library/exercise";
  protected readonly storageKey = "pageSize_exercises";

  searchQuery = signal("");
  view = signal<LibraryView>("list");

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

  filteredItems = computed<Exercise[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.items();

    return this.items().filter(
      (exercise) =>
        exercise.attributes.name.toLowerCase().includes(query) ||
        exercise.attributes.muscleGroups.some((muscle) =>
          muscle.toLowerCase().includes(query),
        ),
    );
  });

  groupedItems = computed<ExerciseGroup[]>(() => {
    const items = this.filteredItems();

    return MUSCLE_GROUPS.map((muscle) => {
      const groupItems = items.filter((exercise) =>
        exercise.attributes.muscleGroups.includes(muscle),
      );
      return { muscle, count: groupItems.length, items: groupItems };
    }).filter((group) => group.count > 0);
  });

  hasResults = computed(() => this.filteredItems().length > 0);

  protected configureList(): void {
    this.pageSize.set(100);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Exercise>> {
    return this.getExercisesService.getExercises(page, pageSize);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  muscleText(exercise: Exercise): string {
    const mode = this.t(`getExercises.type.${exercise.attributes.type}`);
    return `${exercise.attributes.muscleGroups.join(" · ")} · ${mode}`;
  }

  goBack(): void {
    this.router.navigate(["/gym/sessions"]);
  }

  onCreate(): void {
    this.router.navigate(["/gym/exercises", "create"]);
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
