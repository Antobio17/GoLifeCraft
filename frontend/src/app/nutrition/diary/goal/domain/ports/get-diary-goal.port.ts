import { Observable } from "rxjs";
import { GetDiaryGoalResponse } from "../models/diary-goal.model";

export abstract class GetDiaryGoalPort {
  abstract getDiaryGoal(): Observable<GetDiaryGoalResponse>;
}
