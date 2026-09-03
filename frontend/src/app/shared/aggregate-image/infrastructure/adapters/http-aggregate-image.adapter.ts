import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { AggregateImagePort } from "@shared/aggregate-image/domain/ports/aggregate-image.port";

const API_URL_BY_KIND: Record<AggregateImageKind, string> = {
  [AggregateImageKind.Article]: "/api/v1/nutrition/catalog/article",
  [AggregateImageKind.Recipe]: "/api/v1/nutrition/recipe",
};

@Injectable()
export class HttpAggregateImageAdapter extends AggregateImagePort {
  private http = inject(HttpClient);

  download(
    kind: AggregateImageKind,
    id: string,
    image: string,
  ): Observable<Blob> {
    return this.http.get(this.apiUrl(kind, id), {
      responseType: "blob",
      params: { v: image },
    });
  }

  upload(kind: AggregateImageKind, id: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append("image", file, file.name);

    return this.http.post<void>(this.apiUrl(kind, id), formData);
  }

  remove(kind: AggregateImageKind, id: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl(kind, id));
  }

  private apiUrl(kind: AggregateImageKind, id: string): string {
    return `${API_URL_BY_KIND[kind]}/${id}/image`;
  }
}
