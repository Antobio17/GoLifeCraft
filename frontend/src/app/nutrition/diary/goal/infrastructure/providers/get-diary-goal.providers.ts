import { Provider } from "@angular/core";
import { GetDiaryGoalPort } from "@nutrition/diary/goal/domain/ports/get-diary-goal.port";
import { HttpGetDiaryGoalAdapter } from "@nutrition/diary/goal/infrastructure/adapters/http-get-diary-goal.adapter";
import { GetDiaryGoalService } from "@nutrition/diary/goal/application/services/get-diary-goal.service";

export class GetDiaryGoalProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetDiaryGoalPort, useClass: HttpGetDiaryGoalAdapter },
      {
        provide: GetDiaryGoalService,
        useFactory: (port: GetDiaryGoalPort) => new GetDiaryGoalService(port),
        deps: [GetDiaryGoalPort],
      },
    ];
  }
}
