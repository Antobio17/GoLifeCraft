import { Injectable, signal } from "@angular/core";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import { RecipeListItem } from "@nutrition/recipe/recipe/domain/models/recipe.model";
import { DiaryMacros } from "../../domain/models/diary.model";

export interface DiaryChoice {
  kind: "product" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  detail: string;
  macros: DiaryMacros;
}

interface ProductEntry {
  name: string;
  emoji: string;
  detail: string;
  macros: DiaryMacros;
  baseUnit: string;
  diaryUnit: string;
}

export interface DiaryEntryDefaults {
  unit: string;
  quantity: number;
}

const DEFAULT_BASE_UNIT = "g";
const DEFAULT_BASE_QUANTITY = 100;

interface RecipeEntry {
  name: string;
  emoji: string;
  detail: string;
  macros: DiaryMacros;
}

const FALLBACK_PRODUCT_EMOJI = "🍽️";
const FALLBACK_RECIPE_EMOJI = "🍲";
const DEFAULT_RECIPE_QUANTITY = 1;

@Injectable()
export class DiaryPickerService {
  private products = signal(new Map<string, ProductEntry>());
  private recipes = signal(new Map<string, RecipeEntry>());

  setProducts(articles: Article[]): void {
    const map = new Map<string, ProductEntry>();

    articles.forEach((article) => {
      const facts = article.relationships?.nutritionFacts?.data.attributes;
      const reference = facts?.referenceAmount ?? 0;
      const macros: DiaryMacros =
        facts && reference > 0
          ? {
              calories: ((facts.calories ?? 0) / reference) * 100,
              protein: ((facts.protein ?? 0) / reference) * 100,
              fat: ((facts.fat ?? 0) / reference) * 100,
              carbs: ((facts.carbs ?? 0) / reference) * 100,
            }
          : { calories: 0, protein: 0, fat: 0, carbs: 0 };
      const brand = article.attributes.brand;

      const baseUnit = article.attributes.baseUnit || DEFAULT_BASE_UNIT;

      map.set(article.id, {
        name: article.attributes.name,
        emoji: article.attributes.emoji || FALLBACK_PRODUCT_EMOJI,
        detail: brand
          ? `por 100 ${baseUnit} · ${brand}`
          : `por 100 ${baseUnit}`,
        macros,
        baseUnit,
        diaryUnit: article.attributes.diaryUnit || baseUnit,
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
        macros: recipe.attributes.perServing,
      });
    });

    this.recipes.set(map);
  }

  hasRecipes(): boolean {
    return this.recipes().size > 0;
  }

  productDefaults(refId: string): DiaryEntryDefaults {
    const entry = this.products().get(refId);
    if (!entry) {
      return { unit: DEFAULT_BASE_UNIT, quantity: DEFAULT_BASE_QUANTITY };
    }

    const isBase = entry.diaryUnit === entry.baseUnit;

    return {
      unit: entry.diaryUnit,
      quantity: isBase ? DEFAULT_BASE_QUANTITY : DEFAULT_RECIPE_QUANTITY,
    };
  }

  recipeDefaults(): DiaryEntryDefaults {
    return { unit: "", quantity: DEFAULT_RECIPE_QUANTITY };
  }

  productChoices(query: string): DiaryChoice[] {
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
        detail: entry.detail,
        macros: entry.macros,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "es"));
  }

  recipeChoices(query: string): DiaryChoice[] {
    const needle = query.trim().toLowerCase();

    return Array.from(this.recipes().entries())
      .filter(
        ([, entry]) => !needle || entry.name.toLowerCase().includes(needle),
      )
      .map(([refId, entry]) => ({
        kind: "recipe" as const,
        refId,
        name: entry.name,
        emoji: entry.emoji,
        detail: entry.detail,
        macros: entry.macros,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "es"));
  }
}
