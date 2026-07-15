import { Injectable } from "@angular/core";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import { RecipeListItem } from "@nutrition/recipe/recipe/domain/models/recipe.model";

export interface DiaryChoice {
  kind: "product" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  detail: string;
}

interface ProductEntry {
  name: string;
  emoji: string;
  detail: string;
}

interface RecipeEntry {
  name: string;
  emoji: string;
  detail: string;
}

const FALLBACK_PRODUCT_EMOJI = "🍽️";
const FALLBACK_RECIPE_EMOJI = "🍲";

@Injectable()
export class DiaryPickerService {
  private products = new Map<string, ProductEntry>();
  private recipes = new Map<string, RecipeEntry>();

  setProducts(articles: Article[]): void {
    this.products.clear();

    articles.forEach((article) => {
      const facts = article.relationships?.nutritionFacts?.data.attributes;
      const reference = facts?.referenceAmount ?? 0;
      const kcalPer100 =
        facts && reference > 0
          ? Math.round(((facts.calories ?? 0) / reference) * 100)
          : 0;
      const brand = article.attributes.brand;

      this.products.set(article.id, {
        name: article.attributes.name,
        emoji: article.attributes.emoji || FALLBACK_PRODUCT_EMOJI,
        detail: brand
          ? `${kcalPer100} kcal / 100 g · ${brand}`
          : `${kcalPer100} kcal / 100 g`,
      });
    });
  }

  setRecipes(recipes: RecipeListItem[]): void {
    this.recipes.clear();

    recipes.forEach((recipe) => {
      this.recipes.set(recipe.id, {
        name: recipe.attributes.name,
        emoji: recipe.attributes.emoji || FALLBACK_RECIPE_EMOJI,
        detail: `${Math.round(recipe.attributes.perServing.calories)} kcal / ración · ${recipe.attributes.category}`,
      });
    });
  }

  hasRecipes(): boolean {
    return this.recipes.size > 0;
  }

  productChoices(query: string): DiaryChoice[] {
    const needle = query.trim().toLowerCase();

    return Array.from(this.products.entries())
      .filter(
        ([, entry]) => !needle || entry.name.toLowerCase().includes(needle),
      )
      .map(([refId, entry]) => ({
        kind: "product" as const,
        refId,
        name: entry.name,
        emoji: entry.emoji,
        detail: entry.detail,
      }));
  }

  recipeChoices(query: string): DiaryChoice[] {
    const needle = query.trim().toLowerCase();

    return Array.from(this.recipes.entries())
      .filter(
        ([, entry]) => !needle || entry.name.toLowerCase().includes(needle),
      )
      .map(([refId, entry]) => ({
        kind: "recipe" as const,
        refId,
        name: entry.name,
        emoji: entry.emoji,
        detail: entry.detail,
      }));
  }
}
