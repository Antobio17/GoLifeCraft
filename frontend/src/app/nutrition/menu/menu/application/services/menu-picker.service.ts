import { Injectable, inject, signal } from "@angular/core";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { RecipeListItem } from "@nutrition/recipe/recipe/domain/models/recipe.model";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { MenuItemKind, MenuMacros } from "../../domain/models/menu.model";
import { TextSearchService } from "@shared/search/application/services/text-search.service";

export interface MenuChoice {
  kind: MenuItemKind;
  refId: string;
  name: string;
  emoji: string;
  detail: string;
  macros: MenuMacros;
}

export interface MenuItemDefaults {
  quantity: number;
  unit: string | null;
}

interface ProductEntry {
  name: string;
  emoji: string;
  detail: string;
  baseUnit: string;
  menuUnit: string;
  units: string[];
  unitFactors: Record<string, number>;
  macrosPerBaseUnit: MenuMacros;
}

interface RecipeEntry {
  name: string;
  emoji: string;
  detail: string;
  perServing: MenuMacros;
}

export interface MenuEntryView {
  name: string;
  emoji: string;
  baseUnit: string;
}

const NO_MACROS: MenuMacros = { calories: 0, protein: 0, fat: 0, carbs: 0 };
const RECIPE_BASE_UNIT = "serving";
const REFERENCE_QUANTITY = 100;
const MISSING_NAME = "(eliminado)";

const FALLBACK_PRODUCT_EMOJI = "🍽️";
const FALLBACK_RECIPE_EMOJI = "🍲";
const DEFAULT_BASE_UNIT = "g";
const DEFAULT_BASE_QUANTITY = 100;
const DEFAULT_ALIAS_QUANTITY = 1;

@Injectable()
export class MenuPickerService {
  private textSearch = inject(TextSearchService);
  private unitCatalog = inject(UnitCatalogService);

  private products = signal(new Map<string, ProductEntry>());
  private recipes = signal(new Map<string, RecipeEntry>());

  setProducts(articles: Article[]): void {
    const map = new Map<string, ProductEntry>();

    articles.forEach((article) => {
      const facts = article.relationships?.nutritionFacts?.data.attributes;
      const reference = facts?.referenceAmount ?? 0;
      const baseUnit = article.attributes.baseUnit || DEFAULT_BASE_UNIT;
      const brand = article.attributes.brand;
      const equivalences = article.attributes.equivalences ?? [];
      const unitFactors: Record<string, number> = { [baseUnit]: 1 };
      equivalences.forEach((equivalence) => {
        unitFactors[equivalence.unit] = equivalence.quantity;
      });

      map.set(article.id, {
        name: article.attributes.name,
        emoji: article.attributes.emoji || FALLBACK_PRODUCT_EMOJI,
        detail: brand
          ? `por 100 ${baseUnit} · ${brand}`
          : `por 100 ${baseUnit}`,
        baseUnit,
        menuUnit: article.attributes.diaryUnit || baseUnit,
        units: [
          baseUnit,
          ...equivalences.map((equivalence) => equivalence.unit),
        ],
        unitFactors,
        macrosPerBaseUnit:
          reference > 0
            ? {
                calories: (facts?.calories ?? 0) / reference,
                protein: (facts?.protein ?? 0) / reference,
                fat: (facts?.fat ?? 0) / reference,
                carbs: (facts?.carbs ?? 0) / reference,
              }
            : NO_MACROS,
      });
    });

    this.products.set(map);
  }

  setRecipes(recipes: RecipeListItem[]): void {
    const map = new Map<string, RecipeEntry>();

    recipes.forEach((recipe) => {
      map.set(recipe.id, {
        name: recipe.attributes.name,
        emoji: recipe.attributes.emoji || FALLBACK_RECIPE_EMOJI,
        detail: `por ración · ${recipe.attributes.category}`,
        perServing: recipe.attributes.perServing,
      });
    });

    this.recipes.set(map);
  }

  hasRecipes(): boolean {
    return this.recipes().size > 0;
  }

  productChoices(query: string): MenuChoice[] {
    return this.choices(this.products(), "product", query, (entry) =>
      this.scale(entry.macrosPerBaseUnit, REFERENCE_QUANTITY),
    );
  }

  recipeChoices(query: string): MenuChoice[] {
    return this.choices(
      this.recipes(),
      "recipe",
      query,
      (entry) => entry.perServing,
    );
  }

  defaults(kind: MenuItemKind, refId: string): MenuItemDefaults {
    if (kind === "recipe") {
      return { quantity: DEFAULT_ALIAS_QUANTITY, unit: null };
    }

    const entry = this.products().get(refId);
    if (!entry) {
      return { quantity: DEFAULT_BASE_QUANTITY, unit: DEFAULT_BASE_UNIT };
    }

    return {
      quantity:
        entry.menuUnit === entry.baseUnit
          ? DEFAULT_BASE_QUANTITY
          : DEFAULT_ALIAS_QUANTITY,
      unit: entry.menuUnit,
    };
  }

  unitOptions(refId: string, baseUnit: string): SelectOption[] {
    const entry = this.products().get(refId);
    const units = entry ? entry.units : [baseUnit];

    return units.map((unit) => ({
      value: unit,
      label: this.unitLabel(unit),
    }));
  }

  unitLabel(unit: string): string {
    return this.unitCatalog.label(unit);
  }

  entry(kind: MenuItemKind, refId: string): MenuEntryView {
    if (kind === "recipe") {
      const recipe = this.recipes().get(refId);

      return {
        name: recipe?.name ?? MISSING_NAME,
        emoji: recipe?.emoji ?? FALLBACK_RECIPE_EMOJI,
        baseUnit: RECIPE_BASE_UNIT,
      };
    }

    const product = this.products().get(refId);

    return {
      name: product?.name ?? MISSING_NAME,
      emoji: product?.emoji ?? FALLBACK_PRODUCT_EMOJI,
      baseUnit: product?.baseUnit ?? DEFAULT_BASE_UNIT,
    };
  }

  macros(
    kind: MenuItemKind,
    refId: string,
    quantity: number,
    unit: string | null,
  ): MenuMacros {
    if (kind === "recipe") {
      const recipe = this.recipes().get(refId);

      return this.scale(recipe?.perServing ?? NO_MACROS, quantity);
    }

    const product = this.products().get(refId);
    if (!product) return NO_MACROS;

    const factor = product.unitFactors[unit ?? product.baseUnit] ?? 1;

    return this.scale(product.macrosPerBaseUnit, quantity * factor);
  }

  private scale(macros: MenuMacros, factor: number): MenuMacros {
    return {
      calories: macros.calories * factor,
      protein: macros.protein * factor,
      fat: macros.fat * factor,
      carbs: macros.carbs * factor,
    };
  }

  private choices<T extends { name: string; emoji: string; detail: string }>(
    entries: Map<string, T>,
    kind: MenuItemKind,
    query: string,
    macros: (entry: T) => MenuMacros,
  ): MenuChoice[] {
    return Array.from(entries.entries())
      .filter(([, entry]) => this.textSearch.matches(query, entry.name))
      .map(([refId, entry]) => ({
        kind,
        refId,
        name: entry.name,
        emoji: entry.emoji,
        detail: entry.detail,
        macros: macros(entry),
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "es"));
  }
}
