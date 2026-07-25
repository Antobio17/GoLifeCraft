import { Observable } from "rxjs";
import { GetGlobalArticleFacetsPort } from "../../domain/ports/get-global-article-facets.port";
import { GlobalArticleFacets } from "../../domain/models/global-article-facets.model";

export class GetGlobalArticleFacetsService {
  constructor(private getGlobalArticleFacetsPort: GetGlobalArticleFacetsPort) {}

  getGlobalArticleFacets(
    filterSource?: string,
  ): Observable<GlobalArticleFacets> {
    return this.getGlobalArticleFacetsPort.getGlobalArticleFacets(filterSource);
  }
}
