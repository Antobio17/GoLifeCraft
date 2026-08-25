import { Observable } from "rxjs";
import { GetArticleDraftPort } from "../../domain/ports/get-article-draft.port";
import { GetArticleDraftResponse } from "../../domain/models/article-draft-response.model";

export class GetArticleDraftService {
  constructor(private getArticleDraftPort: GetArticleDraftPort) {}

  getArticleDraft(photos: File[]): Observable<GetArticleDraftResponse> {
    return this.getArticleDraftPort.getArticleDraft(photos);
  }
}
