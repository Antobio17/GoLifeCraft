import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
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
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
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
    FormsModule,
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
    NumberInputComponent,
    EmptyStateComponent,
    SkeletonComponent,
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

  private readonly MODULE_PATH = "gym/training/session";

  id = "";
  loading = signal(true);
  saving = signal(false);

  name = signal("");
  estimatedDurationMinutes = signal(0);
  exercises = signal<SessionExerciseView[]>([]);

  pickerOpen = signal(false);
  library = signal<Exercise[]>([]);
  librarySearch = signal("");

  showDeleteModal = signal(false);
  isDeleting = signal(false);

  showStopModal = signal(false);
  finishing = signal(false);

  readonly sessScrolled = signal(false);
  private readonly STICKY_TOP = 8;
  private readonly STICKY_BAND = 72;
  private stickyObservers: IntersectionObserver[] = [];

  @ViewChild("stickySentinel")
  set stickySentinelRef(ref: ElementRef<HTMLElement> | undefined) {
    this.disconnectStickyObservers();

    const element = ref?.nativeElement;
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
        this.sessScrolled.set(true);
      },
      { rootMargin: `-${collapseLine}px 0px 0px 0px`, threshold: 0 },
    );
    const expandObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        this.sessScrolled.set(false);
      },
      { rootMargin: `-${expandLine}px 0px 0px 0px`, threshold: 0 },
    );

    collapseObserver.observe(element);
    expandObserver.observe(element);
    this.stickyObservers = [collapseObserver, expandObserver];
  }

  private disconnectStickyObservers(): void {
    this.stickyObservers.forEach((observer) => observer.disconnect());
    this.stickyObservers = [];
  }

  readonly activeSwipedSetId = signal<string | null>(null);
  private swipeStartX = 0;
  private swipeStartY = 0;
  private readonly SWIPE_THRESHOLD = 48;

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
        this.restoreActiveWorkout();
      });
  }

  private restoreActiveWorkout(): void {
    if (this.activeWorkout.isActive()) {
      return;
    }
    this.activeWorkout.restoreActive().subscribe();
  }

  private toActive(): ActiveExercise[] {
    return this.exercises().map((exercise) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      muscleGroups: exercise.muscleGroups,
      type: exercise.type,
      sets: exercise.sets.map((set) => ({
        reps: set.reps,
        weight: set.weight,
      })),
    }));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.disconnectStickyObservers();
  }

  private loadSession(): void {
    this.getSessionService.getSession(this.id).subscribe({
      next: (response: GetSessionResponse) => {
        const attributes = response.data.attributes;
        this.name.set(attributes.name);
        this.estimatedDurationMinutes.set(attributes.estimatedDurationMinutes);
        this.exercises.set(this.sessionDraft.clone(attributes.exercises));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadLibrary(): void {
    this.getExercisesService.getExercises(1, 200).subscribe({
      next: (response) => this.library.set(response.data),
    });
  }

  get filteredLibrary(): Exercise[] {
    const query = this.librarySearch().trim().toLowerCase();
    if (!query) return this.library();
    return this.library().filter(
      (exercise) =>
        exercise.attributes.name.toLowerCase().includes(query) ||
        exercise.attributes.muscleGroups.some((muscle) =>
          muscle.toLowerCase().includes(query),
        ),
    );
  }

  muscleText(exercise: SessionExerciseView): string {
    return exercise.muscleGroups.join(" · ");
  }

  libraryMuscleText(exercise: Exercise): string {
    return exercise.attributes.muscleGroups.join(" · ");
  }

  modeLabel(type: string): string {
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
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation: "session.exercise.added",
      details: [],
    });
    this.queuePersist();
  }

  removeExercise(exerciseId: string): void {
    this.exercises.update((list) =>
      this.sessionDraft.removeExercise(list, exerciseId),
    );
    this.queuePersist();
  }

  toggleMode(exerciseId: string): void {
    this.exercises.update((list) =>
      this.sessionDraft.toggleMode(list, exerciseId),
    );
    this.queuePersist();
  }

  isSetSwiped(setId: string): boolean {
    return this.activeSwipedSetId() === setId;
  }

  onSetTouchStart(event: TouchEvent, setId: string): void {
    if (this.activeSwipedSetId() !== setId) {
      this.activeSwipedSetId.set(null);
    }
    this.swipeStartX = event.touches[0].clientX;
    this.swipeStartY = event.touches[0].clientY;
  }

  onSetTouchEnd(event: TouchEvent, exerciseId: string, setId: string): void {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.swipeStartX;
    const deltaY = Math.abs(touch.clientY - this.swipeStartY);

    if (deltaY > Math.abs(deltaX)) {
      return;
    }

    if (deltaX < -this.SWIPE_THRESHOLD) {
      if (this.activeSwipedSetId() === setId) {
        this.activeSwipedSetId.set(null);
        this.removeSet(exerciseId, setId);
      } else {
        this.activeSwipedSetId.set(setId);
      }
    } else if (deltaX > this.SWIPE_THRESHOLD / 2) {
      this.activeSwipedSetId.set(null);
    }
  }

  addSet(exerciseId: string): void {
    this.exercises.update((list) => this.sessionDraft.addSet(list, exerciseId));
    this.queuePersist();
    this.syncActiveProgress();
  }

  removeSet(exerciseId: string, setId: string): void {
    this.exercises.update((list) =>
      this.sessionDraft.removeSet(list, exerciseId, setId),
    );
    this.queuePersist();
    this.syncActiveProgress();
  }

  setReps(exerciseId: string, setId: string, value: number): void {
    this.exercises.update((list) =>
      this.sessionDraft.setReps(list, exerciseId, setId, value),
    );
    this.queuePersist();
    this.syncActiveProgress();
  }

  setWeight(exerciseId: string, setId: string, value: number): void {
    this.exercises.update((list) =>
      this.sessionDraft.setWeight(list, exerciseId, setId, value),
    );
    this.queuePersist();
    this.syncActiveProgress();
  }

  private syncActiveProgress(): void {
    if (!this.isActiveHere) {
      return;
    }
    this.activeWorkout.syncProgress(this.toActive());
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
      next: () => {
        this.floatingToastService.showToast({
          status: 200,
          keyTranslation: "session.start.toast",
          details: [],
        });
      },
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
