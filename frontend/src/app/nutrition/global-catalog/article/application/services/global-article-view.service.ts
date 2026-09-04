import { Injectable, inject } from "@angular/core";
import { VisualPreferenceService } from "@shared/visual-preference/application/services/visual-preference.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { GlobalArticle } from "../../domain/models/global-article.model";
import { GlobalArticleDetail } from "../../domain/models/global-article-detail.model";
import { GlobalArticleDetailAttributes } from "../../domain/models/global-article-detail-attributes.model";
import { GlobalArticleDetailView } from "../../domain/models/global-article-detail-view.model";
import { GlobalArticleSource } from "../../domain/models/global-article-source.model";

export interface GlobalArticleCardView {
  id: string;
  emoji: string;
  imageUrl: string | null;
  name: string;
  price: string | null;
  brand: string | null;
  source: string | null;
  kcal: string | null;
  protein: string | null;
  fat: string | null;
  carbs: string | null;
}

const FALLBACK_EMOJI = "🛒";

const SOURCE_LABELS: Record<string, string> = {
  [GlobalArticleSource.Mercadona]: "Mercadona",
  [GlobalArticleSource.OpenFoodFacts]: "OpenFood",
};

const MERCADONA_IMAGE_HOST = "prod-mercadona.imgix.net";
const MERCADONA_THUMBNAIL_SIZE = 160;
const OPENFOODFACTS_IMAGE_HOST = "images.openfoodfacts.org";
const OPENFOODFACTS_THUMBNAIL_SIZE = 200;
const OPENFOODFACTS_SIZED_IMAGE = /\.(\d+)\.(\d+)\.jpg$/;
const DETAIL_IMAGE_SIZE = 400;

@Injectable()
export class GlobalArticleViewService {
  private visualPreferenceService = inject(VisualPreferenceService);

  toCard(globalArticle: GlobalArticle): GlobalArticleCardView {
    const attributes = globalArticle.attributes;

    return {
      id: globalArticle.id,
      emoji: FALLBACK_EMOJI,
      imageUrl: this.showsImages()
        ? this.thumbnailUrl(attributes.imageUrl)
        : null,
      name: attributes.name,
      price: this.price(attributes.price),
      brand: attributes.brand,
      source: this.sourceLabel(attributes.source),
      kcal: this.integer(attributes.calories),
      protein: this.decimal(attributes.protein),
      fat: this.decimal(attributes.fat),
      carbs: this.decimal(attributes.carbs),
    };
  }

  toDetail(globalArticle: GlobalArticleDetail): GlobalArticleDetailView {
    const attributes = globalArticle.attributes;

    return {
      id: globalArticle.id,
      emoji: FALLBACK_EMOJI,
      imageUrl: this.showsImages()
        ? this.sizedUrl(attributes.imageUrl, DETAIL_IMAGE_SIZE)
        : null,
      name: attributes.name,
      brand: attributes.brand,
      source: this.sourceLabel(attributes.source),
      category: attributes.categoryName,
      barcode: attributes.barcode,
      quantity: attributes.quantity,
      stores: attributes.stores,
      price: this.price(attributes.price),
      previousPrice: this.price(attributes.previousPrice),
      referencePrice: this.referencePrice(
        attributes.referencePrice,
        attributes.referenceFormat,
      ),
      bulkPrice: this.price(attributes.bulkPrice),
      hasNutrition: this.hasNutrition(attributes),
      referenceLabel: `${this.number(attributes.referenceAmount, 0)} g`,
      macros: {
        kcal: this.integer(attributes.calories),
        proteinG: this.grams(attributes.protein),
        fatG: this.grams(attributes.fat),
        carbsG: this.grams(attributes.carbs),
        saturatedG: this.grams(attributes.saturatedFat),
        sugarsG: this.grams(attributes.sugars),
        fiberG: this.grams(attributes.fiber),
        saltG: this.grams(attributes.salt),
      },
    };
  }

  private hasNutrition(attributes: GlobalArticleDetailAttributes): boolean {
    return [
      attributes.calories,
      attributes.protein,
      attributes.carbs,
      attributes.fat,
    ].some((value) => value !== null && value !== undefined);
  }

  private referencePrice(
    value: number | null,
    format: string | null,
  ): string | null {
    const price = this.price(value);
    if (price === null) return null;

    if (!format) return price;

    return `${price}/${format}`;
  }

  private grams(value: number | null): string | null {
    if (value === null || value === undefined) return null;

    return `${this.number(value, 1)} g`;
  }

  private showsImages(): boolean {
    return this.visualPreferenceService.showsImages(
      VisualSurface.GlobalCatalog,
    );
  }

  private thumbnailUrl(imageUrl: string | null): string | null {
    if (!imageUrl) return null;

    if (imageUrl.includes(MERCADONA_IMAGE_HOST)) {
      return this.sizedUrl(imageUrl, MERCADONA_THUMBNAIL_SIZE);
    }

    return this.sizedUrl(imageUrl, OPENFOODFACTS_THUMBNAIL_SIZE);
  }

  private sizedUrl(imageUrl: string | null, size: number): string | null {
    if (!imageUrl) return null;

    if (imageUrl.includes(MERCADONA_IMAGE_HOST)) {
      const path = imageUrl.split("?")[0];
      return `${path}?fit=crop&w=${size}&h=${size}`;
    }

    if (imageUrl.includes(OPENFOODFACTS_IMAGE_HOST)) {
      return imageUrl.replace(OPENFOODFACTS_SIZED_IMAGE, `.$1.${size}.jpg`);
    }

    return imageUrl;
  }

  private price(value: number | null): string | null {
    if (value === null || value === undefined) return null;

    return `${new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)} €`;
  }

  sourceLabel(source: string | null): string | null {
    if (!source) return null;

    return SOURCE_LABELS[source] ?? source;
  }

  private integer(value: number | null): string | null {
    if (value === null || value === undefined) return null;

    return this.number(Math.round(value), 0);
  }

  private decimal(value: number | null): string | null {
    if (value === null || value === undefined) return null;

    return this.number(value, 1);
  }

  private number(value: number, decimals: number): string {
    return new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: decimals,
    }).format(value);
  }
}
