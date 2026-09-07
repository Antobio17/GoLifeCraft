import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { toObservable, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Observable, distinctUntilChanged, switchMap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { StatComponent } from "@shared/design-system/stat/infrastructure/components/stat.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SwipeToDeleteComponent } from "@shared/design-system/swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { AssignPantryLocationItemService } from "@nutrition/pantry/location/application/services/assign-pantry-location-item.service";
import { ReleasePantryLocationItemService } from "@nutrition/pantry/location/application/services/release-pantry-location-item.service";
import { DeletePantryLocationService } from "@nutrition/pantry/location/application/services/delete-pantry-location.service";
import { GetPantryLocationService } from "@nutrition/pantry/location/application/services/get-pantry-location.service";
import { GetPantryLocationItemsService } from "@nutrition/pantry/location/application/services/get-pantry-location-items.service";
import { GetPantryLocationCandidatesService } from "@nutrition/pantry/location/application/services/get-pantry-location-candidates.service";
import { PantryLocationViewService } from "@nutrition/pantry/location/application/services/pantry-location-view.service";
import { PantryLocationAttributes } from "../../domain/models/pantry-location-attributes.model";
import { PantryLocationItem } from "../../domain/models/pantry-location-item.model";
import { PantryLocationItemRow } from "../../domain/models/pantry-location-item-row.model";
import { PantryLocationCandidate } from "../../domain/models/pantry-location-candidate.model";
import { PantryLocationCandidateRow } from "../../domain/models/pantry-location-candidate-row.model";
import { PantryLocationItemKind } from "../../domain/models/pantry-location-item-kind.model";

const ALL_KINDS = "";

@Component({
  selector: "app-get-pantry-location",
  templateUrl: "./get-pantry-location.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    SplitViewComponent,
    StackComponent,
    CardComponent,
    TextComponent,
    StatComponent,
    ButtonComponent,
    SearchInputComponent,
    SegmentedToggleComponent,
    NoteComponent,
    EmptyStateComponent,
    SkeletonComponent,
    SkeletonScreenHeaderComponent,
    SectionHeaderComponent,
    ModalSheetComponent,
    SwipeToDeleteComponent,
    ConfirmActionModalComponent,
  ],
})
export class GetPantryLocationComponent {
  private translationService = inject(TranslationService);
  private getPantryLocationService = inject(GetPantryLocationService);
  private getItemsService = inject(GetPantryLocationItemsService);
  private getCandidatesService = inject(GetPantryLocationCandidatesService);
  private deletePantryLocationService = inject(DeletePantryLocationService);
  private assignItemService = inject(AssignPantryLocationItemService);
  private releaseItemService = inject(ReleasePantryLocationItemService);
  private locationView = inject(PantryLocationViewService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/pantry/location";

  readonly id = input.required<string>();

  attributes = signal<PantryLocationAttributes | null>(null);
  items = signal<PantryLocationItem[]>([]);
  candidates = signal<PantryLocationCandidate[]>([]);
  loading = signal(true);
  moving = signal(false);
  deleting = signal(false);
  showDeleteModal = signal(false);
  showAddSheet = signal(false);
  search = signal("");
  kind = signal<string>(ALL_KINDS);

  articleCount = computed(
    () =>
      this.items().filter(
        (item) => PantryLocationItemKind.ARTICLE === item.attributes.kind,
      ).length,
  );

  recipeCount = computed(
    () =>
      this.items().filter(
        (item) => PantryLocationItemKind.RECIPE === item.attributes.kind,
      ).length,
  );

  locationName = computed(() => this.attributes()?.name ?? "");

  title = computed(() => {
    const attributes = this.attributes();

    if (null === attributes) return "";

    return `${attributes.emoji} ${attributes.name}`.trim();
  });

  kindOptions = computed<SegmentedOption[]>(() => [
    { value: ALL_KINDS, label: this.t("getPantryLocation.kind.all") },
    {
      value: PantryLocationItemKind.ARTICLE,
      label: this.t("getPantryLocation.kind.articles"),
    },
    {
      value: PantryLocationItemKind.RECIPE,
      label: this.t("getPantryLocation.kind.recipes"),
    },
  ]);

  itemRows = computed<PantryLocationItemRow[]>(() =>
    this.items().map((item) => this.locationView.itemRow(item)),
  );

  candidateRows = computed<PantryLocationCandidateRow[]>(() =>
    this.candidates().map((candidate) =>
      this.locationView.candidateRow(candidate),
    ),
  );

  addLabel = computed(() => this.t("getPantryLocation.candidates.add"));

  removeLabel = computed(() => this.t("getPantryLocation.contents.remove"));

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((locationId) => {
          this.loading.set(true);

          return this.getPantryLocationService.getPantryLocation(locationId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.translationService
            .loadModuleTranslations(this.MODULE_PATH)
            .then(() => {
              this.attributes.set(response.data.attributes);
              this.loading.set(false);
              this.refreshItems();
              this.refreshCandidates();
            });
        },
        error: () => this.loading.set(false),
      });

    // ds-search-input already debounces what it emits, so this only drops repeats.
    toObservable(this.search)
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshCandidates());

    toObservable(this.kind)
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshCandidates());
  }

  protected t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  onKind(value: string): void {
    this.kind.set(value);
  }

  onOpenAddSheet(): void {
    this.showAddSheet.set(true);
  }

  onCloseAddSheet(): void {
    this.showAddSheet.set(false);
  }

  onPlace(row: PantryLocationCandidateRow): void {
    const { kind, refId } = row.candidate.attributes;

    this.track(
      this.assignItemService.assignPantryLocationItem(this.id(), {
        kind,
        refId,
      }),
    );
  }

  onRemove(row: PantryLocationItemRow): void {
    const { kind, refId } = row.item.attributes;

    this.track(
      this.releaseItemService.releasePantryLocationItem(this.id(), kind, refId),
    );
  }

  onEdit(): void {
    this.router.navigate(["/locations", this.id(), "edit"]);
  }

  onDelete(): void {
    this.showDeleteModal.set(true);
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  onConfirmDelete(): void {
    this.deleting.set(true);

    this.deletePantryLocationService.deletePantryLocation(this.id()).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.back();
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      },
    });
  }

  back(): void {
    this.router.navigate(["/locations"]);
  }

  private track(request: Observable<void>): void {
    if (this.moving()) return;

    this.moving.set(true);

    request.subscribe({
      next: () => {
        this.moving.set(false);
        this.refreshItems();
        this.refreshCandidates();
      },
      error: () => this.moving.set(false),
    });
  }

  private refreshItems(): void {
    this.getItemsService.getPantryLocationItems(this.id()).subscribe({
      next: (response) => this.items.set(response.data),
    });
  }

  private refreshCandidates(): void {
    this.getCandidatesService
      .getPantryLocationCandidates(
        this.id(),
        1,
        20,
        this.search() || undefined,
        this.kind() || undefined,
      )
      .subscribe({
        next: (response) => this.candidates.set(response.data),
      });
  }
}
