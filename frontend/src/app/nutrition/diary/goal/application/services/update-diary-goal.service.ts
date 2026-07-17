import { Observable } from "rxjs";
import { UpdateDiaryGoalPort } from "../../domain/ports/update-diary-goal.port";
import { DiaryGoalConfig } from "../../domain/models/diary-goal.model";

export class UpdateDiaryGoalService {
  constructor(private updateDiaryGoalPort: UpdateDiaryGoalPort) {}

  updateDiaryGoal(config: DiaryGoalConfig): Observable<void> {
    return this.updateDiaryGoalPort.updateDiaryGoal(config);
  }
}
