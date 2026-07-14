import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateRecipePort } from "../../domain/ports/create-recipe.port";
import { CreateRecipeRequest } from "../../domain/models/create-recipe.model";

@Injectable()
export class HttpCreateRecipeAdapter extends CreateRecipePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/recipe";

  createRecipe(request: CreateRecipeRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
