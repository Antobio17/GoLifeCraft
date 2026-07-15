import { Provider } from "@angular/core";
import { GetDiaryPort } from "@nutrition/diary/diary/domain/ports/get-diary.port";
import { HttpGetDiaryAdapter } from "@nutrition/diary/diary/infrastructure/adapters/http-get-diary.adapter";
import { GetDiaryService } from "@nutrition/diary/diary/application/services/get-diary.service";
import { DiaryViewService } from "@nutrition/diary/diary/application/services/diary-view.service";

export class GetDiaryProviders {
  static getProviders(): Provider[] {
    return [
      DiaryViewService,
      { provide: GetDiaryPort, useClass: HttpGetDiaryAdapter },
      {
        provide: GetDiaryService,
        useFactory: (port: GetDiaryPort) => new GetDiaryService(port),
        deps: [GetDiaryPort],
      },
    ];
  }
}
