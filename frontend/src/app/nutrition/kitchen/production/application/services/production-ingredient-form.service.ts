import { Injectable, inject, signal } from "@angular/core";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { TextSearchService } from "@shared/search/application/services/text-search.service";
import { RecipeListItem } from "@nutrition/recipe/recipe/domain/models/recipe.model";
import { EditableIngredient } from "../../domain/models/editable-ingredient.model";
import { IngredientChoice } from "../../domain/models/ingredient-choice.model";
import { ProductionIngredient } from "../../domain/models/production-ingredient.model";
import { ProductionIngredientInput } from "../../domain/models/production-ingredient-input.model";
import { ProductionSubRecipe } from "../../domain/models/production-sub-recipe.model";

interface ProductEntry {
  name: string;
  emoji: string;
  baseUnit: string;
  recipeUnit: string;
  units: string[];
}

interface RecipeEntry {
  name: string;
  emoji: string;
}

const FALLBACK_PRODUCT_EMOJI = "🍽️";
const FALLBACK_RECIPE_EMOJI = "🍲";
const DEFAULT_PRODUCT_QUANTITY = 100;
const DEFAULT_BASE_UNIT = "g";
const RECIPE_UNIT = "ration";

@Injectable()
export class ProductionIngredientFormService {
  private textSearch = inject(TextSearchService);
  private unitCatalog = inject(UnitCatalogService);
  private products = signal(new Map<string, ProductEntry>());
  private recipes = signal(new Map<string, RecipeEntry>());
  private counter = 0;

  setProducts(articles: Article[]): void {
    const products = new Map<string, ProductEntry>();

    this.byName(articles, (article) => article.attributes.name).forEach(
      (article) => {
        const baseUnit = article.attributes.baseUnit || DEFAULT_BASE_UNIT;
        const units = (article.attributes.equivalences ?? [])
          .filter(
            (equivalence) =>
              "" !== equivalence.unit && equivalence.quantity > 0,
          )
          .map((equivalence) => equivalence.unit);

        products.set(article.id, {
          name: article.attributes.name,
          emoji: article.attributes.emoji || FALLBACK_PRODUCT_EMOJI,
          baseUnit,
          recipeUnit: article.attributes.recipeUnit || baseUnit,
          units: [baseUnit, ...units],
        });
      },
    );

    this.products.set(products);
  }

  setRecipes(recipes: RecipeListItem[]): void {
    const entries = new Map<string, RecipeEntry>();

    this.byName(recipes, (recipe) => recipe.attributes.name).forEach(
      (recipe) => {
        entries.set(recipe.id, {
          name: recipe.attributes.name,
          emoji: recipe.attributes.emoji || FALLBACK_RECIPE_EMOJI,
        });
      },
    );

    this.recipes.set(entries);
  }

  fromCooked(
    ingredients: ProductionIngredient[],
    subRecipes: ProductionSubRecipe[],
  ): EditableIngredient[] {
    const articles = ingredients.map((ingredient) => {
      this.counter += 1;

      return {
        key: `ing-${this.counter}-${ingredient.articleId}`,
        kind: "article" as const,
        refId: ingredient.articleId,
        name: ingredient.name,
        emoji: ingredient.emoji,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      };
    });

    const nested = subRecipes.map((subRecipe) => {
      this.counter += 1;

      return {
        key: `ing-${this.counter}-${subRecipe.recipeId}`,
        kind: "recipe" as const,
        refId: subRecipe.recipeId,
        name: subRecipe.name,
        emoji: subRecipe.emoji,
        quantity: subRecipe.servings,
        unit: RECIPE_UNIT,
      };
    });

    return [...nested, ...articles];
  }

  createIngredient(choice: IngredientChoice): EditableIngredient {
    this.counter += 1;
    const key = `ing-${this.counter}-${choice.refId}`;

    if ("recipe" === choice.kind) {
      return {
        key,
        kind: choice.kind,
        refId: choice.refId,
        name: choice.name,
        emoji: choice.emoji,
        quantity: 1,
        unit: RECIPE_UNIT,
      };
    }

    const entry = this.products().get(choice.refId);
    const unit = entry?.recipeUnit ?? DEFAULT_BASE_UNIT;
    const isBase = !entry || unit === entry.baseUnit;

    return {
      key,
      kind: choice.kind,
      refId: choice.refId,
      name: choice.name,
      emoji: choice.emoji,
      quantity: isBase ? DEFAULT_PRODUCT_QUANTITY : 1,
      unit,
    };
  }

  unitLabel(ingredient: EditableIngredient): string {
    if ("recipe" === ingredient.kind) {
      return this.unitCatalog.label("serving");
    }

    const entry = this.products().get(ingredient.refId);
    if (entry && ingredient.unit === entry.baseUnit) {
      return entry.baseUnit;
    }

    return this.unitCatalog.label(ingredient.unit);
  }

  unitOptions(ingredient: EditableIngredient): SelectOption[] {
    if ("recipe" === ingredient.kind) {
      return [];
    }

    const entry = this.products().get(ingredient.refId);
    if (!entry) {
      return [];
    }

    return entry.units.map((unit) => ({
      value: unit,
      label: this.unitCatalog.label(unit),
    }));
  }

  productChoices(query: string): IngredientChoice[] {
    return Array.from(this.products().entries())
      .filter(([, entry]) => this.textSearch.matches(query, entry.name))
      .map(([refId, entry]) => ({
        kind: "article" as const,
        refId,
        name: entry.name,
        emoji: entry.emoji,
        detail: entry.baseUnit,
      }));
  }

  recipeChoices(query: string, excludeId: string): IngredientChoice[] {
    return Array.from(this.recipes().entries())
      .filter(([refId]) => refId !== excludeId)
      .filter(([, entry]) => this.textSearch.matches(query, entry.name))
      .map(([refId, entry]) => ({
        kind: "recipe" as const,
        refId,
        name: entry.name,
        emoji: entry.emoji,
        detail: this.unitCatalog.label("serving"),
      }));
  }

  toInputs(ingredients: EditableIngredient[]): ProductionIngredientInput[] {
    return ingredients
      .filter((ingredient) => this.toNumber(ingredient.quantity) > 0)
      .map((ingredient) => ({
        kind: ingredient.kind,
        refId: ingredient.refId,
        quantity: this.toNumber(ingredient.quantity),
        unit: "recipe" === ingredient.kind ? null : ingredient.unit,
      }));
  }

  private byName<T>(items: T[], name: (item: T) => string): T[] {
    return [...items].sort((left, right) =>
      name(left).localeCompare(name(right), "es"),
    );
  }

  private toNumber(value: number | string): number {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;

    const parsed = Number(String(value).replace(",", "."));

    return Number.isFinite(parsed) ? parsed : 0;
  }
}
