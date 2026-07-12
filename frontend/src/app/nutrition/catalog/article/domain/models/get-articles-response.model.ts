import { Article } from "./article.model";

export interface GetArticlesMeta {
  pageNumber: number;
  pageSize: number;
  total: number;
}

export interface GetArticlesResponse {
  meta: GetArticlesMeta;
  data: Article[];
}
