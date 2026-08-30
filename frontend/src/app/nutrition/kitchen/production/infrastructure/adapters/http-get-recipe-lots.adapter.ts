import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetRecipeLotsPort } from "../../domain/ports/get-recipe-lots.port";
import { GetRecipeLotsResponse } from "../../domain/models/get-recipe-lots-response.model";

@Injectable()
export class HttpGetRecipeLotsAdapter extends GetRecipeLotsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/lots";

  getRecipeLots(recipeId: string): Observable<GetRecipeLotsResponse> {
    const params = new HttpParams().set("filter[recipeId]", recipeId);

    return this.http.get<GetRecipeLotsResponse>(this.apiUrl, { params });
  }
}
