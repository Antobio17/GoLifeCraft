import { Observable } from "rxjs";
import { GetDiaryGoalPort } from "../../domain/ports/get-diary-goal.port";
import { GetDiaryGoalResponse } from "../../domain/models/get-diary-goal-response.model";

export class GetDiaryGoalService {
  constructor(private getDiaryGoalPort: GetDiaryGoalPort) {}

  getDiaryGoal(): Observable<GetDiaryGoalResponse> {
    return this.getDiaryGoalPort.getDiaryGoal();
  }
}
