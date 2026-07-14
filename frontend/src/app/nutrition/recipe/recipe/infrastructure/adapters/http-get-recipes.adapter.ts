import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetRecipesPort } from "../../domain/ports/get-recipes.port";
import { GetRecipesResponse } from "../../domain/models/get-recipes-response.model";

@Injectable()
export class HttpGetRecipesAdapter extends GetRecipesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/recipes";

  getRecipes(
    page: number = 1,
    pageSize: number = 100,
    filterName?: string,
  ): Observable<GetRecipesResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterName) {
      params = params.set("filter[name]", filterName);
    }

    return this.http.get<GetRecipesResponse>(this.apiUrl, { params });
  }
}
