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

export const ALL_STORES = "all";
export const ALL_FILTER = "all";

const OTHER_CATEGORY = "Otros";
const CUSTOM_NAME_MAX_LENGTH = 120;

export interface ShoppingStoreTab {
  key: string;
  label: string;
  count: number;
}

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
  name: string;
  brand: string | null;
  store: string | null;
  quantity: number;
  checked: boolean;
  priceLabel: string;
  unitLabel: string | null;
  packLabel: string | null;
}

export interface ShoppingCategoryGroup {
  category: string;
  label: string;
  countLabel: string;
  badge: string | null;
  tag: string | null;
  items: ShoppingItemRow[];
}

export interface ShoppingSummary {
  totalLabel: string;
  boughtLabel: string;
  percent: number;
}

export interface ShoppingSheetProduct {
  articleId: string;
  emoji: string;
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
  private articleView = inject(ArticleViewService);
  private unitCatalog = inject(UnitCatalogService);

  resolveTab(attributes: ShoppingListAttributes, requested: string): string {
    if (requested !== ALL_STORES && attributes.stores.includes(requested)) {
      return requested;
    }

    return ALL_STORES;
  }

  storeTabs(
    attributes: ShoppingListAttributes,
    allLabel: string,
  ): ShoppingStoreTab[] {
    const storeTabs = attributes.stores.map((store) => ({
      key: store,
      label: store,
      count: attributes.items.filter((item) => item.store === store).length,
    }));

    return [
      { key: ALL_STORES, label: allLabel, count: attributes.items.length },
      ...storeTabs,
    ];
  }

  hasStoreTabs(attributes: ShoppingListAttributes): boolean {
    return attributes.stores.length > 1;
  }

  visibleItems(
    attributes: ShoppingListAttributes,
    tab: string,
  ): ShoppingListItemView[] {
    if (tab === ALL_STORES) return attributes.items;

    return attributes.items.filter((item) => item.store === tab);
  }

  groups(
    items: ShoppingListItemView[],
    labels: ShoppingGroupLabels,
    packLabels: ShoppingPackLabels,
    sort: ShoppingSortMode = ShoppingSortMode.Category,
  ): ShoppingCategoryGroup[] {
    if (ShoppingSortMode.Category === sort) {
      return this.categoryGroups(items, labels, packLabels, null);
    }

    return this.aisleGroups(items, labels, packLabels);
  }

  private aisleGroups(
    items: ShoppingListItemView[],
    labels: ShoppingGroupLabels,
    packLabels: ShoppingPackLabels,
  ): ShoppingCategoryGroup[] {
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
        category: aisle,
        label: aisle.toUpperCase(),
        countLabel: `${(buckets.get(aisle) ?? []).length} ${labels.count}`,
        badge: `${index + 1}`,
        tag: null,
        items: (buckets.get(aisle) ?? []).map((item) =>
          this.row(item, packLabels),
        ),
      })),
      ...this.categoryGroups(
        withoutAisle,
        labels,
        packLabels,
        labels.withoutAisle,
      ),
    ];
  }

  private categoryGroups(
    items: ShoppingListItemView[],
    labels: ShoppingGroupLabels,
    packLabels: ShoppingPackLabels,
    tag: string | null,
  ): ShoppingCategoryGroup[] {
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
      category,
      label: category.toUpperCase(),
      countLabel: `${buckets[category].length} ${labels.count}`,
      badge: null,
      tag,
      items: buckets[category].map((item) => this.row(item, packLabels)),
    }));
  }

  row(
    item: ShoppingListItemView,
    packLabels: ShoppingPackLabels,
  ): ShoppingItemRow {
    return {
      id: item.id,
      articleId: item.articleId,
      custom: item.custom,
      emoji: item.emoji,
      name: item.name,
      brand: item.brand,
      store: item.store,
      quantity: item.quantity,
      checked: item.checked,
      priceLabel: item.custom ? "" : this.money(item.lineTotal),
      unitLabel: this.unitLabel(item),
      packLabel: this.packLabel(item, packLabels),
    };
  }

  leftover(item: ShoppingListItemView): number {
    if (!item.packSize || !item.baseQuantity) return 0;

    return Math.max(0, item.quantity * item.packSize - item.baseQuantity);
  }

  private unitLabel(item: ShoppingListItemView): string | null {
    if (!item.packUnit) return null;

    return this.unitCatalog.pluralLabel(item.packUnit, item.quantity);
  }

  private packLabel(
    item: ShoppingListItemView,
    packLabels: ShoppingPackLabels,
  ): string | null {
    const parts = [
      ...this.packSizeParts(item, packLabels),
      ...this.needParts(item, packLabels),
    ];

    if (parts.length === 0) return null;

    return parts.join(" · ");
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

    const parts = [
      packLabels.need.replace(
        "{amount}",
        this.amount(item.baseQuantity, item.baseUnit),
      ),
    ];

    const leftover = this.leftover(item);
    if (leftover <= 0) return parts;

    return [
      ...parts,
      packLabels.leftover.replace(
        "{amount}",
        this.amount(leftover, item.baseUnit),
      ),
    ];
  }

  private amount(value: number, baseUnit: string): string {
    return this.unitCatalog.amountLabel(value, baseUnit);
  }

  summary(items: ShoppingListItemView[], boughtLabel: string): ShoppingSummary {
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const done = items.filter((item) => item.checked).length;
    const percent = items.length ? Math.round((done / items.length) * 100) : 0;

    return {
      totalLabel: this.money(total),
      boughtLabel: boughtLabel
        .replace("{done}", `${done}`)
        .replace("{count}", `${items.length}`),
      percent,
    };
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
    const query = search.trim().toLowerCase();

    return articles
      .filter((article) =>
        this.matches(article, query, storeFilter, categoryFilter, brandFilter),
      )
      .map((article) => ({
        articleId: article.id,
        emoji: this.articleView.emoji(article),
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
    if (!query) return true;

    const haystack = [article.attributes.name, brand, category]
      .filter((value): value is string => !!value)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  }

  private uniqueSorted(values: (string | null)[]): string[] {
    return [
      ...new Set(
        values.filter((value): value is string => !!value && value !== "—"),
      ),
    ].sort((left, right) => left.localeCompare(right, "es"));
  }
}
