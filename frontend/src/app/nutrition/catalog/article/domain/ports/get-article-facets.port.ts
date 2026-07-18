import { Observable } from "rxjs";
import { ArticleFacets } from "../models/article-facets.model";

export abstract class GetArticleFacetsPort {
  abstract getArticleFacets(): Observable<ArticleFacets>;
}
