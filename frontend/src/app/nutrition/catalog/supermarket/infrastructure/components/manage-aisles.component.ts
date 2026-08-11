import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import {
  Observable,
  Subject,
  debounceTime,
  forkJoin,
  mergeMap,
  of,
} from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { StoreTabsComponent } from "@shared/design-system/store-tabs/infrastructure/components/store-tabs.component";
import { AisleListComponent } from "@shared/design-system/aisle-list/infrastructure/components/aisle-list.component";
import { AisleListMove } from "@shared/design-system/aisle-list/domain/models/aisle-list-move.model";
import { Supermarket } from "../../domain/models/supermarket.model";
import { SupermarketAisle } from "../../domain/models/supermarket-aisle.model";
import { AisleCatalogService } from "../../application/services/aisle-catalog.service";
import { UpdateSupermarketAislesService } from "../../application/services/update-supermarket-aisles.service";

@Component({
  selector: "app-manage-aisles",
  templateUrl: "./manage-aisles.component.html",
  imports: [
    FormsModule,
    ModalSheetComponent,
    StackComponent,
    TextComponent,
    TextInputComponent,
    ButtonComponent,
    StoreTabsComponent,
    AisleListComponent,
  ],
})
export class ManageAislesComponent {
  private translationService = inject(TranslationService);
  private floatingToastService = inject(FloatingToastService);
  private aisleCatalog = inject(AisleCatalogService);
  private updateSupermarketAislesService = inject(
    UpdateSupermarketAislesService,
  );
  private destroyRef = inject(DestroyRef);

  private readonly MODULE_PATH = "nutrition/catalog/supermarket";
  private readonly pendingSaves = new Subject<void>();
  private dirtyStores = new Set<string>();

  @Input() set open(value: boolean) {
    this.isOpen.set(value);
  }

  @Input() set supermarkets(value: Supermarket[]) {
    this.stores.set(value);

    if (this.dirtyStores.size > 0) return;

    this.aislesByStore.set(this.buildAisles(value));
  }

  @Input() set supermarketId(value: string | null) {
    this.requestedStore.set(value);
  }

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  isOpen = signal(false);
  stores = signal<Supermarket[]>([]);
  aislesByStore = signal<Record<string, SupermarketAisle[]>>({});
  requestedStore = signal<string | null>(null);
  newAisleName = signal("");

  activeStore = computed(() => {
    const requested = this.requestedStore();
    const stores = this.stores();

    if (requested && stores.some((store) => store.id === requested)) {
      return requested;
    }

    return stores[0]?.id ?? null;
  });

  storeTabs = computed(() =>
    this.stores().map((store) => ({
      key: store.id,
      label: store.attributes.name,
      count: (this.aislesByStore()[store.id] ?? []).length,
    })),
  );

  activeAisles = computed(() => {
    const store = this.activeStore();
    if (!store) return [];

    return this.aislesByStore()[store] ?? [];
  });

  hasStores = computed(() => this.stores().length > 0);

  title = computed(() => this.t("aisles.title"));
  subtitle = computed(() => this.t("aisles.subtitle"));
  closeLabel = computed(() => this.t("aisles.close"));
  emptyText = computed(() => this.t("aisles.empty"));
  noStoresText = computed(() => this.t("aisles.noStores"));
  removeLabel = computed(() => this.t("aisles.remove"));
  moveUpLabel = computed(() => this.t("aisles.moveUp"));
  moveDownLabel = computed(() => this.t("aisles.moveDown"));
  addLabel = computed(() => this.t("aisles.add"));
  placeholder = computed(() => this.t("aisles.placeholder"));

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

    this.pendingSaves
      .pipe(
        debounceTime(350),
        mergeMap(() => this.flushDirtyStores()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.saved.emit(),
      });
  }

  onSelectStore(storeId: string): void {
    this.requestedStore.set(storeId);
    this.newAisleName.set("");
  }

  onNameChange(name: string): void {
    this.newAisleName.set(name);
  }

  onAdd(): void {
    const store = this.activeStore();
    if (!store) return;

    const name = this.newAisleName();
    const next = this.aisleCatalog.add(this.activeAisles(), name);

    if (!next) {
      this.warnDuplicatedName(name);
      return;
    }

    this.newAisleName.set("");
    this.applyAisles(store, next);
  }

  onRemove(aisleId: string): void {
    const store = this.activeStore();
    if (!store) return;

    this.applyAisles(
      store,
      this.aisleCatalog.remove(this.activeAisles(), aisleId),
    );
  }

  onMove(move: AisleListMove): void {
    const store = this.activeStore();
    if (!store) return;

    this.applyAisles(
      store,
      this.aisleCatalog.move(this.activeAisles(), move.from, move.to),
    );
  }

  onClose(): void {
    this.newAisleName.set("");
    this.closed.emit();
  }

  private applyAisles(storeId: string, aisles: SupermarketAisle[]): void {
    this.aislesByStore.update((current) => ({ ...current, [storeId]: aisles }));
    this.dirtyStores.add(storeId);
    this.pendingSaves.next();
  }

  private flushDirtyStores(): Observable<unknown> {
    const storeIds = [...this.dirtyStores];
    this.dirtyStores.clear();

    if (0 === storeIds.length) return of(null);

    return forkJoin(storeIds.map((storeId) => this.persist(storeId)));
  }

  private persist(storeId: string): Observable<void> {
    return this.updateSupermarketAislesService.updateSupermarketAisles(
      storeId,
      {
        aisles: this.aisleCatalog.toRequest(
          this.aislesByStore()[storeId] ?? [],
        ),
      },
    );
  }

  private warnDuplicatedName(name: string): void {
    if ("" === name.trim()) return;

    this.floatingToastService.showToast({
      status: 400,
      keyTranslation: "supermarket.aisle.already.exists",
      details: { name },
    });
  }

  private buildAisles(
    supermarkets: Supermarket[],
  ): Record<string, SupermarketAisle[]> {
    const aisles: Record<string, SupermarketAisle[]> = {};

    supermarkets.forEach((supermarket) => {
      aisles[supermarket.id] = this.aisleCatalog.aislesOf(supermarket);
    });

    return aisles;
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }
}
