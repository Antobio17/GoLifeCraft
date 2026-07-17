import { Observable } from "rxjs";
import { GetDiaryGoalPort } from "../../domain/ports/get-diary-goal.port";
import { GetDiaryGoalResponse } from "../../domain/models/diary-goal.model";

export class GetDiaryGoalService {
  constructor(private getDiaryGoalPort: GetDiaryGoalPort) {}

  getDiaryGoal(): Observable<GetDiaryGoalResponse> {
    return this.getDiaryGoalPort.getDiaryGoal();
  }
}
