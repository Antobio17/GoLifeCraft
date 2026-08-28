import { Observable } from "rxjs";
import { ConsumeDiaryMealPort } from "../../domain/ports/consume-diary-meal.port";

export class ConsumeDiaryMealService {
  constructor(private consumeDiaryMealPort: ConsumeDiaryMealPort) {}

  consumeDiaryMeal(
    date: string,
    meal: string,
    consumed: boolean,
  ): Observable<void> {
    return this.consumeDiaryMealPort.consumeDiaryMeal(date, meal, consumed);
  }
}
