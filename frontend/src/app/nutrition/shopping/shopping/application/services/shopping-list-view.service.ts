import { Injectable, inject } from "@angular/core";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import { ArticleViewService } from "@nutrition/catalog/article/application/services/article-view.service";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import {
  ShoppingListAttributes,
  ShoppingListItemView,
} from "@nutrition/shopping/shopping/domain/models/shopping-list.model";
import { ShoppingGroupLabels } from "@nutrition/shopping/shopping/domain/models/shopping-group-labels.model";
import { ShoppingSortMode } from "@nutrition/shopping/shopping/domain/models/shopping-sort-mode.model";
import { ShoppingRouteGroup } from "@nutrition/shopping/shopping/domain/models/shopping-route-group.model";
import { ShoppingGroupBucket } from "@nutrition/shopping/shopping/domain/models/shopping-group-bucket.model";
import { ShoppingHero } from "@nutrition/shopping/shopping/domain/models/shopping-hero.model";
import { StoreCell } from "@shared/design-system/store-cells/domain/models/store-cell.model";
import { StepBadgeState } from "@shared/design-system/step-badge/domain/models/step-badge-state.enum";
import { RouteIndexEntry } from "@shared/design-system/route-index/domain/models/route-index-entry.model";
import { QuickAddSuggestion } from "@shared/design-system/quick-add/domain/models/quick-add-suggestion.model";
import { TextSearchService } from "@shared/search/application/services/text-search.service";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";

export const ALL_STORES = "all";
export const ALL_FILTER = "all";

const OTHER_CATEGORY = "Otros";
const CUSTOM_NAME_MAX_LENGTH = 120;

export interface ShoppingPackLabels {
  perPack: string;
  need: string;
  leftover: string;
}

export interface ShoppingItemRow {
  id: string;
  articleId: string | null;
  custom: boolean;
  emoji: string;
  imageUrl: string | null;
  name: string;
  meta: string | null;
  leftoverLabel: string | null;
  quantity: number;
  checked: boolean;
  priceLabel: string;
}

export interface ShoppingSheetProduct {
  articleId: string;
  emoji: string;
  imageUrl: string | null;
  name: string;
  brand: string | null;
  store: string | null;
  priceLabel: string;
  added: boolean;
}

export interface ShoppingFacets {
  stores: string[];
  categories: string[];
  brands: string[];
}

@Injectable()
export class ShoppingListViewService {
  private textSearch = inject(TextSearchService);
  private articleView = inject(ArticleViewService);
  private entityVisual = inject(EntityVisualService);
  private unitCatalog = inject(UnitCatalogService);

  resolveTab(attributes: ShoppingListAttributes, requested: string): string {
    if (requested !== ALL_STORES && attributes.stores.includes(requested)) {
      return requested;
    }

    return ALL_STORES;
  }

  storeCells(
    attributes: ShoppingListAttributes,
    labels: ShoppingGroupLabels,
  ): StoreCell[] {
    return [
      this.storeCell(ALL_STORES, labels.all, attributes.items, labels),
      ...attributes.stores.map((store) =>
        this.storeCell(
          store,
          store,
          attributes.items.filter((item) => item.store === store),
          labels,
        ),
      ),
    ];
  }

  private storeCell(
    key: string,
    label: string,
    items: ShoppingListItemView[],
    labels: ShoppingGroupLabels,
  ): StoreCell {
    const pending = items.filter((item) => !item.checked);
    const done = items.length > 0 && pending.length === 0;

    return {
      key,
      label,
      value: this.money(this.total(pending)),
      meta: done
        ? labels.done
        : labels.pending.replace("{count}", `${pending.length}`),
      done,
    };
  }

  hasStoreCells(attributes: ShoppingListAttributes): boolean {
    return attributes.stores.length > 0;
  }

  visibleItems(
    attributes: ShoppingListAttributes,
    tab: string,
  ): ShoppingListItemView[] {
    if (tab === ALL_STORES) return attributes.items;

    return attributes.items.filter((item) => item.store === tab || !item.store);
  }

  searchedItems(
    items: ShoppingListItemView[],
    query: string,
  ): ShoppingListItemView[] {
    return items.filter((item) =>
      this.textSearch.matches(
        query,
        item.name,
        item.brand,
        item.category,
        item.store,
      ),
    );
  }

  routeGroups(
    items: ShoppingListItemView[],
    tab: string,
    storeCount: number,
    sort: ShoppingSortMode,
    labels: ShoppingGroupLabels,
    packLabels: ShoppingPackLabels,
    query = "",
  ): ShoppingRouteGroup[] {
    const byCategory = ShoppingSortMode.Category === sort;
    const showStore = byCategory && tab === ALL_STORES && storeCount > 1;
    const buckets = this.buckets(items, tab, storeCount, sort, labels);
    const nextKey = byCategory
      ? null
      : (buckets.find(
          (bucket) =>
            !bucket.muted && bucket.items.some((item) => !item.checked),
        )?.key ?? null);

    return buckets
      .filter(
        (bucket) =>
          !query.trim() || this.searchedItems(bucket.items, query).length > 0,
      )
      .map((bucket) => {
        const pending = bucket.items.filter((item) => !item.checked);

        return {
          key: bucket.key,
          domId: `shopping-group-${encodeURIComponent(bucket.key)}`,
          label: bucket.label,
          meta:
            pending.length === 0
              ? labels.done
              : labels.pending.replace("{count}", `${pending.length}`),
          badge: bucket.badge,
          state: this.groupState(bucket, pending.length, nextKey),
          items: this.searchedItems(pending, query).map((item) =>
            this.row(item, packLabels, showStore),
          ),
        };
      })
      .filter((group) => !byCategory || group.items.length > 0);
  }

  private groupState(
    bucket: ShoppingGroupBucket,
    pendingCount: number,
    nextKey: string | null,
  ): `${StepBadgeState}` {
    if (pendingCount === 0) return StepBadgeState.Done;
    if (bucket.muted) return StepBadgeState.Muted;
    if (bucket.key === nextKey) return StepBadgeState.Next;

    return StepBadgeState.Pending;
  }

  private buckets(
    items: ShoppingListItemView[],
    tab: string,
    storeCount: number,
    sort: ShoppingSortMode,
    labels: ShoppingGroupLabels,
  ): ShoppingGroupBucket[] {
    if (ShoppingSortMode.Category === sort) return this.categoryBuckets(items);
    if (tab === ALL_STORES && storeCount > 1) {
      return this.storeBuckets(items, labels);
    }

    return this.aisleBuckets(items, labels);
  }

  private storeBuckets(
    items: ShoppingListItemView[],
    labels: ShoppingGroupLabels,
  ): ShoppingGroupBucket[] {
    const stores = [
      ...new Set(
        items
          .map((item) => item.store)
          .filter((store): store is string => !!store),
      ),
    ];
    const withoutStore = items.filter((item) => !item.store);

    return [
      ...stores.map((store) => ({
        key: `store:${store}`,
        label: store,
        badge: store.charAt(0).toUpperCase(),
        muted: false,
        items: items.filter((item) => item.store === store),
      })),
      ...this.looseBucket(withoutStore, labels.withoutStore),
    ];
  }

  private aisleBuckets(
    items: ShoppingListItemView[],
    labels: ShoppingGroupLabels,
  ): ShoppingGroupBucket[] {
    const withAisle = items.filter((item) => !!item.aisle);
    const withoutAisle = items.filter((item) => !item.aisle);

    const buckets = new Map<string, ShoppingListItemView[]>();
    const positions = new Map<string, number>();

    withAisle.forEach((item) => {
      const aisle = item.aisle as string;
      const position = item.aislePosition ?? Number.MAX_SAFE_INTEGER;

      buckets.set(aisle, [...(buckets.get(aisle) ?? []), item]);
      positions.set(
        aisle,
        Math.min(positions.get(aisle) ?? position, position),
      );
    });

    const ordered = [...buckets.keys()].sort(
      (left, right) =>
        (positions.get(left) ?? 0) - (positions.get(right) ?? 0) ||
        left.localeCompare(right, "es"),
    );

    return [
      ...ordered.map((aisle, index) => ({
        key: `aisle:${aisle}`,
        label: aisle,
        badge: `${index + 1}`,
        muted: false,
        items: buckets.get(aisle) ?? [],
      })),
      ...this.looseBucket(withoutAisle, labels.withoutAisle),
    ];
  }

  private looseBucket(
    items: ShoppingListItemView[],
    label: string,
  ): ShoppingGroupBucket[] {
    if (items.length === 0) return [];

    return [{ key: "loose", label, badge: "·", muted: true, items }];
  }

  private categoryBuckets(
    items: ShoppingListItemView[],
  ): ShoppingGroupBucket[] {
    const order: string[] = [];
    const buckets: Record<string, ShoppingListItemView[]> = {};

    items.forEach((item) => {
      const category = item.category || OTHER_CATEGORY;
      if (!buckets[category]) {
        buckets[category] = [];
        order.push(category);
      }
      buckets[category].push(item);
    });

    return order.map((category) => ({
      key: `category:${category}`,
      label: category,
      badge: category.charAt(0).toUpperCase(),
      muted: false,
      items: buckets[category],
    }));
  }

  cartRows(
    items: ShoppingListItemView[],
    packLabels: ShoppingPackLabels,
    showStore: boolean,
  ): ShoppingItemRow[] {
    return items
      .filter((item) => item.checked)
      .map((item) => this.row(item, packLabels, showStore));
  }

  routeIndex(groups: ShoppingRouteGroup[]): RouteIndexEntry[] {
    return groups.map((group) => ({
      key: group.domId,
      label: group.label,
      badge: group.badge ?? "",
      state: group.state,
      meta: group.state === StepBadgeState.Done ? "✓" : `${group.items.length}`,
    }));
  }

  quickSuggestions(
    articles: Article[],
    listArticleIds: Set<string>,
    query: string,
    limit: number,
  ): QuickAddSuggestion[] {
    if (!query.trim()) return [];

    return articles
      .filter((article) => !listArticleIds.has(article.id))
      .filter((article) =>
        this.textSearch.matches(
          query,
          article.attributes.name,
          this.articleView.brand(article),
        ),
      )
      .slice(0, limit)
      .map((article) => ({
        key: article.id,
        emoji: this.articleView.emoji(article),
        imageUrl: this.entityVisual.urlOf(
          VisualSurface.Shopping,
          AggregateImageKind.Article,
          article.id,
          article.attributes.image,
        ),
        label: article.attributes.name,
        meta: [
          this.articleView.brand(article),
          this.articleView.store(article),
          this.articleView.price(article),
        ]
          .filter((part) => !!part && part !== "—")
          .join(" · "),
      }));
  }

  row(
    item: ShoppingListItemView,
    packLabels: ShoppingPackLabels,
    showStore: boolean,
  ): ShoppingItemRow {
    const meta = [
      item.brand,
      showStore ? item.store : null,
      ...this.packSizeParts(item, packLabels),
      ...this.needParts(item, packLabels),
    ].filter((part): part is string => !!part);

    return {
      id: item.id,
      articleId: item.articleId,
      custom: item.custom,
      emoji: item.emoji,
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Shopping,
        AggregateImageKind.Article,
        item.articleId,
        item.image,
      ),
      name: item.name,
      meta: meta.length ? meta.join(" · ") : null,
      leftoverLabel: this.leftoverLabel(item, packLabels),
      quantity: item.quantity,
      checked: item.checked,
      priceLabel: item.custom ? "" : this.money(item.lineTotal),
    };
  }

  leftover(item: ShoppingListItemView): number {
    if (!item.packSize || !item.baseQuantity) return 0;

    return Math.max(0, item.quantity * item.packSize - item.baseQuantity);
  }

  private packSizeParts(
    item: ShoppingListItemView,
    packLabels: ShoppingPackLabels,
  ): string[] {
    if (!item.packUnit || !item.packSize) return [];

    return [
      packLabels.perPack
        .replace("{amount}", this.amount(item.packSize, item.baseUnit))
        .replace("{unit}", this.unitCatalog.label(item.packUnit)),
    ];
  }

  private needParts(
    item: ShoppingListItemView,
    packLabels: ShoppingPackLabels,
  ): string[] {
    if (!item.baseQuantity) return [];

    return [
      packLabels.need.replace(
        "{amount}",
        this.amount(item.baseQuantity, item.baseUnit),
      ),
    ];
  }

  private leftoverLabel(
    item: ShoppingListItemView,
    packLabels: ShoppingPackLabels,
  ): string | null {
    const leftover = this.leftover(item);
    if (leftover <= 0) return null;

    return packLabels.leftover.replace(
      "{amount}",
      this.amount(leftover, item.baseUnit),
    );
  }

  private amount(value: number, baseUnit: string): string {
    return this.unitCatalog.amountLabel(value, baseUnit);
  }

  hero(items: ShoppingListItemView[]): ShoppingHero {
    const total = this.total(items);
    const cart = this.total(items.filter((item) => item.checked));
    const inCart = items.filter((item) => item.checked).length;
    const percent =
      total > 0
        ? Math.round((cart / total) * 100)
        : items.length
          ? Math.round((inCart / items.length) * 100)
          : 0;

    return {
      pendingLabel: this.money(total - cart),
      totalLabel: this.money(total),
      cartLabel: this.money(cart),
      percent,
      inCart,
      count: items.length,
    };
  }

  private total(items: ShoppingListItemView[]): number {
    return items.reduce((sum, item) => sum + item.lineTotal, 0);
  }

  optimisticItem(article: Article, id: string): ShoppingListItemView {
    const unitPrice = article.attributes.price ?? null;
    const pack = this.articleView.packEquivalence(article);

    return {
      id,
      articleId: article.id,
      custom: false,
      name: article.attributes.name,
      emoji: this.articleView.emoji(article),
      image: article.attributes.image,
      brand: this.articleView.brand(article),
      store: this.articleView.store(article),
      category: this.articleView.category(article) ?? OTHER_CATEGORY,
      aisle: null,
      aislePosition: null,
      unitPrice,
      quantity: 1,
      packUnit: pack?.unit ?? null,
      packSize: pack?.quantity ?? null,
      baseUnit: this.articleView.unitSuffix(article),
      baseQuantity: null,
      checked: false,
      lineTotal: unitPrice ?? 0,
    };
  }

  optimisticCustomItem(customName: string, id: string): ShoppingListItemView {
    return {
      id,
      articleId: null,
      custom: true,
      name: customName,
      emoji: "📝",
      image: null,
      brand: null,
      store: null,
      category: OTHER_CATEGORY,
      aisle: null,
      aislePosition: null,
      unitPrice: null,
      quantity: 1,
      packUnit: null,
      packSize: null,
      baseUnit: "g",
      baseQuantity: null,
      checked: false,
      lineTotal: 0,
    };
  }

  normalizeCustomName(customName: string): string {
    return customName
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, CUSTOM_NAME_MAX_LENGTH);
  }

  findCustomItem(
    attributes: ShoppingListAttributes,
    customName: string,
  ): ShoppingListItemView | null {
    const name = this.normalizeCustomName(customName).toLowerCase();

    return (
      attributes.items.find(
        (item) => item.custom && item.name.toLowerCase() === name,
      ) ?? null
    );
  }

  increaseItemQuantity(
    attributes: ShoppingListAttributes,
    itemId: string,
  ): ShoppingListAttributes {
    const items = attributes.items.map((item) => {
      if (item.id !== itemId) return item;

      const quantity = item.quantity + 1;

      return {
        ...item,
        quantity,
        lineTotal: Math.round((item.unitPrice ?? 0) * quantity * 100) / 100,
      };
    });

    return { ...attributes, items };
  }

  withoutItem(
    attributes: ShoppingListAttributes,
    itemId: string,
  ): ShoppingListAttributes {
    const removed = attributes.items.find((item) => item.id === itemId);
    if (!removed) return attributes;

    return {
      ...attributes,
      items: attributes.items.filter((item) => item.id !== itemId),
      itemCount: attributes.itemCount - 1,
      stores: attributes.stores.filter((store) =>
        attributes.items.some(
          (item) => item.id !== itemId && item.store === store,
        ),
      ),
      totalEstimated: attributes.totalEstimated - removed.lineTotal,
    };
  }

  addItem(
    attributes: ShoppingListAttributes,
    item: ShoppingListItemView,
  ): ShoppingListAttributes {
    const items = [...attributes.items, item];
    const stores =
      item.store && !attributes.stores.includes(item.store)
        ? [...attributes.stores, item.store]
        : attributes.stores;

    return {
      ...attributes,
      items,
      stores,
      itemCount: attributes.itemCount + 1,
      totalEstimated: attributes.totalEstimated + item.lineTotal,
    };
  }

  money(value: number | null | undefined): string {
    const amount = Number.isFinite(value) ? (value as number) : 0;

    return `${new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} €`;
  }

  facets(articles: Article[]): ShoppingFacets {
    return {
      stores: this.uniqueSorted(
        articles.map((article) => this.articleView.store(article)),
      ),
      categories: this.uniqueSorted(
        articles.map((article) => this.articleView.category(article)),
      ),
      brands: this.uniqueSorted(
        articles.map((article) => this.articleView.brand(article)),
      ),
    };
  }

  sheetProducts(
    articles: Article[],
    listArticleIds: Set<string>,
    search: string,
    storeFilter: string,
    categoryFilter: string,
    brandFilter: string,
  ): ShoppingSheetProduct[] {
    return articles
      .filter((article) =>
        this.matches(article, search, storeFilter, categoryFilter, brandFilter),
      )
      .map((article) => ({
        articleId: article.id,
        emoji: this.articleView.emoji(article),
        imageUrl: this.entityVisual.urlOf(
          VisualSurface.Shopping,
          AggregateImageKind.Article,
          article.id,
          article.attributes.image,
        ),
        name: article.attributes.name,
        brand: this.articleView.brand(article),
        store: this.articleView.store(article),
        priceLabel: this.articleView.price(article) ?? this.money(0),
        added: listArticleIds.has(article.id),
      }));
  }

  private matches(
    article: Article,
    query: string,
    storeFilter: string,
    categoryFilter: string,
    brandFilter: string,
  ): boolean {
    const store = this.articleView.store(article);
    const category = this.articleView.category(article);
    const brand = this.articleView.brand(article);

    if (storeFilter !== ALL_FILTER && store !== storeFilter) return false;
    if (categoryFilter !== ALL_FILTER && category !== categoryFilter)
      return false;
    if (brandFilter !== ALL_FILTER && brand !== brandFilter) return false;

    return this.textSearch.matches(
      query,
      article.attributes.name,
      brand,
      category,
    );
  }

  private uniqueSorted(values: (string | null)[]): string[] {
    return [
      ...new Set(
        values.filter((value): value is string => !!value && value !== "—"),
      ),
    ].sort((left, right) => left.localeCompare(right, "es"));
  }
}
