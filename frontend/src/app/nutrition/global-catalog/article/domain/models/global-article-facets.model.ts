import { GlobalArticleCategoryCount } from "./global-article-category-count.model";

export interface GlobalArticleFacets {
  categories: string[];
  categoryCounts: GlobalArticleCategoryCount[];
}

export interface GlobalArticleFacetsResponse {
  data: GlobalArticleFacets;
}
