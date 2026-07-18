export interface ArticleFacets {
  categories: string[];
  brands: string[];
  stores: string[];
}

export interface ArticleFacetsResponse {
  data: ArticleFacets;
}
