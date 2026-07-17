import { Provider } from "@angular/core";
import { GetDiaryGoalPort } from "@nutrition/diary/goal/domain/ports/get-diary-goal.port";
import { UpdateDiaryGoalPort } from "@nutrition/diary/goal/domain/ports/update-diary-goal.port";
import { HttpGetDiaryGoalAdapter } from "@nutrition/diary/goal/infrastructure/adapters/http-get-diary-goal.adapter";
import { HttpUpdateDiaryGoalAdapter } from "@nutrition/diary/goal/infrastructure/adapters/http-update-diary-goal.adapter";
import { GetDiaryGoalService } from "@nutrition/diary/goal/application/services/get-diary-goal.service";
import { UpdateDiaryGoalService } from "@nutrition/diary/goal/application/services/update-diary-goal.service";
import { DiaryGoalFormService } from "@nutrition/diary/goal/application/services/diary-goal-form.service";

export class DiaryGoalProviders {
  static getProviders(): Provider[] {
    return [
      DiaryGoalFormService,
      { provide: GetDiaryGoalPort, useClass: HttpGetDiaryGoalAdapter },
      {
        provide: GetDiaryGoalService,
        useFactory: (port: GetDiaryGoalPort) => new GetDiaryGoalService(port),
        deps: [GetDiaryGoalPort],
      },
      { provide: UpdateDiaryGoalPort, useClass: HttpUpdateDiaryGoalAdapter },
      {
        provide: UpdateDiaryGoalService,
        useFactory: (port: UpdateDiaryGoalPort) =>
          new UpdateDiaryGoalService(port),
        deps: [UpdateDiaryGoalPort],
      },
    ];
  }
}
