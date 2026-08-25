import { ArticleDraft } from "./article-draft.model";
import { ArticleDraftSource } from "./article-draft-source.enum";

export interface GetArticleDraftResponse {
  data: {
    source: ArticleDraftSource;
    barcode: string | null;
    globalArticleId: string | null;
    draft: ArticleDraft | null;
    lowConfidenceFields: string[];
    notes: string[];
  };
}
