import { Observable } from "rxjs";
import { DiaryGoalConfig } from "../models/diary-goal.model";

export abstract class SetDiaryGoalDayPort {
  abstract setDiaryGoalDay(
    date: string,
    config: DiaryGoalConfig,
  ): Observable<void>;
}
