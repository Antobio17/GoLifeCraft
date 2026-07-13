import { Observable } from "rxjs";
import { CreateArticleRequest } from "../models/create-article.model";

export abstract class CreateArticlePort {
  abstract createArticle(request: CreateArticleRequest): Observable<void>;
}
