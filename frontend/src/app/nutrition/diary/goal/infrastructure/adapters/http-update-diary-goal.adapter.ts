import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateDiaryGoalPort } from "../../domain/ports/update-diary-goal.port";
import { DiaryGoalConfig } from "../../domain/models/diary-goal.model";

@Injectable()
export class HttpUpdateDiaryGoalAdapter extends UpdateDiaryGoalPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary/goal";

  updateDiaryGoal(config: DiaryGoalConfig): Observable<void> {
    return this.http.put<void>(this.apiUrl, config);
  }
}
