import { Provider } from "@angular/core";
import { AssignDiaryEntryLotPort } from "@nutrition/diary/diary/domain/ports/assign-diary-entry-lot.port";
import { HttpAssignDiaryEntryLotAdapter } from "@nutrition/diary/diary/infrastructure/adapters/http-assign-diary-entry-lot.adapter";
import { AssignDiaryEntryLotService } from "@nutrition/diary/diary/application/services/assign-diary-entry-lot.service";

export class AssignDiaryEntryLotProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: AssignDiaryEntryLotPort,
        useClass: HttpAssignDiaryEntryLotAdapter,
      },
      {
        provide: AssignDiaryEntryLotService,
        useFactory: (port: AssignDiaryEntryLotPort) =>
          new AssignDiaryEntryLotService(port),
        deps: [AssignDiaryEntryLotPort],
      },
    ];
  }
}
