import { GlobalArticle } from "./global-article.model";

export interface GetGlobalArticlesMeta {
  pageNumber: number;
  pageSize: number;
  total: number;
}

export interface GetGlobalArticlesResponse {
  meta: GetGlobalArticlesMeta;
  data: GlobalArticle[];
}
