import { Injectable } from "@angular/core";
import { GlobalArticle } from "../../domain/models/global-article.model";
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

@Injectable()
export class GlobalArticleViewService {
  toCard(globalArticle: GlobalArticle): GlobalArticleCardView {
    const attributes = globalArticle.attributes;

    return {
      id: globalArticle.id,
      emoji: FALLBACK_EMOJI,
      imageUrl: this.thumbnailUrl(attributes.imageUrl),
      name: attributes.name,
      price: this.price(attributes.price),
      brand: attributes.brand,
      source: this.sourceLabel(attributes.source),
      kcal: this.integer(attributes.calories),
      protein: this.integer(attributes.protein),
      fat: this.integer(attributes.fat),
      carbs: this.integer(attributes.carbs),
    };
  }

  private thumbnailUrl(imageUrl: string | null): string | null {
    if (!imageUrl) return null;

    if (imageUrl.includes(MERCADONA_IMAGE_HOST)) {
      const path = imageUrl.split("?")[0];
      return `${path}?fit=crop&w=${MERCADONA_THUMBNAIL_SIZE}&h=${MERCADONA_THUMBNAIL_SIZE}`;
    }

    if (imageUrl.includes(OPENFOODFACTS_IMAGE_HOST)) {
      return imageUrl.replace(
        OPENFOODFACTS_SIZED_IMAGE,
        `.$1.${OPENFOODFACTS_THUMBNAIL_SIZE}.jpg`,
      );
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

    return this.number(Math.round(value));
  }

  private number(value: number): string {
    return new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: 0,
    }).format(value);
  }
}
