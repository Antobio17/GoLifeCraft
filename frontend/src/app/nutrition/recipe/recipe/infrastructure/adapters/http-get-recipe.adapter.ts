import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetRecipePort } from "../../domain/ports/get-recipe.port";
import { GetRecipeResponse } from "../../domain/models/get-recipe-response.model";

@Injectable()
export class HttpGetRecipeAdapter extends GetRecipePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/recipe";

  getRecipe(id: string): Observable<GetRecipeResponse> {
    return this.http.get<GetRecipeResponse>(`${this.apiUrl}/${id}`);
  }
}
