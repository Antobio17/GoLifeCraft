import { Observable } from "rxjs";
import { DiaryGoalConfig } from "../models/diary-goal.model";

export abstract class UpdateDiaryGoalPort {
  abstract updateDiaryGoal(config: DiaryGoalConfig): Observable<void>;
}
