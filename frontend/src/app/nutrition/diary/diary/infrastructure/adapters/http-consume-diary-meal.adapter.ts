import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ConsumeDiaryMealPort } from "../../domain/ports/consume-diary-meal.port";

@Injectable()
export class HttpConsumeDiaryMealAdapter extends ConsumeDiaryMealPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary";

  consumeDiaryMeal(
    date: string,
    meal: string,
    consumed: boolean,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${date}/meals/${meal}/consume`, {
      consumed,
    });
  }
}
