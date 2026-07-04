import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateCategoryPort } from "../../domain/ports/update-category.port";
import { UpdateCategoryRequest } from "../../domain/models/update-category.model";

@Injectable()
export class HttpUpdateCategoryAdapter extends UpdateCategoryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/category";

  updateCategory(id: string, request: UpdateCategoryRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl + "/" + id, request);
  }
}
