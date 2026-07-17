import { Observable } from "rxjs";
import { SetDiaryGoalDayPort } from "../../domain/ports/set-diary-goal-day.port";
import { DiaryGoalConfig } from "../../domain/models/diary-goal.model";

export class SetDiaryGoalDayService {
  constructor(private setDiaryGoalDayPort: SetDiaryGoalDayPort) {}

  setDiaryGoalDay(date: string, config: DiaryGoalConfig): Observable<void> {
    return this.setDiaryGoalDayPort.setDiaryGoalDay(date, config);
  }
}
