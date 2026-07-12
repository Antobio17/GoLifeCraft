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

export interface ArticleDetailView {
  emoji: string;
  name: string;
  price: string | null;
  brand: string | null;
  store: string | null;
  category: string | null;
  referenceLabel: string;
  hasNutrition: boolean;
  kcal: string | null;
  proteinG: string | null;
  fatG: string | null;
  carbsG: string | null;
  saturatedG: string | null;
  sugarsG: string | null;
  fiberG: string | null;
  saltG: string | null;
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

  referenceLabel(article: Article): string {
    const nutrition = this.nutrition(article);
    if (!nutrition) return "";

    return `${this.number(nutrition.referenceAmount)} ${this.unitSuffix(article)}`.trim();
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

    return {
      emoji: this.emoji(article),
      name: article.attributes.name,
      price: this.price(article),
      brand: this.brand(article),
      store: this.store(article),
      category: this.category(article),
      referenceLabel: this.referenceLabel(article),
      hasNutrition: null !== nutrition,
      kcal: nutrition ? this.integer(nutrition.calories) : null,
      proteinG: this.grams(nutrition?.protein ?? null),
      fatG: this.grams(nutrition?.fat ?? null),
      carbsG: this.grams(nutrition?.carbs ?? null),
      saturatedG: this.grams(nutrition?.saturatedFat ?? null),
      sugarsG: this.grams(nutrition?.sugars ?? null),
      fiberG: this.grams(nutrition?.fiber ?? null),
      saltG: this.grams(nutrition?.salt ?? null),
    };
  }

  private number(value: number, decimals = 1): string {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}
