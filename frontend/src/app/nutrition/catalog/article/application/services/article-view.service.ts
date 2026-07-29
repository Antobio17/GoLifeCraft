import { Injectable, inject } from "@angular/core";
import {
  Article,
  ArticleEquivalence,
  ArticleNutritionFacts,
} from "../../domain/models/article.model";
import { UnitCatalogService } from "./unit-catalog.service";

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

export interface ArticleUnitsView {
  baseUnit: string;
  recipeUnit: string;
  diaryUnit: string;
  lines: { label: string; detail: string }[];
}

export interface ArticlePurchaseView {
  hasPack: boolean;
  packLabel: string;
  pricePerPack: string | null;
  costPer100: string | null;
}

export interface ArticleDetailView {
  emoji: string;
  name: string;
  price: string | null;
  brand: string | null;
  store: string | null;
  category: string | null;
  hasNutrition: boolean;
  hasPack: boolean;
  packLabel: string;
  per100Label: string;
  per100: ArticleMacroSet;
  pack: ArticleMacroSet | null;
  units: ArticleUnitsView;
  purchase: ArticlePurchaseView;
}

const FALLBACK_EMOJI = "🍽️";
const DEFAULT_BASE_UNIT = "g";

const LEGACY_UNIT_SUFFIX: Record<string, string> = {
  gram: "g",
  milliliter: "ml",
  unit: "ud",
};

@Injectable()
export class ArticleViewService {
  private unitCatalog = inject(UnitCatalogService);

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
    const baseUnit = article.attributes.baseUnit;
    if (baseUnit) {
      return baseUnit;
    }

    return (
      LEGACY_UNIT_SUFFIX[article.attributes.recipeUnit] ?? DEFAULT_BASE_UNIT
    );
  }

  packEquivalence(article: Article): ArticleEquivalence | null {
    const packUnit = article.attributes.packUnit;
    if (!packUnit) return null;

    return (
      (article.attributes.equivalences ?? []).find(
        (item) => item.unit === packUnit && item.quantity > 0,
      ) ?? null
    );
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

  decimal(value: number | null): string | null {
    if (value === null || value === undefined) return null;

    return this.number(value);
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
      protein: nutrition ? this.decimal(nutrition.protein) : null,
      fat: nutrition ? this.decimal(nutrition.fat) : null,
      carbs: nutrition ? this.decimal(nutrition.carbs) : null,
    };
  }

  toDetail(article: Article): ArticleDetailView {
    const nutrition = this.nutrition(article);
    const suffix = this.unitSuffix(article) || "g";
    const pack = this.packEquivalence(article);

    return {
      emoji: this.emoji(article),
      name: article.attributes.name,
      price: this.price(article),
      brand: this.brand(article),
      store: this.store(article),
      category: this.category(article),
      hasNutrition: null !== nutrition,
      hasPack: null !== pack,
      packLabel: null !== pack ? this.packAmountLabel(pack, suffix) : "",
      per100Label: `100 ${suffix}`.trim(),
      per100: this.scale(nutrition, 100),
      pack: null !== pack ? this.scale(nutrition, pack.quantity) : null,
      units: this.units(article, suffix),
      purchase: this.purchase(article, pack, suffix),
    };
  }

  private purchase(
    article: Article,
    pack: ArticleEquivalence | null,
    baseUnit: string,
  ): ArticlePurchaseView {
    const price = article.attributes.price ?? null;

    return {
      hasPack: null !== pack,
      packLabel:
        null !== pack
          ? `1 ${this.unitCatalog.label(pack.unit)} = ${this.packAmountLabel(pack, baseUnit)}`
          : "",
      pricePerPack: null !== price ? `${this.number(price, 2)} €` : null,
      costPer100:
        null !== pack && null !== price && pack.quantity > 0
          ? `${this.number((price / pack.quantity) * 100, 2)} € / 100 ${baseUnit}`
          : null,
    };
  }

  private packAmountLabel(pack: ArticleEquivalence, baseUnit: string): string {
    return `${this.number(pack.quantity)} ${baseUnit}`.trim();
  }

  private units(article: Article, baseUnit: string): ArticleUnitsView {
    const equivalences = article.attributes.equivalences ?? [];

    return {
      baseUnit,
      recipeUnit: this.unitCatalog.label(
        article.attributes.recipeUnit ?? baseUnit,
      ),
      diaryUnit: this.unitCatalog.label(
        article.attributes.diaryUnit ?? baseUnit,
      ),
      lines: equivalences.map((item) => ({
        label: `1 ${this.unitCatalog.label(item.unit)}`,
        detail: `= ${this.number(item.quantity)} ${baseUnit}`,
      })),
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
