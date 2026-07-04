import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateCategoryPort } from "../../domain/ports/create-category.port";
import { CreateCategoryRequest } from "../../domain/models/create-category.model";

@Injectable()
export class HttpCreateCategoryAdapter extends CreateCategoryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/category";

  createCategory(request: CreateCategoryRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
