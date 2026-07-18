import { Injectable } from "@angular/core";
import { GlobalArticle } from "../../domain/models/global-article.model";

export interface GlobalArticleCardView {
  id: string;
  emoji: string;
  name: string;
  brand: string | null;
  store: string | null;
  kcal: string | null;
  protein: string | null;
  fat: string | null;
  carbs: string | null;
}

const FALLBACK_EMOJI = "🛒";

@Injectable()
export class GlobalArticleViewService {
  toCard(globalArticle: GlobalArticle): GlobalArticleCardView {
    const attributes = globalArticle.attributes;

    return {
      id: globalArticle.id,
      emoji: FALLBACK_EMOJI,
      name: attributes.name,
      brand: attributes.brand,
      store: this.store(attributes.stores),
      kcal: this.integer(attributes.calories),
      protein: this.integer(attributes.protein),
      fat: this.integer(attributes.fat),
      carbs: this.integer(attributes.carbs),
    };
  }

  private store(stores: string | null): string | null {
    if (!stores) return null;

    const first = stores.split(",")[0].trim();
    if ("" === first) return null;

    return first.charAt(0).toUpperCase() + first.slice(1);
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
