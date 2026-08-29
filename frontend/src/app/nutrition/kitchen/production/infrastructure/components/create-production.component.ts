import { Component, DestroyRef, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { ProductionRowComponent } from "@shared/design-system/production-row/infrastructure/components/production-row.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonSectionHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-section-header.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { GetProductionProposalService } from "@nutrition/kitchen/production/application/services/get-production-proposal.service";
import { StartProductionService } from "@nutrition/kitchen/production/application/services/start-production.service";
import { UpdateRecipeStockService } from "@nutrition/kitchen/production/application/services/update-recipe-stock.service";
import { ProductionRangeService } from "@nutrition/kitchen/production/application/services/production-range.service";
import { ProposalFormService } from "@nutrition/kitchen/production/application/services/proposal-form.service";
import { ProductionRowState } from "@shared/design-system/production-row/domain/models/production-row-state.model";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { ProposalAttributes } from "@nutrition/kitchen/production/domain/models/proposal-attributes.model";
import { ProposalCovered } from "@nutrition/kitchen/production/domain/models/proposal-covered.model";
import { ProposalRow } from "@nutrition/kitchen/production/domain/models/proposal-row.model";
import { ProposalToCook } from "@nutrition/kitchen/production/domain/models/proposal-to-cook.model";

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
    DateInputComponent,
    NumberInputComponent,
    EmojiTileComponent,
    SectionHeaderComponent,
    EmptyStateComponent,
    NoteComponent,
    ProductionRowComponent,
    SkeletonListComponent,
    SkeletonSectionHeaderComponent,
  ],
})
export class CreateProductionComponent {
  private translationService = inject(TranslationService);
  private getProductionProposalService = inject(GetProductionProposalService);
  private startProductionService = inject(StartProductionService);
  private updateRecipeStockService = inject(UpdateRecipeStockService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  protected range = inject(ProductionRangeService);
  protected form = inject(ProposalFormService);
  protected view = inject(ProductionViewService);

  private readonly MODULE_PATH = "nutrition/kitchen/production";

  protected readonly ProductionRowState = ProductionRowState;

  loading = signal(true);
  saving = signal(false);
  proposal = signal<ProposalAttributes | null>(null);

  fromDate = signal(this.range.todayIso());
  toDate = signal(this.range.addDays(this.range.todayIso(), 2));

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

  invalidRange = computed(() =>
    this.range.isInverted(this.fromDate(), this.toDate()),
  );

  rows = computed<ProposalRow[]>(() =>
    (this.proposal()?.toCook ?? []).map((item) => ({
      item,
      meta: this.rowMeta(item),
      origin: item.requiredBy.length
        ? this.t("createProduction.row.requiredBy", {
            parents: this.view.joinNames(item.requiredBy),
          })
        : this.t("createProduction.row.fromDiary"),
      hint: this.rowHint(item),
      servings: this.servings().get(item.recipeId) ?? item.deficit,
      selected: this.selected().has(item.recipeId),
    })),
  );

  coveredRows = computed(() =>
    (this.proposal()?.covered ?? []).map((item) => ({
      item,
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
      servings: this.range.servings(this.totalServings()),
    }),
  );

  private range$ = computed(() => ({
    fromDate: this.fromDate(),
    toDate: this.toDate(),
  }));

  canSubmit = computed(
    () =>
      this.form.toItems(this.selected(), this.servings()).length > 0 &&
      !this.invalidRange(),
  );

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

    toObservable(this.range$)
      .pipe(
        switchMap((range) => this.fetch(range.fromDate, range.toDate)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
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
    const next = new Set(this.selected());

    if (next.has(item.recipeId)) {
      next.delete(item.recipeId);
    } else {
      next.add(item.recipeId);
    }

    this.selected.set(next);
  }

  onServings(item: ProposalToCook, value: number): void {
    const next = new Map(this.servings());
    next.set(item.recipeId, Math.max(0, value));

    this.servings.set(next);
  }

  onUsePack(item: ProposalToCook): void {
    if (!item.packHint) return;

    this.onServings(item, item.packHint.suggestedServings);
  }

  onNoStock(item: ProposalCovered): void {
    this.updateRecipeStockService
      .updateRecipeStock(item.recipeId, { servings: 0 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  onBack(): void {
    this.router.navigate(["/cocina"]);
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
          this.router.navigate(["/cocina"]);
        },
        error: () => this.saving.set(false),
      });
  }

  private rowMeta(item: ProposalToCook): string {
    if (item.inStock <= 0 && item.inProduction <= 0) {
      return this.t("createProduction.row.metaEmpty", {
        demand: this.range.servings(item.demand),
      });
    }

    if (item.inProduction > 0) {
      return this.t("createProduction.row.metaInProduction", {
        demand: this.range.servings(item.demand),
        stock: this.range.servings(item.inStock),
        cooking: this.range.servings(item.inProduction),
      });
    }

    return this.t("createProduction.row.meta", {
      demand: this.range.servings(item.demand),
      stock: this.range.servings(item.inStock),
    });
  }

  private rowHint(item: ProposalToCook): string {
    if (!item.packHint) return "";

    return this.t("createProduction.row.packHint", {
      article: item.packHint.articleName,
      packUnit: item.packHint.packUnit,
      servings: this.range.servings(item.packHint.suggestedServings),
    });
  }

  private coveredMeta(item: ProposalCovered): string {
    if (item.inProduction > 0) {
      return this.t("createProduction.covered.metaInProduction", {
        cooking: this.range.servings(item.inProduction),
      });
    }

    return this.t("createProduction.covered.meta", {
      servings: this.range.servings(item.inStock),
    });
  }

  private reload(): void {
    this.fetch(this.fromDate(), this.toDate())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  private fetch(fromDate: string, toDate: string) {
    this.loading.set(true);

    return this.getProductionProposalService
      .getProductionProposal(fromDate, toDate)
      .pipe(
        catchError(() => of(null)),
        tap((response) => {
          const attributes = response?.data.attributes ?? null;

          this.proposal.set(attributes);
          this.selected.set(this.form.selection(attributes?.toCook ?? []));
          this.servings.set(this.form.seed(attributes?.toCook ?? []));
          this.loading.set(false);
        }),
      );
  }
}
