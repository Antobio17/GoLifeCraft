import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetCategoriesPort } from "../../domain/ports/get-categories.port";
import { GetCategoriesResponse } from "../../domain/models/get-categories-response.model";

@Injectable()
export class HttpGetCategoriesAdapter extends GetCategoriesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/categories";

  getCategories(
    page: number = 1,
    pageSize: number = 10,
    filterName?: string,
  ): Observable<GetCategoriesResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterName) {
      params = params.set("filter[name]", filterName);
    }

    return this.http.get<GetCategoriesResponse>(this.apiUrl, { params });
  }
}
