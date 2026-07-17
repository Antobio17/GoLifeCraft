import { Provider } from "@angular/core";
import { UpdateDiaryGoalPort } from "@nutrition/diary/goal/domain/ports/update-diary-goal.port";
import { SetDiaryGoalDayPort } from "@nutrition/diary/goal/domain/ports/set-diary-goal-day.port";
import { HttpUpdateDiaryGoalAdapter } from "@nutrition/diary/goal/infrastructure/adapters/http-update-diary-goal.adapter";
import { HttpSetDiaryGoalDayAdapter } from "@nutrition/diary/goal/infrastructure/adapters/http-set-diary-goal-day.adapter";
import { UpdateDiaryGoalService } from "@nutrition/diary/goal/application/services/update-diary-goal.service";
import { SetDiaryGoalDayService } from "@nutrition/diary/goal/application/services/set-diary-goal-day.service";
import { DiaryGoalFormService } from "@nutrition/diary/goal/application/services/diary-goal-form.service";

export class DiaryGoalProviders {
  static getProviders(): Provider[] {
    return [
      DiaryGoalFormService,
      { provide: UpdateDiaryGoalPort, useClass: HttpUpdateDiaryGoalAdapter },
      {
        provide: UpdateDiaryGoalService,
        useFactory: (port: UpdateDiaryGoalPort) =>
          new UpdateDiaryGoalService(port),
        deps: [UpdateDiaryGoalPort],
      },
      { provide: SetDiaryGoalDayPort, useClass: HttpSetDiaryGoalDayAdapter },
      {
        provide: SetDiaryGoalDayService,
        useFactory: (port: SetDiaryGoalDayPort) =>
          new SetDiaryGoalDayService(port),
        deps: [SetDiaryGoalDayPort],
      },
    ];
  }
}
