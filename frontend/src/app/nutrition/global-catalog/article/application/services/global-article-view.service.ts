import { Injectable } from "@angular/core";
import { GlobalArticle } from "../../domain/models/global-article.model";
import { GlobalArticleSource } from "../../domain/models/global-article-source.model";

export interface GlobalArticleCardView {
  id: string;
  emoji: string;
  name: string;
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
  [GlobalArticleSource.OpenFoodFacts]: "Open Food Facts",
};

@Injectable()
export class GlobalArticleViewService {
  toCard(globalArticle: GlobalArticle): GlobalArticleCardView {
    const attributes = globalArticle.attributes;

    return {
      id: globalArticle.id,
      emoji: FALLBACK_EMOJI,
      name: attributes.name,
      brand: attributes.brand,
      source: this.sourceLabel(attributes.source),
      kcal: this.integer(attributes.calories),
      protein: this.integer(attributes.protein),
      fat: this.integer(attributes.fat),
      carbs: this.integer(attributes.carbs),
    };
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
