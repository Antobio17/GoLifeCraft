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
import { Subject, Subscription } from "rxjs";
import { debounceTime, delay } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
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
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { TextareaComponent } from "@shared/design-system/textarea/infrastructure/components/textarea.component";
import {
  MenuComponent,
  MenuItem,
} from "@shared/design-system/menu/infrastructure/components/menu.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { GetSessionService } from "../../application/services/get-session.service";
import { UpdateSessionService } from "../../application/services/update-session.service";
import { DeleteSessionService } from "../../application/services/delete-session.service";
import { SessionDraftService } from "../../application/services/session-draft.service";
import { GetExercisesService } from "@gym/library/exercise/application/services/get-exercises.service";
import { Exercise } from "@gym/library/exercise/domain/models/exercise.model";
import { ExerciseType } from "@gym/library/exercise/domain/models/exercise-type.model";
import { GetSessionResponse } from "../../domain/models/get-session-response.model";
import { SessionExerciseView } from "../../domain/models/session-detail.model";
import {
  ActiveExercise,
  ActiveWorkoutService,
} from "@gym/training/workout/application/services/active-workout.service";

@Component({
  selector: "app-session-detail",
  templateUrl: "./session-detail.component.html",
  styleUrls: ["./session-detail.component.css"],
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    ModalSheetComponent,
    SearchInputComponent,
    ConfirmActionModalComponent,
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
    SkeletonComponent,
    TextareaComponent,
    MenuComponent,
  ],
})
export class SessionDetailComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private getSessionService = inject(GetSessionService);
  private updateSessionService = inject(UpdateSessionService);
  private deleteSessionService = inject(DeleteSessionService);
  private sessionDraft = inject(SessionDraftService);
  private getExercisesService = inject(GetExercisesService);
  private floatingToastService = inject(FloatingToastService);
  protected activeWorkout = inject(ActiveWorkoutService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  private readonly MODULE_PATH = "gym/training/session";

  id = "";
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
  finishing = signal(false);

  readonly sessScrolled = signal(false);
  private readonly STICKY_COLLAPSE = 10;
  private readonly STICKY_EXPAND = 58;
  private stickySentinel?: HTMLElement;
  private stickyRaf = 0;
  private readonly onStickyScroll = () => this.scheduleStickyUpdate();

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

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener("scroll", this.onStickyScroll, { passive: true });
      window.addEventListener("resize", this.onStickyScroll, { passive: true });
    });
    this.scheduleStickyUpdate();
  }

  private scheduleStickyUpdate(): void {
    if (this.stickyRaf) {
      return;
    }
    this.stickyRaf = requestAnimationFrame(() => {
      this.stickyRaf = 0;
      this.updateStickyState();
    });
  }

  private updateStickyState(): void {
    const element = this.stickySentinel;
    if (!element) {
      return;
    }

    const top = element.getBoundingClientRect().top;
    const stuck = this.sessScrolled();
    const next = stuck ? top < this.STICKY_EXPAND : top <= this.STICKY_COLLAPSE;
    if (next === stuck) {
      return;
    }

    this.ngZone.run(() => this.sessScrolled.set(next));
  }

  private teardownStickyTracking(): void {
    if (this.stickyRaf) {
      cancelAnimationFrame(this.stickyRaf);
      this.stickyRaf = 0;
    }
    window.removeEventListener("scroll", this.onStickyScroll);
    window.removeEventListener("resize", this.onStickyScroll);
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

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
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

    this.finishing.set(true);

    this.activeWorkout
      .finish(this.toActive())
      .pipe(delay(400))
      .subscribe({
        next: () => {
          this.finishing.set(false);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "session.finish.toast",
            details: [],
          });
          this.router.navigate(["/gym/history"]);
        },
        error: () => this.finishing.set(false),
      });
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
        this.floatingToastService.showToast({
          status: 200,
          keyTranslation: "session.stop.toast",
          details: [],
        });
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
        this.floatingToastService.showToast({
          status: 200,
          keyTranslation: "session.delete.success",
          details: [],
        });
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
