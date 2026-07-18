import { Observable } from "rxjs";
import { GetArticleFacetsPort } from "../../domain/ports/get-article-facets.port";
import { ArticleFacets } from "../../domain/models/article-facets.model";

export class GetArticleFacetsService {
  constructor(private getArticleFacetsPort: GetArticleFacetsPort) {}

  getArticleFacets(): Observable<ArticleFacets> {
    return this.getArticleFacetsPort.getArticleFacets();
  }
}
