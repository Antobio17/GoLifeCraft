import { GlobalArticleMacroSet } from "./global-article-macro-set.model";

export interface GlobalArticleDetailView {
  id: string;
  emoji: string;
  imageUrl: string | null;
  name: string;
  brand: string | null;
  source: string | null;
  category: string | null;
  barcode: string;
  quantity: string | null;
  stores: string | null;
  price: string | null;
  previousPrice: string | null;
  referencePrice: string | null;
  bulkPrice: string | null;
  hasNutrition: boolean;
  referenceLabel: string;
  macros: GlobalArticleMacroSet;
}
