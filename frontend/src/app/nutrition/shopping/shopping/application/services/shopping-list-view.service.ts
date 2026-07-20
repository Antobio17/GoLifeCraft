import { Injectable, inject } from "@angular/core";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import { ArticleViewService } from "@nutrition/catalog/article/application/services/article-view.service";
import {
  ShoppingListAttributes,
  ShoppingListItemView,
} from "@nutrition/shopping/shopping/domain/models/shopping-list.model";

export const ALL_STORES = "all";
export const ALL_FILTER = "all";

export interface ShoppingStoreTab {
  key: string;
  label: string;
  count: number;
}

export interface ShoppingCategoryGroup {
  category: string;
  label: string;
  countLabel: string;
  items: ShoppingListItemView[];
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
    countSuffix: string,
  ): ShoppingCategoryGroup[] {
    const order: string[] = [];
    const buckets: Record<string, ShoppingListItemView[]> = {};

    items.forEach((item) => {
      const category = item.category || "Otros";
      if (!buckets[category]) {
        buckets[category] = [];
        order.push(category);
      }
      buckets[category].push(item);
    });

    return order.map((category) => ({
      category,
      label: category.toUpperCase(),
      countLabel: `${buckets[category].length} ${countSuffix}`,
      items: buckets[category],
    }));
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

  lineLabel(item: ShoppingListItemView): string {
    return this.money(item.lineTotal);
  }

  optimisticItem(article: Article, id: string): ShoppingListItemView {
    const unitPrice = article.attributes.price ?? null;

    return {
      id,
      articleId: article.id,
      name: article.attributes.name,
      emoji: this.articleView.emoji(article),
      brand: this.articleView.brand(article),
      store: this.articleView.store(article),
      category: this.articleView.category(article) ?? "Otros",
      unitPrice,
      quantity: 1,
      checked: false,
      lineTotal: unitPrice ?? 0,
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
