import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteRecipePort } from "../../domain/ports/delete-recipe.port";

@Injectable()
export class HttpDeleteRecipeAdapter extends DeleteRecipePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/recipe";

  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
