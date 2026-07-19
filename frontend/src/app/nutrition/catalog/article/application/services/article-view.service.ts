import { Injectable } from "@angular/core";
import {
  Article,
  ArticleNutritionFacts,
} from "../../domain/models/article.model";

export interface ArticleCardView {
  id: string;
  emoji: string;
  name: string;
  price: string | null;
  brand: string | null;
  store: string | null;
  kcal: string | null;
  protein: string | null;
  fat: string | null;
  carbs: string | null;
}

export interface ArticleMacroSet {
  kcal: string | null;
  proteinG: string | null;
  fatG: string | null;
  carbsG: string | null;
  saturatedG: string | null;
  sugarsG: string | null;
  fiberG: string | null;
  saltG: string | null;
}

export interface ArticleDetailView {
  emoji: string;
  name: string;
  price: string | null;
  brand: string | null;
  store: string | null;
  category: string | null;
  hasNutrition: boolean;
  hasServing: boolean;
  servingLabel: string;
  per100Label: string;
  per100: ArticleMacroSet;
  serving: ArticleMacroSet | null;
}

const FALLBACK_EMOJI = "🍽️";

const UNIT_SUFFIX: Record<string, string> = {
  gram: "g",
  milliliter: "ml",
  unit: "ud",
};

@Injectable()
export class ArticleViewService {
  emoji(article: Article): string {
    return article.attributes.emoji || FALLBACK_EMOJI;
  }

  brand(article: Article): string | null {
    return article.attributes.brand;
  }

  store(article: Article): string | null {
    return article.relationships?.supermarket?.data.attributes.name ?? null;
  }

  category(article: Article): string | null {
    return article.relationships?.category?.data.attributes.name ?? null;
  }

  nutrition(article: Article): ArticleNutritionFacts | null {
    return article.relationships?.nutritionFacts?.data.attributes ?? null;
  }

  unitSuffix(article: Article): string {
    return UNIT_SUFFIX[article.attributes.recipeUnit] ?? "";
  }

  servingSize(article: Article): number | null {
    return article.attributes.servingSize ?? null;
  }

  price(article: Article): string | null {
    const value = article.attributes.price;
    if (value === null || value === undefined) return null;

    return `${this.number(value, 2)} €`;
  }

  grams(value: number | null): string | null {
    if (value === null || value === undefined) return null;

    return `${this.number(value)} g`;
  }

  integer(value: number | null): string | null {
    if (value === null || value === undefined) return null;

    return this.number(Math.round(value));
  }

  toCard(article: Article): ArticleCardView {
    const nutrition = this.nutrition(article);

    return {
      id: article.id,
      emoji: this.emoji(article),
      name: article.attributes.name,
      price: this.price(article),
      brand: this.brand(article),
      store: this.store(article),
      kcal: nutrition ? this.integer(nutrition.calories) : null,
      protein: nutrition ? this.integer(nutrition.protein) : null,
      fat: nutrition ? this.integer(nutrition.fat) : null,
      carbs: nutrition ? this.integer(nutrition.carbs) : null,
    };
  }

  toDetail(article: Article): ArticleDetailView {
    const nutrition = this.nutrition(article);
    const suffix = this.unitSuffix(article) || "g";
    const servingSize = this.servingSize(article);
    const hasServing = null !== servingSize && servingSize > 0;

    return {
      emoji: this.emoji(article),
      name: article.attributes.name,
      price: this.price(article),
      brand: this.brand(article),
      store: this.store(article),
      category: this.category(article),
      hasNutrition: null !== nutrition,
      hasServing,
      servingLabel: hasServing
        ? `${this.number(servingSize)} ${suffix}`.trim()
        : "",
      per100Label: `100 ${suffix}`.trim(),
      per100: this.scale(nutrition, 100),
      serving: hasServing ? this.scale(nutrition, servingSize) : null,
    };
  }

  private scale(
    nutrition: ArticleNutritionFacts | null,
    amount: number,
  ): ArticleMacroSet {
    const reference = nutrition?.referenceAmount ?? 0;
    if (null === nutrition || reference <= 0) {
      return {
        kcal: null,
        proteinG: null,
        fatG: null,
        carbsG: null,
        saturatedG: null,
        sugarsG: null,
        fiberG: null,
        saltG: null,
      };
    }

    const factor = amount / reference;

    return {
      kcal: this.integer(this.times(nutrition.calories, factor)),
      proteinG: this.grams(this.times(nutrition.protein, factor)),
      fatG: this.grams(this.times(nutrition.fat, factor)),
      carbsG: this.grams(this.times(nutrition.carbs, factor)),
      saturatedG: this.grams(this.times(nutrition.saturatedFat, factor)),
      sugarsG: this.grams(this.times(nutrition.sugars, factor)),
      fiberG: this.grams(this.times(nutrition.fiber, factor)),
      saltG: this.grams(this.times(nutrition.salt, factor)),
    };
  }

  private times(value: number | null, factor: number): number | null {
    if (null === value || undefined === value) return null;

    return value * factor;
  }

  private number(value: number, decimals = 1): string {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}
