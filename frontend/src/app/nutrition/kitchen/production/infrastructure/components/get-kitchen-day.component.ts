import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { UndoService } from "@shared/undo/application/services/undo.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconBadgeComponent } from "@shared/design-system/icon-badge/infrastructure/components/icon-badge.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { ChoiceRowComponent } from "@shared/design-system/choice-row/infrastructure/components/choice-row.component";
import { ProductionRowComponent } from "@shared/design-system/production-row/infrastructure/components/production-row.component";
import { WeekDayTabsComponent } from "@shared/design-system/week-day-tabs/infrastructure/components/week-day-tabs.component";
import { UndoBarComponent } from "@shared/design-system/undo-bar/infrastructure/components/undo-bar.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { GetKitchenDayService } from "@nutrition/kitchen/production/application/services/get-kitchen-day.service";
import { StartProductionService } from "@nutrition/kitchen/production/application/services/start-production.service";
import { UpdateRecipeStockService } from "@nutrition/kitchen/production/application/services/update-recipe-stock.service";
import { KitchenDayViewService } from "@nutrition/kitchen/production/application/services/kitchen-day-view.service";
import { CookChoiceService } from "@nutrition/kitchen/production/application/services/cook-choice.service";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { KitchenDay } from "@nutrition/kitchen/production/domain/models/kitchen-day.model";
import { KitchenToCook } from "@nutrition/kitchen/production/domain/models/kitchen-to-cook.model";
import { KitchenExpected } from "@nutrition/kitchen/production/domain/models/kitchen-expected.model";
import { CookChoice } from "@nutrition/kitchen/production/domain/models/cook-choice.model";
import { ToCookRow } from "@nutrition/kitchen/production/domain/models/to-cook-row.model";
import { ExpectedRow } from "@nutrition/kitchen/production/domain/models/expected-row.model";
import { DoneRow } from "@nutrition/kitchen/production/domain/models/done-row.model";

@Component({
  selector: "app-get-kitchen-day",
  templateUrl: "./get-kitchen-day.component.html",
  styleUrls: ["./get-kitchen-day.component.css"],
  imports: [
    ContextualTranslatePipe,
    RevealDirective,
    PageWrapperComponent,
    SplitViewComponent,
    StackComponent,
    HeadingComponent,
    TextComponent,
    ButtonComponent,
    IconBadgeComponent,
    NoteComponent,
    SectionHeaderComponent,
    EmptyStateComponent,
    ModalSheetComponent,
    ChoiceRowComponent,
    ProductionRowComponent,
    WeekDayTabsComponent,
    UndoBarComponent,
    SkeletonComponent,
    SkeletonListComponent,
    SkeletonSectionHeaderComponent,
  ],
})
export class GetKitchenDayComponent {
  private translationService = inject(TranslationService);
  private getKitchenDayService = inject(GetKitchenDayService);
  private startProductionService = inject(StartProductionService);
  private updateRecipeStockService = inject(UpdateRecipeStockService);
  private floatingToastService = inject(FloatingToastService);
  private cookChoice = inject(CookChoiceService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  protected view = inject(KitchenDayViewService);
  protected production = inject(ProductionViewService);
  protected undo = inject(UndoService);

  private readonly MODULE_PATH = "nutrition/kitchen/production";

  readonly date = input<string>("");

  loading = signal(true);
  day = signal<KitchenDay | null>(null);
  starting = signal("");
  packItem = signal<KitchenToCook | null>(null);
  packServings = signal(0);

  targetDate = computed(() => this.date() || this.view.todayIso());
  dateLine = computed(() => this.view.dateLine(this.targetDate()));
  isToday = computed(() => this.view.isToday(this.targetDate()));

  weekTabs = computed(() =>
    this.view.weekTabs(this.day()?.weekDays ?? [], this.targetDate()),
  );

  toCookRows = computed<ToCookRow[]>(() =>
    (this.day()?.toCook ?? []).map((item) => ({
      item,
      meta:
        item.inStock > 0
          ? this.t("getKitchenDay.toCook.meta", {
              demand: this.view.servings(item.demand),
              stock: this.view.servings(item.inStock),
            })
          : this.t("getKitchenDay.toCook.metaEmpty", {
              demand: this.view.servings(item.demand),
            }),
      actionLabel: item.productionId
        ? this.t("getKitchenDay.toCook.resume")
        : this.t("getKitchenDay.toCook.action"),
    })),
  );

  expectedRows = computed<ExpectedRow[]>(() =>
    (this.day()?.expected ?? []).map((item) => ({
      item,
      meta: this.t(
        1 === item.inStock
          ? "getKitchenDay.expected.metaOne"
          : "getKitchenDay.expected.meta",
        { servings: this.view.servings(item.inStock) },
      ),
    })),
  );

  doneRows = computed<DoneRow[]>(() =>
    (this.day()?.done ?? []).map((item) => ({
      item,
      meta: this.t(
        1 === item.servingsCooked
          ? "getKitchenDay.done.metaOne"
          : "getKitchenDay.done.meta",
        {
          servings: this.view.servings(item.servingsCooked),
          time: this.view.timeLabel(item.cookedAt),
        },
      ),
    })),
  );

  pendingRecipes = computed(() => this.day()?.toCook.length ?? 0);
  pendingServings = computed(() => {
    const day = this.day();

    return day ? this.view.pendingServings(day) : 0;
  });

  summaryRecipes = computed(() =>
    this.t(
      1 === this.pendingRecipes()
        ? "getKitchenDay.summary.recipesOne"
        : "getKitchenDay.summary.recipes",
      { recipes: this.pendingRecipes() },
    ),
  );

  summaryServings = computed(() =>
    this.t(
      1 === this.pendingServings()
        ? "getKitchenDay.summary.servingsOne"
        : "getKitchenDay.summary.servings",
      { servings: this.view.servings(this.pendingServings()) },
    ),
  );

  hasNothing = computed(() => 0 === this.pendingRecipes());
  expectedTitleKey = computed(() =>
    this.hasNothing()
      ? "getKitchenDay.expected.titleAlone"
      : "getKitchenDay.expected.title",
  );

  packAmounts = computed(() => {
    const item = this.packItem();

    return item ? this.cookChoice.amounts(item) : null;
  });

  packNote = computed(() => {
    const amounts = this.packAmounts();
    const item = this.packItem();
    if (!amounts || !item?.packHint) return "";

    return this.t("startProduction.pack.note", {
      article: item.packHint.articleName,
      needed: this.production.quantityLabel(
        amounts.neededQuantity,
        amounts.unit,
      ),
      packUnit: item.packHint.packUnit,
      pack: this.production.quantityLabel(amounts.packQuantity, amounts.unit),
    });
  });

  packChoices = computed<CookChoice[]>(() => {
    const amounts = this.packAmounts();
    if (!amounts) return [];

    return [
      {
        servings: amounts.deficitServings,
        title: this.t("startProduction.pack.exactTitle", {
          servings: this.view.servings(amounts.deficitServings),
        }),
        description: this.t("startProduction.pack.exactDescription", {
          needed: this.production.quantityLabel(
            amounts.neededQuantity,
            amounts.unit,
          ),
          leftover: this.production.quantityLabel(
            amounts.leftoverQuantity,
            amounts.unit,
          ),
        }),
        suggested: false,
      },
      {
        servings: amounts.suggestedServings,
        title: this.t("startProduction.pack.suggestedTitle", {
          servings: this.view.servings(amounts.suggestedServings),
        }),
        description: this.t("startProduction.pack.suggestedDescription", {
          packUnit: this.packItem()?.packHint?.packUnit ?? "",
          extra: this.view.servings(amounts.extraServings),
        }),
        suggested: true,
      },
    ];
  });

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

    toObservable(this.targetDate)
      .pipe(
        switchMap((date) => this.fetch(date, true)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  onSelectDay(date: string): void {
    if (date === this.targetDate()) return;

    this.router.navigate([], {
      queryParams: { date },
      queryParamsHandling: "merge",
    });
  }

  onToday(): void {
    this.onSelectDay(this.view.todayIso());
  }

  onCook(item: KitchenToCook): void {
    if (this.starting()) return;

    if (item.productionId) {
      this.router.navigate(["/cocina", item.productionId]);

      return;
    }

    if (item.packHint) {
      this.packItem.set(item);
      this.packServings.set(item.packHint.suggestedServings);

      return;
    }

    this.start(item.recipeId, item.deficit);
  }

  onPackChoice(choice: CookChoice): void {
    this.packServings.set(choice.servings);
  }

  onPackConfirm(): void {
    const item = this.packItem();
    if (!item) return;

    this.start(item.recipeId, this.packServings());
  }

  closePack(): void {
    this.packItem.set(null);
  }

  onNoStock(item: KitchenExpected): void {
    const previous = this.day();
    if (!previous) return;

    this.day.set({
      ...previous,
      expected: previous.expected.filter(
        (expected) => expected.recipeId !== item.recipeId,
      ),
    });

    this.writeStock(item.recipeId, 0, previous);

    this.undo.schedule({
      label: this.t("getKitchenDay.expected.cleared", { name: item.name }),
      commit: () => undefined,
      revert: () => this.writeStock(item.recipeId, item.inStock, previous),
    });
  }

  onUndoNoStock(): void {
    this.undo.undo();
  }

  private writeStock(
    recipeId: string,
    servings: number,
    fallback: KitchenDay,
  ): void {
    this.updateRecipeStockService
      .updateRecipeStock(recipeId, { servings })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.reload(),
        error: () => {
          this.day.set(fallback);
          this.showError("getKitchenDay.error.stock");
        },
      });
  }

  private start(recipeId: string, servings: number): void {
    this.starting.set(recipeId);

    this.startProductionService
      .startProduction({
        recipeId,
        cookDate: this.targetDate(),
        servingsPlanned: servings,
      })
      .pipe(
        switchMap(() => this.fetch(this.targetDate(), false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (day) => {
          this.starting.set("");
          this.packItem.set(null);
          this.openProduction(day, recipeId);
        },
        error: () => {
          this.starting.set("");
          this.showError("startProduction.error.start");
        },
      });
  }

  private openProduction(day: KitchenDay | null, recipeId: string): void {
    const productionId = day?.toCook.find(
      (item) => item.recipeId === recipeId,
    )?.productionId;

    if (!productionId) {
      this.showError("startProduction.error.start");

      return;
    }

    this.router.navigate(["/cocina", productionId]);
  }

  private reload(): void {
    this.fetch(this.targetDate(), false)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  private fetch(
    date: string,
    skeleton: boolean,
  ): Observable<KitchenDay | null> {
    this.loading.set(skeleton);

    return this.getKitchenDayService.getKitchenDay(date).pipe(
      map((response) => response.data),
      catchError(() => of(null)),
      tap((day) => {
        this.day.set(day);
        this.loading.set(false);
      }),
    );
  }

  private showError(keyTranslation: string): void {
    this.floatingToastService.showToast({
      status: 500,
      keyTranslation,
      details: [],
    });
  }
}
