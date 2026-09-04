import { Injectable, inject, signal } from "@angular/core";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { RecipeListItem, RecipeMacros } from "../../domain/models/recipe.model";
import { TextSearchService } from "@shared/search/application/services/text-search.service";

export interface FormIngredient {
  key: string;
  kind: "product" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  image: string | null;
  quantity: number;
  unit: string;
}

export interface FormStep {
  key: string;
  text: string;
  minutes: number | null;
}

export interface PickableIngredient {
  kind: "product" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  image: string | null;
  detail: string;
  macros: RecipeMacros;
}

interface ProductEntry {
  name: string;
  emoji: string;
  image: string | null;
  baseUnit: string;
  recipeUnit: string;
  units: string[];
  factors: Record<string, number>;
  perUnit: RecipeMacros;
}

interface RecipeEntry {
  name: string;
  emoji: string;
  image: string | null;
  perServing: RecipeMacros;
}

const FALLBACK_PRODUCT_EMOJI = "🍽️";
const FALLBACK_RECIPE_EMOJI = "🍲";
const DEFAULT_PRODUCT_QUANTITY = 100;
const DEFAULT_BASE_UNIT = "g";
const RECIPE_UNIT = "ration";

@Injectable()
export class RecipeFormService {
  private textSearch = inject(TextSearchService);
  private unitCatalog = inject(UnitCatalogService);
  private products = signal(new Map<string, ProductEntry>());
  private recipes = signal(new Map<string, RecipeEntry>());
  private counter = 0;

  setProducts(articles: Article[]): void {
    const products = new Map<string, ProductEntry>();

    articles.forEach((article) => {
      const facts = article.relationships?.nutritionFacts?.data.attributes;
      const reference = facts?.referenceAmount ?? 0;
      const perUnit: RecipeMacros =
        facts && reference > 0
          ? {
              calories: (facts.calories ?? 0) / reference,
              protein: (facts.protein ?? 0) / reference,
              fat: (facts.fat ?? 0) / reference,
              carbs: (facts.carbs ?? 0) / reference,
            }
          : { calories: 0, protein: 0, fat: 0, carbs: 0 };

      const baseUnit = article.attributes.baseUnit || DEFAULT_BASE_UNIT;
      const factors: Record<string, number> = {};
      (article.attributes.equivalences ?? []).forEach((equivalence) => {
        if ("" !== equivalence.unit && equivalence.quantity > 0) {
          factors[equivalence.unit] = equivalence.quantity;
        }
      });

      products.set(article.id, {
        name: article.attributes.name,
        emoji: article.attributes.emoji || FALLBACK_PRODUCT_EMOJI,
        image: article.attributes.image,
        baseUnit,
        recipeUnit: article.attributes.recipeUnit || baseUnit,
        units: [baseUnit, ...Object.keys(factors)],
        factors,
        perUnit,
      });
    });

    this.products.set(products);
  }

  setRecipes(recipes: RecipeListItem[]): void {
    const entries = new Map<string, RecipeEntry>();

    recipes.forEach((recipe) => {
      entries.set(recipe.id, {
        name: recipe.attributes.name,
        emoji: recipe.attributes.emoji || FALLBACK_RECIPE_EMOJI,
        image: recipe.attributes.image,
        perServing: recipe.attributes.perServing,
      });
    });

    this.recipes.set(entries);
  }

  productChoices(query: string): PickableIngredient[] {
    return Array.from(this.products().entries())
      .filter(([, entry]) => this.textSearch.matches(query, entry.name))
      .map(([refId, entry]) => ({
        kind: "product" as const,
        refId,
        name: entry.name,
        emoji: entry.emoji,
        image: entry.image,
        detail: `por 100 ${entry.baseUnit}`,
        macros: this.scale(entry.perUnit, DEFAULT_PRODUCT_QUANTITY),
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "es"));
  }

  recipeChoices(query: string, excludeId: string): PickableIngredient[] {
    return Array.from(this.recipes().entries())
      .filter(([refId]) => refId !== excludeId)
      .filter(([, entry]) => this.textSearch.matches(query, entry.name))
      .map(([refId, entry]) => ({
        kind: "recipe" as const,
        refId,
        name: entry.name,
        emoji: entry.emoji,
        image: entry.image,
        detail: "por ración",
        macros: entry.perServing,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "es"));
  }

  createStep(): FormStep {
    this.counter += 1;

    return { key: `step-${this.counter}`, text: "", minutes: null };
  }

  writtenSteps(steps: FormStep[]): FormStep[] {
    return steps.filter((step) => step.text.trim().length > 0);
  }

  createIngredient(kind: "product" | "recipe", refId: string): FormIngredient {
    this.counter += 1;
    const key = `ing-${this.counter}-${refId}`;

    if (kind === "recipe") {
      const entry = this.recipes().get(refId);
      return {
        key,
        kind,
        refId,
        name: entry?.name ?? "Receta",
        emoji: entry?.emoji ?? FALLBACK_RECIPE_EMOJI,
        image: entry?.image ?? null,
        quantity: 1,
        unit: RECIPE_UNIT,
      };
    }

    const entry = this.products().get(refId);
    const unit = entry?.recipeUnit ?? DEFAULT_BASE_UNIT;
    const isBase = !entry || unit === entry.baseUnit;

    return {
      key,
      kind,
      refId,
      name: entry?.name ?? "Artículo",
      emoji: entry?.emoji ?? FALLBACK_PRODUCT_EMOJI,
      image: entry?.image ?? null,
      quantity: isBase ? DEFAULT_PRODUCT_QUANTITY : 1,
      unit,
    };
  }

  unitLabel(ingredient: FormIngredient): string {
    if (ingredient.kind === "recipe") {
      return ingredient.unit;
    }

    const entry = this.products().get(ingredient.refId);
    if (entry && ingredient.unit === entry.baseUnit) {
      return entry.baseUnit;
    }

    return this.unitCatalog.label(ingredient.unit);
  }

  unitOptions(ingredient: FormIngredient): SelectOption[] {
    if (ingredient.kind === "recipe") {
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

  ingredientCalories(ingredient: FormIngredient): number {
    return this.contribution(ingredient).calories;
  }

  ingredientMacros(ingredient: FormIngredient): RecipeMacros {
    return this.contribution(ingredient);
  }

  totals(ingredients: FormIngredient[]): RecipeMacros {
    return ingredients.reduce<RecipeMacros>(
      (acc, ingredient) => {
        const contribution = this.contribution(ingredient);
        return {
          calories: acc.calories + contribution.calories,
          protein: acc.protein + contribution.protein,
          fat: acc.fat + contribution.fat,
          carbs: acc.carbs + contribution.carbs,
        };
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 },
    );
  }

  perServing(ingredients: FormIngredient[], servings: number): RecipeMacros {
    const divisor = Math.max(1, servings);
    const totals = this.totals(ingredients);

    return {
      calories: totals.calories / divisor,
      protein: totals.protein / divisor,
      fat: totals.fat / divisor,
      carbs: totals.carbs / divisor,
    };
  }

  private contribution(ingredient: FormIngredient): RecipeMacros {
    const quantity = this.toNumber(ingredient.quantity);

    if (ingredient.kind === "recipe") {
      const entry = this.recipes().get(ingredient.refId);
      if (!entry) return { calories: 0, protein: 0, fat: 0, carbs: 0 };

      return this.scale(entry.perServing, quantity);
    }

    const entry = this.products().get(ingredient.refId);
    if (!entry) return { calories: 0, protein: 0, fat: 0, carbs: 0 };

    const factor =
      ingredient.unit === entry.baseUnit
        ? 1
        : (entry.factors[ingredient.unit] ?? 1);

    return this.scale(entry.perUnit, quantity * factor);
  }

  private scale(macros: RecipeMacros, factor: number): RecipeMacros {
    return {
      calories: macros.calories * factor,
      protein: macros.protein * factor,
      fat: macros.fat * factor,
      carbs: macros.carbs * factor,
    };
  }

  private toNumber(value: number | string): number {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;

    const parsed = Number(String(value).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
