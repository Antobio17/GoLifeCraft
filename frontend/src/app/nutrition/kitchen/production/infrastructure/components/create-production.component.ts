import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Observable, combineLatest, of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import {
  ChoiceChipOption,
  ChoiceChipsComponent,
} from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { WeekStripComponent } from "@shared/design-system/week-strip/infrastructure/components/week-strip.component";
import { DateFieldComponent } from "@shared/design-system/date-field/infrastructure/components/date-field.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ProductionRowComponent } from "@shared/design-system/production-row/infrastructure/components/production-row.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { GetProductionProposalService } from "@nutrition/kitchen/production/application/services/get-production-proposal.service";
import { StartProductionService } from "@nutrition/kitchen/production/application/services/start-production.service";
import { UpdateRecipeStockService } from "@nutrition/pantry/recipe-stock/application/services/update-recipe-stock.service";
import { GetRecipeService } from "@nutrition/recipe/recipe/application/services/get-recipe.service";
import { RecipeDetail } from "@nutrition/recipe/recipe/domain/models/recipe.model";
import { ProductionRangePreset } from "@nutrition/kitchen/production/domain/models/production-range-preset.enum";
import { ProductionDateRange } from "@nutrition/kitchen/production/domain/models/production-date-range.model";
import { ProductionRangeService } from "@nutrition/kitchen/production/application/services/production-range.service";
import { ProposalFormService } from "@nutrition/kitchen/production/application/services/proposal-form.service";
import { ProductionRowState } from "@shared/design-system/production-row/domain/models/production-row-state.model";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { ProposalAttributes } from "@nutrition/kitchen/production/domain/models/proposal-attributes.model";
import { ProposalCovered } from "@nutrition/kitchen/production/domain/models/proposal-covered.model";
import { ProposalGroup } from "@nutrition/kitchen/production/domain/models/proposal-group.model";
import { ProposalRow } from "@nutrition/kitchen/production/domain/models/proposal-row.model";
import { ProposalToCook } from "@nutrition/kitchen/production/domain/models/proposal-to-cook.model";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";

@Component({
  selector: "app-create-production",
  templateUrl: "./create-production.component.html",
  styleUrls: ["./create-production.component.css"],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    RevealDirective,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    StackComponent,
    TextComponent,
    ButtonComponent,
    ChoiceChipsComponent,
    WeekStripComponent,
    DateFieldComponent,
    NumberInputComponent,
    EmojiTileComponent,
    SectionHeaderComponent,
    EmptyStateComponent,
    ProductionRowComponent,
    SkeletonListComponent,
    SkeletonSectionHeaderComponent,
  ],
})
export class CreateProductionComponent {
  private translationService = inject(TranslationService);
  private backNavigation = inject(BackNavigationService);
  private entityVisual = inject(EntityVisualService);
  private getProductionProposalService = inject(GetProductionProposalService);
  private startProductionService = inject(StartProductionService);
  private updateRecipeStockService = inject(UpdateRecipeStockService);
  private getRecipeService = inject(GetRecipeService);
  private destroyRef = inject(DestroyRef);
  protected range = inject(ProductionRangeService);
  protected form = inject(ProposalFormService);
  protected view = inject(ProductionViewService);

  private readonly MODULE_PATH = "nutrition/kitchen/production";

  protected readonly ProductionRowState = ProductionRowState;

  loading = signal(true);
  saving = signal(false);
  proposal = signal<ProposalAttributes | null>(null);

  readonly from = input<string>();
  readonly to = input<string>();
  readonly recipe = input<string>();

  fromDate = linkedSignal(() => {
    const from = this.from();

    return this.range.isIsoDate(from) ? from : this.range.todayIso();
  });
  toDate = linkedSignal(() => {
    const to = this.to();

    return this.range.isIsoDate(to)
      ? to
      : this.range.addDays(this.range.todayIso(), 2);
  });

  customMode = signal(false);
  private reloadTick = signal(0);

  selected = signal<ReadonlySet<string>>(new Set());
  servings = signal<ReadonlyMap<string, number>>(new Map());

  rangeLabel = computed(() =>
    this.range.rangeLabel(this.fromDate(), this.toDate()),
  );

  daysLabel = computed(() => {
    const days = this.range.dayCount(this.fromDate(), this.toDate());

    return this.t(
      1 === days ? "createProduction.dayOne" : "createProduction.days",
      {
        days,
      },
    );
  });

  preset = computed(() =>
    this.customMode()
      ? ProductionRangePreset.Custom
      : this.range.presetOf(this.fromDate(), this.toDate()),
  );

  isCustom = computed(() => ProductionRangePreset.Custom === this.preset());

  presetOptions = computed<ChoiceChipOption[]>(() =>
    this.range.presets().map((preset) => ({
      value: preset,
      label: this.t(`createProduction.preset.${preset}`),
    })),
  );

  stripDays = computed(() => this.range.stripDays(this.fromDate()));

  invalidRange = computed(() =>
    this.range.isInverted(this.fromDate(), this.toDate()),
  );

  rows = computed<ProposalRow[]>(() =>
    (this.proposal()?.toCook ?? []).map((item) => ({
      slot: this.form.slotOf(item),
      item,
      dueLabel: this.dueLabel(item),
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Kitchen,
        AggregateImageKind.Recipe,
        item.recipeId,
        item.image,
      ),
      meta: this.rowMeta(item),
      origin: this.rowOrigin(item),
      hint: this.rowHint(item),
      servings: this.servings().get(this.form.slotOf(item)) ?? item.deficit,
      selected: this.selected().has(this.form.slotOf(item)),
    })),
  );

  groups = computed<ProposalGroup[]>(() =>
    [
      {
        key: "batch",
        title: this.t("createProduction.toCookBatch"),
        rows: this.rows().filter((row) => !row.item.dueDate),
      },
      {
        key: "sameDay",
        title: this.t("createProduction.toCookSameDay"),
        rows: this.rows().filter((row) => !!row.item.dueDate),
      },
    ].filter((group) => group.rows.length > 0),
  );

  coveredRows = computed(() =>
    (this.proposal()?.covered ?? []).map((item) => ({
      item,
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Kitchen,
        AggregateImageKind.Recipe,
        item.recipeId,
        item.image,
      ),
      meta: this.coveredMeta(item),
    })),
  );

  selectedCount = computed(() => this.selected().size);
  totalServings = computed(() =>
    this.form.totalServings(this.selected(), this.servings()),
  );

  summary = computed(() =>
    this.t("createProduction.summary", {
      recipes: this.selectedCount(),
      servings: this.view.servings(this.totalServings()),
    }),
  );

  private request = computed(() => ({
    fromDate: this.fromDate(),
    toDate: this.toDate(),
    tick: this.reloadTick(),
  }));

  canSubmit = computed(
    () =>
      this.form.toItems(this.selected(), this.servings()).length > 0 &&
      !this.invalidRange(),
  );

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

    const proposal$ = toObservable(this.request).pipe(
      tap(() => this.loading.set(true)),
      switchMap((request) => this.fetch(request.fromDate, request.toDate)),
    );
    const recipe$ = toObservable(this.recipe).pipe(
      switchMap((recipeId) => this.fetchRecipe(recipeId)),
    );

    combineLatest([proposal$, recipe$])
      .pipe(takeUntilDestroyed())
      .subscribe(([proposal, recipe]) => this.apply(proposal, recipe));
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  onPreset(value: string | number): void {
    const preset = `${value}` as ProductionRangePreset;
    const range = this.range.presetRange(preset);

    this.customMode.set(null === range);

    if (!range) return;

    this.setRange(range);
  }

  onDayPicked(day: string): void {
    this.setRange(
      this.range.pickDay(
        { fromDate: this.fromDate(), toDate: this.toDate() },
        day,
      ),
    );
  }

  onWiden(): void {
    this.setRange(
      this.range.widen({ fromDate: this.fromDate(), toDate: this.toDate() }, 7),
    );
  }

  onFromDate(value: string): void {
    if (!value) return;

    this.fromDate.set(value);

    if (!this.range.isInverted(value, this.toDate())) return;

    this.toDate.set(value);
  }

  onToDate(value: string): void {
    if (!value) return;

    this.toDate.set(value);
  }

  onToggle(item: ProposalToCook): void {
    this.selected.set(
      this.view.toggle(this.selected(), this.form.slotOf(item)),
    );
  }

  onServings(item: ProposalToCook, value: number): void {
    const next = new Map(this.servings());
    next.set(this.form.slotOf(item), Math.max(0, value));

    this.servings.set(next);
  }

  onUsePack(item: ProposalToCook): void {
    if (!item.packHint) return;

    this.onServings(item, item.packHint.suggestedServings);
  }

  onNoStock(item: ProposalCovered): void {
    this.updateRecipeStockService
      .updateRecipeStock(item.recipeId, 0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadTick.update((tick) => tick + 1));
  }

  onBack(): void {
    this.backNavigation.back(["/kitchen"]);
  }

  onSubmit(): void {
    if (!this.canSubmit() || this.saving()) return;

    this.saving.set(true);

    this.startProductionService
      .startProduction({
        fromDate: this.fromDate(),
        toDate: this.toDate(),
        items: this.form.toItems(this.selected(), this.servings()),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.backNavigation.leave(["/kitchen"]);
        },
        error: () => this.saving.set(false),
      });
  }

  private dueLabel(item: ProposalToCook): string {
    if (!item.dueDate) return this.t("createProduction.row.cookNow");

    return this.t("createProduction.row.dueOn", {
      day: this.range.dayLabel(item.dueDate),
    });
  }

  private rowMeta(item: ProposalToCook): string {
    if (item.demand <= 0) {
      return this.t("createProduction.row.metaNoDemand", {
        stock: this.view.servings(item.inStock),
      });
    }

    if (item.inStock <= 0 && item.inProduction <= 0) {
      return this.t("createProduction.row.metaEmpty", {
        demand: this.view.servings(item.demand),
      });
    }

    if (item.inProduction > 0) {
      return this.t("createProduction.row.metaInProduction", {
        demand: this.view.servings(item.demand),
        stock: this.view.servings(item.inStock),
        cooking: this.view.servings(item.inProduction),
      });
    }

    return this.t("createProduction.row.meta", {
      demand: this.view.servings(item.demand),
      stock: this.view.servings(item.inStock),
    });
  }

  private rowOrigin(item: ProposalToCook): string {
    if (item.requiredBy.length) {
      return this.t("createProduction.row.requiredBy", {
        parents: this.view.joinNames(item.requiredBy),
      });
    }

    if (item.demand <= 0) return this.t("createProduction.row.fromRecipe");

    return this.t("createProduction.row.fromDiary");
  }

  private rowHint(item: ProposalToCook): string {
    if (!item.packHint) return "";

    return this.t("createProduction.row.packHint", {
      article: item.packHint.articleName,
      packUnit: item.packHint.packUnit,
      servings: this.view.servings(item.packHint.suggestedServings),
    });
  }

  private coveredMeta(item: ProposalCovered): string {
    if (item.inProduction > 0) {
      return this.t("createProduction.covered.metaInProduction", {
        cooking: this.view.servings(item.inProduction),
      });
    }

    return this.t("createProduction.covered.meta", {
      servings: this.view.servings(item.inStock),
    });
  }

  private setRange(range: ProductionDateRange): void {
    this.fromDate.set(range.fromDate);
    this.toDate.set(range.toDate);
  }

  private fetch(
    fromDate: string,
    toDate: string,
  ): Observable<ProposalAttributes | null> {
    return this.getProductionProposalService
      .getProductionProposal(fromDate, toDate)
      .pipe(
        map((response) => response.data.attributes),
        catchError(() => of(null)),
      );
  }

  private fetchRecipe(
    recipeId: string | undefined,
  ): Observable<RecipeDetail | null> {
    if (!recipeId) return of(null);

    return this.getRecipeService.getRecipe(recipeId).pipe(
      map((response) => response.data),
      catchError(() => of(null)),
    );
  }

  private apply(
    proposal: ProposalAttributes | null,
    recipe: RecipeDetail | null,
  ): void {
    const attributes = this.form.withRecipe(proposal, recipe);
    const toCook = attributes?.toCook ?? [];

    this.proposal.set(attributes);
    this.selected.set(
      recipe
        ? this.form.selectionOf(toCook, recipe.id)
        : this.form.selection(toCook),
    );
    this.servings.set(this.form.seed(toCook));
    this.loading.set(false);
  }
}
