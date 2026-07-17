import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetDiaryGoalPort } from "../../domain/ports/get-diary-goal.port";
import { GetDiaryGoalResponse } from "../../domain/models/diary-goal.model";

@Injectable()
export class HttpGetDiaryGoalAdapter extends GetDiaryGoalPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary/goal";

  getDiaryGoal(): Observable<GetDiaryGoalResponse> {
    return this.http.get<GetDiaryGoalResponse>(this.apiUrl);
  }
}
