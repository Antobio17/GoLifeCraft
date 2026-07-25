import { Observable } from "rxjs";
import { GlobalArticleFacets } from "../models/global-article-facets.model";

export abstract class GetGlobalArticleFacetsPort {
  abstract getGlobalArticleFacets(
    filterSource?: string,
  ): Observable<GlobalArticleFacets>;
}
