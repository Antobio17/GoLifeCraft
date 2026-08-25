import { Observable } from "rxjs";
import { GetArticleDraftResponse } from "../models/article-draft-response.model";

export abstract class GetArticleDraftPort {
  abstract getArticleDraft(photos: File[]): Observable<GetArticleDraftResponse>;
}
