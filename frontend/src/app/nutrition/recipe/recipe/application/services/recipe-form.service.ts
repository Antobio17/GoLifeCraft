import { Injectable, signal } from "@angular/core";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import { RecipeListItem, RecipeMacros } from "../../domain/models/recipe.model";

export interface FormIngredient {
  key: string;
  kind: "product" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  quantity: number;
  unit: string;
}

export interface PickableIngredient {
  kind: "product" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  detail: string;
}

interface ProductEntry {
  name: string;
  emoji: string;
  unit: string;
  servingQuantity: number;
  perUnit: RecipeMacros;
}

interface RecipeEntry {
  name: string;
  emoji: string;
  perServing: RecipeMacros;
}

const FALLBACK_PRODUCT_EMOJI = "🍽️";
const FALLBACK_RECIPE_EMOJI = "🍲";
const DEFAULT_PRODUCT_QUANTITY = 100;
const UNIT_SUFFIX: Record<string, string> = {
  gram: "g",
  milliliter: "ml",
  unit: "ud",
};

@Injectable()
export class RecipeFormService {
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

      const servingSize = article.attributes.servingSize;
      const servingQuantity =
        null !== servingSize && undefined !== servingSize && servingSize > 0
          ? servingSize
          : DEFAULT_PRODUCT_QUANTITY;

      products.set(article.id, {
        name: article.attributes.name,
        emoji: article.attributes.emoji || FALLBACK_PRODUCT_EMOJI,
        unit: UNIT_SUFFIX[article.attributes.recipeUnit] ?? "g",
        servingQuantity,
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
        perServing: recipe.attributes.perServing,
      });
    });

    this.recipes.set(entries);
  }

  productChoices(query: string): PickableIngredient[] {
    const needle = query.trim().toLowerCase();

    return Array.from(this.products().entries())
      .filter(
        ([, entry]) => !needle || entry.name.toLowerCase().includes(needle),
      )
      .map(([refId, entry]) => ({
        kind: "product" as const,
        refId,
        name: entry.name,
        emoji: entry.emoji,
        detail: `${Math.round(entry.perUnit.calories * 100)} kcal / 100${entry.unit}`,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "es"));
  }

  recipeChoices(query: string, excludeId: string): PickableIngredient[] {
    const needle = query.trim().toLowerCase();

    return Array.from(this.recipes().entries())
      .filter(([refId]) => refId !== excludeId)
      .filter(
        ([, entry]) => !needle || entry.name.toLowerCase().includes(needle),
      )
      .map(([refId, entry]) => ({
        kind: "recipe" as const,
        refId,
        name: entry.name,
        emoji: entry.emoji,
        detail: `${Math.round(entry.perServing.calories)} kcal / ración`,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "es"));
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
        quantity: 1,
        unit: "ración",
      };
    }

    const entry = this.products().get(refId);
    return {
      key,
      kind,
      refId,
      name: entry?.name ?? "Artículo",
      emoji: entry?.emoji ?? FALLBACK_PRODUCT_EMOJI,
      quantity: entry?.servingQuantity ?? DEFAULT_PRODUCT_QUANTITY,
      unit: entry?.unit ?? "g",
    };
  }

  ingredientCalories(ingredient: FormIngredient): number {
    return this.contribution(ingredient).calories;
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

    return this.scale(entry.perUnit, quantity);
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
