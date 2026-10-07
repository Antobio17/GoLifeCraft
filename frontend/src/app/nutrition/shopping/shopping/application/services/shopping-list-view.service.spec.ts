import { TestBed } from "@angular/core/testing";
import { ArticleViewService } from "@nutrition/catalog/article/application/services/article-view.service";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import {
  ShoppingListViewService,
  ALL_STORES,
} from "./shopping-list-view.service";
import {
  ShoppingListItemView,
  ShoppingListAttributes,
} from "../../domain/models/shopping-list.model";
import { ShoppingGroupLabels } from "../../domain/models/shopping-group-labels.model";
import { ShoppingSortMode } from "../../domain/models/shopping-sort-mode.model";

const LABELS: ShoppingGroupLabels = {
  all: "All",
  pending: "{count} remaining",
  done: "Done",
  withoutStore: "No store",
  withoutAisle: "No aisle",
};
const PACK_LABELS = {
  perPack: "{amount} per {unit}",
  need: "Need {amount}",
  leftover: "Left over {amount}",
};

function item(
  id: string,
  changes: Partial<ShoppingListItemView> = {},
): ShoppingListItemView {
  return {
    id,
    articleId: id,
    custom: false,
    name: id,
    emoji: "",
    image: null,
    brand: null,
    store: "Store A",
    category: "Fruit",
    aisle: "Entrance",
    aislePosition: 1,
    unitPrice: 2,
    quantity: 1,
    packUnit: null,
    packSize: null,
    baseUnit: "g",
    baseQuantity: null,
    checked: false,
    lineTotal: 2,
    ...changes,
  };
}
function list(items: ShoppingListItemView[]): ShoppingListAttributes {
  return {
    items,
    stores: [
      ...new Set(items.flatMap((entry) => (entry.store ? [entry.store] : []))),
    ],
    itemCount: items.length,
    checkedCount: items.filter((entry) => entry.checked).length,
    totalEstimated: items.reduce((sum, entry) => sum + entry.lineTotal, 0),
  };
}

describe("ShoppingListViewService route and cart", () => {
  let view: ShoppingListViewService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ShoppingListViewService,
        { provide: ArticleViewService, useValue: {} },
        { provide: UnitCatalogService, useValue: {} },
        { provide: EntityVisualService, useValue: { urlOf: () => null } },
      ],
    });
    view = TestBed.inject(ShoppingListViewService);
  });
  it("keeps custom items visible when selecting a supermarket", () => {
    const attributes = list([
      item("a"),
      item("b", { store: "Store B" }),
      item("custom", { store: null, custom: true }),
    ]);
    expect(
      view.visibleItems(attributes, "Store A").map((entry) => entry.id),
    ).toEqual(["a", "custom"]);
  });
  it("keeps completed aisles in order and highlights the next pending aisle", () => {
    const items = [
      item("milk", { aisle: "Dairy", aislePosition: 2 }),
      item("apple", { checked: true }),
      item("paper", { aisle: null, store: null }),
    ];
    const groups = view.routeGroups(
      items,
      "Store A",
      1,
      ShoppingSortMode.Aisle,
      LABELS,
      PACK_LABELS,
    );
    expect(
      groups.map((group) => [group.label, group.badge, group.state]),
    ).toEqual([
      ["Entrance", "1", "done"],
      ["Dairy", "2", "next"],
      ["No aisle", "·", "muted"],
    ]);
    expect(groups[0].items).toEqual([]);
    expect(
      view.cartRows(items, PACK_LABELS, false).map((entry) => entry.id),
    ).toEqual(["apple"]);
  });
  it("does not renumber aisles or change their anchors while searching", () => {
    const items = [
      item("apple"),
      item("milk", { aisle: "Dairy", aislePosition: 2 }),
    ];
    const all = view.routeGroups(
      items,
      "Store A",
      1,
      ShoppingSortMode.Aisle,
      LABELS,
      PACK_LABELS,
    );
    const searched = view.routeGroups(
      items,
      "Store A",
      1,
      ShoppingSortMode.Aisle,
      LABELS,
      PACK_LABELS,
      "milk",
    );
    expect(searched.length).toBe(1);
    expect(searched[0].badge).toBe("2");
    expect(searched[0].domId).toBe(all[1].domId);
  });
  it("groups multiple stores before unassigned items in the All view", () => {
    const items = [
      item("apple"),
      item("bread", { store: "Store B" }),
      item("custom", { store: null }),
    ];
    const groups = view.routeGroups(
      items,
      ALL_STORES,
      2,
      ShoppingSortMode.Aisle,
      LABELS,
      PACK_LABELS,
    );
    expect(groups.map((group) => group.label)).toEqual([
      "Store A",
      "Store B",
      "No store",
    ]);
  });
  it("offers store filtering with a single supermarket and removes stale filters", () => {
    const attributes = list([item("apple")]);
    expect(view.hasStoreCells(attributes)).toBeTrue();
    const removed = view.withoutItem(attributes, "apple");
    expect(view.resolveTab(removed, "Store A")).toBe(ALL_STORES);
    expect(removed.stores).toEqual([]);
  });
  it("tracks the amount in the cart and handles unpriced items without NaN", () => {
    const hero = view.hero([
      item("apple", { checked: true, lineTotal: 3 }),
      item("milk", { lineTotal: 7 }),
    ]);
    expect(hero.percent).toBe(30);
    expect(hero.inCart).toBe(1);
    expect(hero.pendingLabel).toBe(view.money(7));
    expect(
      view.hero([item("custom", { checked: true, lineTotal: 0, custom: true })])
        .percent,
    ).toBe(100);
  });
});
