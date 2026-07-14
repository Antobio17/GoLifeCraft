import { Observable } from "rxjs";

export abstract class DeleteRecipePort {
  abstract deleteRecipe(id: string): Observable<void>;
}
