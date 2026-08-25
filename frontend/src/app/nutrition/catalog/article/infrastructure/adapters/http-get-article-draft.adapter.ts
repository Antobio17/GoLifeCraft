import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetArticleDraftPort } from "../../domain/ports/get-article-draft.port";
import { GetArticleDraftResponse } from "../../domain/models/article-draft-response.model";

@Injectable()
export class HttpGetArticleDraftAdapter extends GetArticleDraftPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/article-draft";

  getArticleDraft(photos: File[]): Observable<GetArticleDraftResponse> {
    const formData = new FormData();
    photos.forEach((photo) => formData.append("photos[]", photo, photo.name));

    return this.http.post<GetArticleDraftResponse>(this.apiUrl, formData);
  }
}
