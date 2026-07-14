import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateRecipePort } from "../../domain/ports/update-recipe.port";
import { CreateRecipeRequest } from "../../domain/models/create-recipe.model";

@Injectable()
export class HttpUpdateRecipeAdapter extends UpdateRecipePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/recipe";

  updateRecipe(id: string, request: CreateRecipeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }
}
