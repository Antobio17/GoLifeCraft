import { Observable } from "rxjs";
import { GetDiaryGoalResponse } from "../models/get-diary-goal-response.model";

export abstract class GetDiaryGoalPort {
  abstract getDiaryGoal(): Observable<GetDiaryGoalResponse>;
}
