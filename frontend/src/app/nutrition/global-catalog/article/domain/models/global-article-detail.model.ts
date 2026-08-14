import { GlobalArticleDetailAttributes } from "./global-article-detail-attributes.model";

export interface GlobalArticleDetail {
  id: string;
  type: string;
  attributes: GlobalArticleDetailAttributes;
}
