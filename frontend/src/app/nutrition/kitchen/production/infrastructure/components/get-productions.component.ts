import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable } from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ModuleCardComponent } from "@shared/design-system/module-card/infrastructure/components/module-card.component";
import { StatStripComponent } from "@shared/design-system/stat-strip/infrastructure/components/stat-strip.component";
import { WeekStripComponent } from "@shared/design-system/week-strip/infrastructure/components/week-strip.component";
import { ActionTileComponent } from "@shared/design-system/action-tile/infrastructure/components/action-tile.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { DatedRowComponent } from "@shared/design-system/dated-row/infrastructure/components/dated-row.component";
import { DatedRowTone } from "@shared/design-system/dated-row/domain/models/dated-row-tone.enum";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { GetProductionsService } from "@nutrition/kitchen/production/application/services/get-productions.service";
import { ProductionRangeService } from "@nutrition/kitchen/production/application/services/production-range.service";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { UpcomingProductionProposalService } from "@nutrition/kitchen/production/application/services/upcoming-production-proposal.service";
import { ProductionListItem } from "@nutrition/kitchen/production/domain/models/production-list-item.model";
import { ProductionListRow } from "@nutrition/kitchen/production/domain/models/production-list-row.model";
import { ProductionListGroup } from "@nutrition/kitchen/production/domain/models/production-list-group.model";
import { ProductionListAttributes } from "@nutrition/kitchen/production/domain/models/production-list-attributes.model";
import { ProductionStatus } from "@nutrition/kitchen/production/domain/models/production-status.model";
import { ProductionDateRange } from "@nutrition/kitchen/production/domain/models/production-date-range.model";
import { ProposalAttributes } from "@nutrition/kitchen/production/domain/models/proposal-attributes.model";
import { ProposalDayStatus } from "@nutrition/kitchen/production/domain/models/proposal-day-status.enum";
import { KitchenHero } from "@nutrition/kitchen/production/domain/models/kitchen-hero.model";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";

import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
@Component({
  selector: "app-get-productions",
  templateUrl: "./get-productions.component.html",
  imports: [
    ContextualTranslatePipe,
    RevealDirective,
    PageWrapperComponent,
    SplitViewComponent,
    StackComponent,
    GridComponent,
    ScreenHeaderComponent,
    HeadingComponent,
    TextComponent,
    ButtonComponent,
    ModuleCardComponent,
    StatStripComponent,
    WeekStripComponent,
    ActionTileComponent,
    SectionHeaderComponent,
    DatedRowComponent,
    EmojiTileComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    SkeletonLineComponent,
  ],
})
export class GetProductionsComponent extends AbstractListPageComponent<ProductionListItem> {
  private backNavigation = inject(BackNavigationService);
  private getProductionsService = inject(GetProductionsService);
  private upcomingProposal = inject(UpcomingProductionProposalService);
  private entityVisual = inject(EntityVisualService);
  protected range = inject(ProductionRangeService);
  protected view = inject(ProductionViewService);

  protected readonly modulePath = "nutrition/kitchen/production";
  protected readonly storageKey = "pageSize_productions";

  proposal = signal<ProposalAttributes | null>(null);
  week = signal<ProposalAttributes | null>(null);
  heroLoading = signal(true);

  private cookingCount = computed(
    () =>
      this.items().filter(
        (production) =>
          ProductionStatus.Cooking === production.attributes.status,
      ).length,
  );

  headerSubtitle = computed(() => {
    const cooking = this.cookingCount();

    if (0 === cooking) {
      return "";
    }

    if (1 === cooking) {
      return this.t("getProductions.count.one");
    }

    return this.translate("getProductions.count.many", { count: cooking });
  });

  hero = computed<KitchenHero | null>(() => {
    const proposal = this.proposal();

    if (null === proposal) {
      return null;
    }

    const hidden = this.upcomingProposal.hiddenCount(proposal);
    const week = this.week();

    return {
      title: this.heroTitle(proposal),
      stats: [
        {
          value: `${proposal.toCook.length}`,
          label: this.t("getProductions.hero.stats.recipes"),
        },
        {
          value: this.view.servings(
            this.upcomingProposal.totalDeficit(proposal),
          ),
          label: this.t("getProductions.hero.stats.servings"),
        },
        {
          value: `${proposal.covered.length}`,
          label: this.t("getProductions.hero.stats.covered"),
        },
      ],
      rows: this.upcomingProposal.preview(proposal).map((item) => ({
        recipeId: item.recipeId,
        name: item.name,
        emoji: item.emoji,
        imageUrl: this.entityVisual.urlOf(
          VisualSurface.Kitchen,
          AggregateImageKind.Recipe,
          item.recipeId,
          item.image,
        ),
        servings: this.translate("getProductions.hero.servings", {
          servings: this.view.servings(item.deficit),
        }),
      })),
      more:
        hidden > 0
          ? this.translate("getProductions.hero.more", { count: hidden })
          : "",
      week: this.upcomingProposal.weekDays(week, {
        [ProposalDayStatus.Covered]: this.t("getProductions.hero.week.covered"),
        [ProposalDayStatus.ToCook]: this.t("getProductions.hero.week.toCook"),
        [ProposalDayStatus.Empty]: this.t("getProductions.hero.week.empty"),
      }),
      weekTitle: this.t("getProductions.hero.week.title"),
      weekCaption: this.translate("getProductions.hero.week.caption", {
        covered: this.upcomingProposal.countDays(
          week,
          ProposalDayStatus.Covered,
        ),
        toCook: this.upcomingProposal.countDays(week, ProposalDayStatus.ToCook),
      }),
    };
  });

  tiles = computed(() => ({
    recipes: this.t("getProductions.tiles.recipes"),
    recipesMeta: this.t("getProductions.tiles.recipesMeta"),
    inventory: this.t("getProductions.tiles.inventory"),
    inventoryMeta: this.t("getProductions.tiles.inventoryMeta"),
    catalog: this.t("getProductions.tiles.catalog"),
    catalogMeta: this.t("getProductions.tiles.catalogMeta"),
  }));

  private rows = computed<ProductionListRow[]>(() =>
    this.items().map((production) => {
      const attributes = production.attributes;
      const cooking = ProductionStatus.Cooking === attributes.status;
      const title = this.range.rangeLabel(
        attributes.fromDate,
        attributes.toDate,
      );

      return {
        production,
        weekday: this.range.weekday(attributes.fromDate, "short"),
        day: this.range.dayOfMonth(attributes.fromDate),
        title,
        meta: this.translate("getProductions.meta", {
          recipes: attributes.itemCount,
          servings: this.view.servings(
            cooking ? attributes.servingsPlanned : attributes.servingsCooked,
          ),
        }),
        value: cooking
          ? this.translate("getProductions.status.cooking", {
              cooked: attributes.cookedCount,
              total: attributes.itemCount,
            })
          : this.t("getProductions.status.done"),
        valueTone: cooking ? DatedRowTone.Plain : DatedRowTone.Success,
        progress: cooking ? this.percent(attributes) : null,
        ariaLabel: this.translate("getProductions.lots.open", {
          range: title,
        }),
      };
    }),
  );

  groups = computed<ProductionListGroup[]>(() =>
    [
      {
        key: "cooking",
        title: this.t("getProductions.lots.cooking"),
        rows: this.rows().filter(
          (row) =>
            ProductionStatus.Cooking === row.production.attributes.status,
        ),
      },
      {
        key: "done",
        title: this.t("getProductions.lots.done"),
        rows: this.rows().filter(
          (row) =>
            ProductionStatus.Cooking !== row.production.attributes.status,
        ),
      },
    ]
      .filter((group) => group.rows.length > 0)
      .map((group) => ({ ...group, count: `${group.rows.length}` })),
  );

  constructor() {
    super();

    this.upcomingProposal
      .getUpcoming()
      .pipe(takeUntilDestroyed())
      .subscribe((proposal) => {
        this.proposal.set(proposal);
        this.week.set(proposal);
        this.heroLoading.set(false);
      });
  }

  protected configureList(): void {
    this.pageSize.set(100);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<ProductionListItem>> {
    return this.getProductionsService.getProductions(page, pageSize);
  }

  onCreate(): void {
    this.planRange(this.upcomingProposal.upcomingRange());
  }

  onOpen(production: ProductionListItem): void {
    this.router.navigate(["/kitchen", production.id]);
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  private planRange(range: ProductionDateRange): void {
    this.router.navigate(["/kitchen/new"], {
      queryParams: { from: range.fromDate, to: range.toDate },
    });
  }

  private heroTitle(proposal: ProposalAttributes): string {
    if (proposal.toCook.length > 0) {
      return this.translate("getProductions.hero.titlePending", {
        range: this.range.weekdayRange(proposal.fromDate, proposal.toDate),
      });
    }

    const day = this.range.weekday(proposal.toDate, "long");

    if (0 === proposal.covered.length) {
      return this.translate("getProductions.hero.titleIdle", { day });
    }

    return this.translate("getProductions.hero.titleCovered", { day });
  }

  private percent(attributes: ProductionListAttributes): number {
    if (attributes.itemCount <= 0) {
      return 0;
    }

    return Math.round((attributes.cookedCount / attributes.itemCount) * 100);
  }

  private translate(key: string, params: Record<string, unknown>): string {
    return this.translationService.translate(key, this.modulePath, params);
  }

  goBack(): void {
    this.backNavigation.back(["/diary"]);
  }
}
