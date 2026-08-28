import { Observable } from "rxjs";

export abstract class ConsumeDiaryMealPort {
  abstract consumeDiaryMeal(
    date: string,
    meal: string,
    consumed: boolean,
  ): Observable<void>;
}
