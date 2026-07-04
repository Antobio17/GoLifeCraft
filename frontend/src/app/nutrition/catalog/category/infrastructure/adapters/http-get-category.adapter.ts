import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetCategoryPort } from "../../domain/ports/get-category.port";
import { GetCategoryResponse } from "../../domain/models/get-category-response.model";

@Injectable()
export class HttpGetCategoryAdapter extends GetCategoryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/category";

  getCategory(id: string): Observable<GetCategoryResponse> {
    return this.http.get<GetCategoryResponse>(this.apiUrl + "/" + id);
  }
}
