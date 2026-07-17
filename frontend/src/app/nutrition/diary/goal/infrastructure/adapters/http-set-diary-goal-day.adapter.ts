import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SetDiaryGoalDayPort } from "../../domain/ports/set-diary-goal-day.port";
import { DiaryGoalConfig } from "../../domain/models/diary-goal.model";

@Injectable()
export class HttpSetDiaryGoalDayAdapter extends SetDiaryGoalDayPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary/goal/day";

  setDiaryGoalDay(date: string, config: DiaryGoalConfig): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${date}`, config);
  }
}
